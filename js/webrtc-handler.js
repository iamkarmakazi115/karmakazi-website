// webrtc-handler.js - WebRTC Real-time Communication Handler
class WebRTCHandler {
    constructor() {
        this.localConnection = null;
        this.remoteConnection = null;
        this.dataChannel = null;
        this.isInitiator = false;
        this.localCandidates = [];
        this.remoteCandidates = [];
        this.connectionState = 'disconnected';
        this.signalingData = [];
        
        this.iceServers = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun.services.mozilla.com' }
            ]
        };
        
        this.init();
    }

    init() {
        this.setupSignalingChannel();
        console.log('WebRTC Handler initialized');
    }

    setupSignalingChannel() {
        // For GitHub Pages, we'll use a simulated signaling channel
        // In production, this would connect to a WebSocket server
        console.log('Setting up simulated signaling channel');
        
        // Simulate signaling server with localStorage for same-origin testing
        this.setupLocalStorageSignaling();
    }

    setupLocalStorageSignaling() {
        // Listen for signaling messages in localStorage
        window.addEventListener('storage', (event) => {
            if (event.key && event.key.startsWith('webrtc_signal_')) {
                const roomId = event.key.replace('webrtc_signal_', '');
                if (roomId === this.currentRoomId && event.newValue) {
                    const signal = JSON.parse(event.newValue);
                    this.handleSignalingMessage(signal);
                }
            }
        });

        // Simulate periodic signaling check
        setInterval(() => {
            this.checkForSignalingMessages();
        }, 1000);
    }

    checkForSignalingMessages() {
        if (!this.currentRoomId) return;
        
        const key = `webrtc_signal_${this.currentRoomId}`;
        const stored = localStorage.getItem(key);
        
        if (stored) {
            try {
                const signals = JSON.parse(stored);
                signals.forEach(signal => {
                    if (!this.processedSignals.has(signal.id)) {
                        this.handleSignalingMessage(signal);
                        this.processedSignals.add(signal.id);
                    }
                });
            } catch (error) {
                console.error('Error processing signaling messages:', error);
            }
        }
    }

    async createPeerConnection(roomId) {
        this.currentRoomId = roomId;
        this.processedSignals = new Set();
        
        try {
            this.localConnection = new RTCPeerConnection(this.iceServers);
            
            // Set up event handlers
            this.setupPeerConnectionEvents();
            
            // Create data channel for chat messages
            this.dataChannel = this.localConnection.createDataChannel('chat', {
                ordered: true
            });
            this.setupDataChannel(this.dataChannel);
            
            // Handle incoming data channel
            this.localConnection.ondatachannel = (event) => {
                const receiveChannel = event.channel;
                this.setupDataChannel(receiveChannel);
            };
            
            console.log('Peer connection created for room:', roomId);
            return true;
            
        } catch (error) {
            console.error('Failed to create peer connection:', error);
            return false;
        }
    }

    setupPeerConnectionEvents() {
        // ICE candidate gathering
        this.localConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.sendSignalingMessage({
                    type: 'ice-candidate',
                    candidate: event.candidate,
                    timestamp: Date.now(),
                    id: this.generateMessageId()
                });
            }
        };

        // Connection state changes
        this.localConnection.onconnectionstatechange = () => {
            const state = this.localConnection.connectionState;
            console.log('Connection state:', state);
            this.connectionState = state;
            this.onConnectionStateChange(state);
        };

        // ICE connection state changes
        this.localConnection.oniceconnectionstatechange = () => {
            const state = this.localConnection.iceConnectionState;
            console.log('ICE connection state:', state);
            this.onICEConnectionStateChange(state);
        };

        // Remote stream handling
        this.localConnection.ontrack = (event) => {
            console.log('Received remote stream');
            this.onRemoteStream(event.streams[0]);
        };
    }

    setupDataChannel(channel) {
        channel.onopen = () => {
            console.log('Data channel opened');
            this.onDataChannelOpen();
        };

        channel.onclose = () => {
            console.log('Data channel closed');
            this.onDataChannelClose();
        };

        channel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.onDataChannelMessage(data);
        };

        channel.onerror = (error) => {
            console.error('Data channel error:', error);
        };
    }

    async startCall(localStream) {
        this.isInitiator = true;
        
        // Add local stream to connection
        if (localStream) {
            localStream.getTracks().forEach(track => {
                this.localConnection.addTrack(track, localStream);
            });
        }
        
        try {
            // Create offer
            const offer = await this.localConnection.createOffer({
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
            });
            
            await this.localConnection.setLocalDescription(offer);
            
            // Send offer through signaling
            this.sendSignalingMessage({
                type: 'offer',
                offer: offer,
                timestamp: Date.now(),
                id: this.generateMessageId()
            });
            
            console.log('Call initiated');
            
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    }

    async handleOffer(offer) {
        try {
            await this.localConnection.setRemoteDescription(offer);
            
            // Create answer
            const answer = await this.localConnection.createAnswer();
            await this.localConnection.setLocalDescription(answer);
            
            // Send answer through signaling
            this.sendSignalingMessage({
                type: 'answer',
                answer: answer,
                timestamp: Date.now(),
                id: this.generateMessageId()
            });
            
            console.log('Offer handled, answer sent');
            
        } catch (error) {
            console.error('Failed to handle offer:', error);
        }
    }

    async handleAnswer(answer) {
        try {
            await this.localConnection.setRemoteDescription(answer);
            console.log('Answer handled');
            
        } catch (error) {
            console.error('Failed to handle answer:', error);
        }
    }

    async handleICECandidate(candidate) {
        try {
            await this.localConnection.addIceCandidate(candidate);
            console.log('ICE candidate added');
            
        } catch (error) {
            console.error('Failed to add ICE candidate:', error);
        }
    }

    sendSignalingMessage(message) {
        if (!this.currentRoomId) return;
        
        const key = `webrtc_signal_${this.currentRoomId}`;
        const existing = localStorage.getItem(key);
        let signals = [];
        
        if (existing) {
            try {
                signals = JSON.parse(existing);
            } catch (error) {
                signals = [];
            }
        }
        
        signals.push(message);
        
        // Keep only recent messages to prevent localStorage bloat
        if (signals.length > 100) {
            signals = signals.slice(-50);
        }
        
        localStorage.setItem(key, JSON.stringify(signals));
    }

    handleSignalingMessage(message) {
        switch (message.type) {
            case 'offer':
                if (!this.isInitiator) {
                    this.handleOffer(message.offer);
                }
                break;
                
            case 'answer':
                if (this.isInitiator) {
                    this.handleAnswer(message.answer);
                }
                break;
                
            case 'ice-candidate':
                this.handleICECandidate(message.candidate);
                break;
                
            case 'chat-message':
                this.onDataChannelMessage(message.data);
                break;
                
            default:
                console.log('Unknown signaling message type:', message.type);
        }
    }

    sendChatMessage(message) {
        const data = {
            type: 'chat',
            content: message.content,
            username: message.username,
            timestamp: message.timestamp
        };
        
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
        } else {
            // Fallback to signaling channel
            this.sendSignalingMessage({
                type: 'chat-message',
                data: data,
                timestamp: Date.now(),
                id: this.generateMessageId()
            });
        }
    }

    generateMessageId() {
        return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }

    // Event handlers that can be overridden
    onConnectionStateChange(state) {
        // Override in implementing class
        console.log('Connection state changed to:', state);
    }

    onICEConnectionStateChange(state) {
        // Override in implementing class  
        console.log('ICE connection state changed to:', state);
    }

    onRemoteStream(stream) {
        // Override in implementing class
        console.log('Received remote stream');
    }

    onDataChannelOpen() {
        // Override in implementing class
        console.log('Data channel is open');
    }

    onDataChannelClose() {
        // Override in implementing class
        console.log('Data channel is closed');
    }

    onDataChannelMessage(data) {
        // Override in implementing class
        console.log('Received data channel message:', data);
    }

    // Utility methods
    async getMediaDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return {
                audioInputs: devices.filter(device => device.kind === 'audioinput'),
                audioOutputs: devices.filter(device => device.kind === 'audiooutput'),
                videoInputs: devices.filter(device => device.kind === 'videoinput')
            };
        } catch (error) {
            console.error('Failed to enumerate devices:', error);
            return { audioInputs: [], audioOutputs: [], videoInputs: [] };
        }
    }

    async testMediaAccess() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            // Stop all tracks immediately - this is just a test
            stream.getTracks().forEach(track => track.stop());
            
            return { video: true, audio: true };
        } catch (error) {
            console.error('Media access test failed:', error);
            return { video: false, audio: false };
        }
    }

    // Connection management
    closeConnection() {
        if (this.dataChannel) {
            this.dataChannel.close();
            this.dataChannel = null;
        }
        
        if (this.localConnection) {
            this.localConnection.close();
            this.localConnection = null;
        }
        
        // Clear signaling data
        if (this.currentRoomId) {
            localStorage.removeItem(`webrtc_signal_${this.currentRoomId}`);
        }
        
        this.connectionState = 'disconnected';
        console.log('Connection closed');
    }

    // Statistics and monitoring
    async getConnectionStats() {
        if (!this.localConnection) return null;
        
        try {
            const stats = await this.localConnection.getStats();
            const report = {};
            
            stats.forEach((stat) => {
                if (stat.type === 'inbound-rtp' && stat.mediaType === 'video') {
                    report.videoInbound = {
                        bytesReceived: stat.bytesReceived,
                        packetsReceived: stat.packetsReceived,
                        packetsLost: stat.packetsLost
                    };
                }
                
                if (stat.type === 'outbound-rtp' && stat.mediaType === 'video') {
                    report.videoOutbound = {
                        bytesSent: stat.bytesSent,
                        packetsSent: stat.packetsSent
                    };
                }
                
                if (stat.type === 'candidate-pair' && stat.state === 'succeeded') {
                    report.connection = {
                        currentRoundTripTime: stat.currentRoundTripTime,
                        availableOutgoingBitrate: stat.availableOutgoingBitrate
                    };
                }
            });
            
            return report;
        } catch (error) {
            console.error('Failed to get connection stats:', error);
            return null;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebRTCHandler;
} else if (typeof window !== 'undefined') {
    window.WebRTCHandler = WebRTCHandler;
}