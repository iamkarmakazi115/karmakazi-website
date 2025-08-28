// chat-live.js - Main Chat Live Logic
class ChatLive {
    constructor() {
        this.roomId = null;
        this.isConnected = false;
        this.localStream = null;
        this.peers = new Map();
        this.messages = [];
        this.username = this.generateUsername();
        this.sessionStartTime = null;
        this.sessionTimer = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupContactForm();
        this.requestMediaPermissions();
        this.simulateConnection();
    }

    setupEventListeners() {
        // Room management
        document.getElementById('createRoom').addEventListener('click', () => this.createRoom());
        document.getElementById('joinRoom').addEventListener('click', () => this.joinRoom());
        
        // Video controls
        document.getElementById('toggleVideo').addEventListener('click', () => this.toggleVideo());
        document.getElementById('toggleAudio').addEventListener('click', () => this.toggleAudio());
        document.getElementById('shareScreen').addEventListener('click', () => this.shareScreen());
        
        // Chat functionality
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        document.getElementById('messageInput').addEventListener('input', () => this.updateCharCounter());
        
        // Chat features
        document.getElementById('emojiPicker').addEventListener('click', () => this.showEmojiPicker());
        document.getElementById('fileShare').addEventListener('click', () => this.shareFile());
        
        // Modal close
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('emojiModal')) {
                this.closeModal();
            }
        });
        
        // Emoji selection
        document.querySelectorAll('.emoji').forEach(emoji => {
            emoji.addEventListener('click', (e) => this.insertEmoji(e.target.dataset.emoji));
        });
        
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileShare(e));
    }

    generateUsername() {
        const adjectives = ['Cosmic', 'Stellar', 'Nebula', 'Galaxy', 'Quantum', 'Aurora', 'Solar', 'Lunar'];
        const nouns = ['Explorer', 'Wanderer', 'Voyager', 'Navigator', 'Traveler', 'Seeker', 'Dreamer', 'Pioneer'];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const num = Math.floor(Math.random() * 999) + 1;
        return `${adj}${noun}${num}`;
    }

    async requestMediaPermissions() {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: { echoCancellation: true, noiseSuppression: true }
            });
            
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = this.localStream;
            
            this.updateConnectionStatus('Media access granted', 'connected');
        } catch (error) {
            console.error('Media access denied:', error);
            this.showSystemMessage('Camera/microphone access denied. Video features will be limited.');
            this.updateConnectionStatus('Media access denied', 'disconnected');
        }
    }

    createRoom() {
        this.roomId = this.generateRoomId();
        document.getElementById('roomId').value = this.roomId;
        this.connectToRoom();
        this.showSystemMessage(`Room created: ${this.roomId}. Share this ID with others to join.`);
    }

    joinRoom() {
        const inputRoomId = document.getElementById('roomId').value.trim();
        if (!inputRoomId) {
            this.showSystemMessage('Please enter a room ID to join.');
            return;
        }
        this.roomId = inputRoomId;
        this.connectToRoom();
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    connectToRoom() {
        this.isConnected = true;
        this.sessionStartTime = Date.now();
        this.startSessionTimer();
        
        document.getElementById('roomInfo').textContent = `Room: ${this.roomId}`;
        this.updateConnectionStatus('Connected to room', 'connected');
        this.updateUserCount(1);
        
        this.showSystemMessage(`Connected to room ${this.roomId} as ${this.username}`);
        
        // Simulate other users joining (for demo purposes)
        setTimeout(() => this.simulateUserJoin(), 3000);
    }

    simulateUserJoin() {
        if (this.isConnected) {
            const usernames = ['QuantumVoyager42', 'StellarDreamer88', 'CosmicSeeker19', 'NebulaWanderer'];
            const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
            this.showSystemMessage(`${randomUser} joined the room`);
            this.updateUserCount(2);
            this.addRemoteVideo(randomUser);
        }
    }

    addRemoteVideo(username) {
        const remoteVideos = document.getElementById('remoteVideos');
        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'remote-video-wrapper';
        videoWrapper.innerHTML = `
            <video autoplay playsinline></video>
            <div class="video-label">${username}</div>
        `;
        remoteVideos.appendChild(videoWrapper);
    }

    simulateConnection() {
        // Simulate connection quality monitoring
        setInterval(() => {
            if (this.isConnected) {
                const qualities = ['Excellent', 'Good', 'Fair', 'Poor'];
                const quality = qualities[Math.floor(Math.random() * qualities.length)];
                document.getElementById('connectionQuality').textContent = quality;
            }
        }, 5000);
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.sessionStartTime) {
                const elapsed = Date.now() - this.sessionStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                document.getElementById('sessionTime').textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    toggleVideo() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            const button = document.getElementById('toggleVideo');
            
            if (videoTrack.enabled) {
                videoTrack.enabled = false;
                button.classList.add('muted');
                button.innerHTML = '<i class="fas fa-video-slash"></i>';
                this.showSystemMessage('Video turned off');
            } else {
                videoTrack.enabled = true;
                button.classList.remove('muted');
                button.innerHTML = '<i class="fas fa-video"></i>';
                this.showSystemMessage('Video turned on');
            }
        }
    }

    toggleAudio() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            const button = document.getElementById('toggleAudio');
            
            if (audioTrack.enabled) {
                audioTrack.enabled = false;
                button.classList.add('muted');
                button.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                this.showSystemMessage('Microphone muted');
            } else {
                audioTrack.enabled = true;
                button.classList.remove('muted');
                button.innerHTML = '<i class="fas fa-microphone"></i>';
                this.showSystemMessage('Microphone unmuted');
            }
        }
    }

    async shareScreen() {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: { cursor: 'always' },
                audio: true
            });
            
            const localVideo = document.getElementById('localVideo');
            localVideo.srcObject = screenStream;
            
            const button = document.getElementById('shareScreen');
            button.classList.add('active');
            button.innerHTML = '<i class="fas fa-stop"></i>';
            
            this.showSystemMessage('Screen sharing started');
            
            screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                localVideo.srcObject = this.localStream;
                button.classList.remove('active');
                button.innerHTML = '<i class="fas fa-desktop"></i>';
                this.showSystemMessage('Screen sharing stopped');
            });
            
        } catch (error) {
            console.error('Screen sharing failed:', error);
            this.showSystemMessage('Screen sharing not supported or denied');
        }
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        if (!this.isConnected) {
            this.showSystemMessage('Please join a room first to send messages.');
            return;
        }
        
        this.addMessage(message, this.username, true);
        input.value = '';
        this.updateCharCounter();
        
        // Simulate receiving messages (for demo)
        setTimeout(() => this.simulateIncomingMessage(), 2000 + Math.random() * 5000);
    }

    simulateIncomingMessage() {
        if (!this.isConnected) return;
        
        const responses = [
            'That sounds interesting!',
            'I agree with that point.',
            'What do you think about this topic?',
            'Thanks for sharing!',
            'Great perspective! 👍',
            'Let me know what you find out.',
            'I have a similar experience.',
            'That\'s a good question.'
        ];
        
        const usernames = ['QuantumVoyager42', 'StellarDreamer88', 'CosmicSeeker19'];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const randomUser = usernames[Math.floor(Math.random() * usernames.length)];
        
        this.addMessage(randomResponse, randomUser, false);
    }

    addMessage(content, username, isOwn) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isOwn ? 'own' : 'other'}`;
        
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-info">${username} • ${timestamp}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        this.messages.push({ content, username, timestamp, isOwn });
    }

    showSystemMessage(content) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        messageDiv.innerHTML = `<i class="fas fa-info-circle"></i> ${content}`;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    updateCharCounter() {
        const input = document.getElementById('messageInput');
        const counter = document.querySelector('.char-counter');
        const length = input.value.length;
        counter.textContent = `${length}/500`;
        
        if (length > 450) {
            counter.style.color = '#ff4444';
        } else if (length > 400) {
            counter.style.color = '#ffaa00';
        } else {
            counter.style.color = 'rgba(255, 255, 255, 0.6)';
        }
    }

    showEmojiPicker() {
        document.getElementById('emojiModal').style.display = 'block';
    }

    insertEmoji(emoji) {
        const input = document.getElementById('messageInput');
        const currentValue = input.value;
        const cursorPos = input.selectionStart;
        
        const newValue = currentValue.slice(0, cursorPos) + emoji + currentValue.slice(cursorPos);
        input.value = newValue;
        input.focus();
        input.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
        
        this.updateCharCounter();
        this.closeModal();
    }

    shareFile() {
        document.getElementById('fileInput').click();
    }

    handleFileShare(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!this.isConnected) {
            this.showSystemMessage('Please join a room first to share files.');
            return;
        }
        
        const fileName = file.name;
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        
        this.addMessage(`📎 Shared file: ${fileName} (${fileSize}MB)`, this.username, true);
        this.showSystemMessage(`File "${fileName}" prepared for sharing`);
    }

    closeModal() {
        document.getElementById('emojiModal').style.display = 'none';
    }

    updateConnectionStatus(status, type) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.textContent = status;
        statusElement.className = type;
    }

    updateUserCount(count) {
        document.getElementById('userCount').textContent = count;
    }

    setupContactForm() {
        const form = document.getElementById('contactForm');
        const messageTextarea = document.getElementById('contactMessage');
        const wordCountSpan = document.getElementById('wordCount');

        messageTextarea.addEventListener('input', function() {
            const words = this.value.trim().split(/\s+/).filter(word => word.length > 0);
            const wordCount = this.value.trim() === '' ? 0 : words.length;
            wordCountSpan.textContent = wordCount;
            
            if (wordCount > 200) {
                wordCountSpan.style.color = '#ff4444';
            } else if (wordCount > 180) {
                wordCountSpan.style.color = '#ffaa00';
            } else {
                wordCountSpan.style.color = 'rgba(255, 255, 255, 0.8)';
            }
        });

        form.addEventListener('submit', function(e) {
            const words = messageTextarea.value.trim().split(/\s+/).filter(word => word.length > 0);
            const wordCount = messageTextarea.value.trim() === '' ? 0 : words.length;
            
            if (wordCount > 200) {
                e.preventDefault();
                alert('Message must be 200 words or less. Current count: ' + wordCount);
            }
        });
    }
}

// Initialize Chat Live when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ChatLive();
});

// Handle page visibility for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause unnecessary operations when tab is not visible
        console.log('Chat Live paused');
    } else {
        // Resume operations when tab becomes visible
        console.log('Chat Live resumed');
    }
});