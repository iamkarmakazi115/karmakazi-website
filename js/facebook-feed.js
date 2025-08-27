// Facebook Feed Integration
class FacebookFeed {
    constructor() {
        // Facebook Configuration
        this.config = {
            appId: 'YOUR_FACEBOOK_APP_ID', // You'll need to get this from Facebook Developers
            pageId: '742275432308734', // Your Karmakazi Facebook page ID (from error log)
            accessToken: '', // REMOVE THE TOKEN - it's invalid and public
            apiVersion: 'v18.0'
        };

        this.posts = [];
        this.nextPageUrl = null;
        this.isLoading = false;
        this.postsContainer = document.getElementById('facebook-posts');
        this.loadMoreBtn = document.getElementById('load-more-btn');
        this.loadMoreSection = document.getElementById('load-more-section');
        this.errorMessage = document.getElementById('error-message');
        this.connectionStatus = document.getElementById('connection-status');
        this.retryBtn = document.getElementById('retry-btn');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInitialPosts();
    }

    setupEventListeners() {
        // Load more button
        this.loadMoreBtn?.addEventListener('click', () => {
            this.loadMorePosts();
        });

        // Retry button
        this.retryBtn?.addEventListener('click', () => {
            this.retryConnection();
        });

        // Auto-refresh every 5 minutes
        setInterval(() => {
            this.refreshPosts();
        }, 5 * 60 * 1000);
    }

    async loadInitialPosts() {
        try {
            this.updateStatus('loading', 'Connecting to Karmakazi...');
            
            // Check if we have a valid access token
            if (!this.config.accessToken || this.config.accessToken === '' || this.config.accessToken === 'YOUR_PAGE_ACCESS_TOKEN') {
                throw new Error('Facebook access token not configured. Please set up Facebook integration.');
            }
            
            const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.pageId}/posts?fields=id,message,story,created_time,full_picture,attachments,likes.summary(true),comments.summary(true),shares&limit=10&access_token=${this.config.accessToken}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 400) {
                    throw new Error('Facebook API configuration error. Please check your App ID, Page ID, and Access Token.');
                } else if (response.status === 401) {
                    throw new Error('Facebook access token expired or invalid. Please generate a new token.');
                } else {
                    throw new Error(`Facebook API error: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(`Facebook API Error: ${data.error.message}`);
            }

            this.posts = data.data || [];
            this.nextPageUrl = data.paging?.next || null;
            
            this.renderPosts();
            this.updateStatus('connected', `${this.posts.length} posts loaded`);
            
        } catch (error) {
            console.error('Failed to load Facebook posts:', error);
            this.showError(error.message);
        }
    }

    async loadMorePosts() {
        if (!this.nextPageUrl || this.isLoading) return;

        this.isLoading = true;
        this.toggleLoadMoreButton(true);

        try {
            const response = await fetch(this.nextPageUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            const newPosts = data.data || [];
            this.posts.push(...newPosts);
            this.nextPageUrl = data.paging?.next || null;
            
            this.renderNewPosts(newPosts);
            
        } catch (error) {
            console.error('Failed to load more posts:', error);
            this.showNotification('Failed to load more posts', 'error');
        } finally {
            this.isLoading = false;
            this.toggleLoadMoreButton(false);
        }
    }

    async refreshPosts() {
        // Silent refresh - don't show loading states
        try {
            const url = `https://graph.facebook.com/${this.config.apiVersion}/${this.config.pageId}/posts?fields=id,message,story,created_time,full_picture,attachments,likes.summary(true),comments.summary(true),shares&limit=10&access_token=${this.config.accessToken}`;
            
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                
                if (!data.error && data.data) {
                    const newPosts = data.data;
                    const hasNewPosts = newPosts.some(post => 
                        !this.posts.find(existingPost => existingPost.id === post.id)
                    );

                    if (hasNewPosts) {
                        this.posts = newPosts;
                        this.nextPageUrl = data.paging?.next || null;
                        this.renderPosts();
                        this.showNotification('New posts available!', 'success');
                    }
                }
            }
        } catch (error) {
            // Silent fail for refresh
            console.log('Silent refresh failed:', error);
        }
    }

    renderPosts() {
        this.postsContainer.innerHTML = '';
        this.posts.forEach(post => {
            this.renderPost(post);
        });
        this.toggleLoadMoreSection();
    }

    renderNewPosts(posts) {
        posts.forEach(post => {
            this.renderPost(post);
        });
        this.toggleLoadMoreSection();
    }

    renderPost(post) {
        const postElement = document.createElement('div');
        postElement.className = 'facebook-post';
        postElement.setAttribute('data-post-id', post.id);

        const createdTime = new Date(post.created_time);
        const timeAgo = this.getTimeAgo(createdTime);

        // Get post content
        const content = post.message || post.story || '';
        const hasImage = post.full_picture;
        const hasAttachments = post.attachments?.data?.length > 0;

        // Get engagement stats
        const likes = post.likes?.summary?.total_count || 0;
        const comments = post.comments?.summary?.total_count || 0;
        const shares = post.shares?.count || 0;

        let attachmentHtml = '';
        
        // Handle attachments (images, videos, links)
        if (hasAttachments) {
            const attachment = post.attachments.data[0];
            
            if (attachment.media?.image?.src) {
                attachmentHtml = `<img src="${attachment.media.image.src}" alt="Post image" class="post-image" loading="lazy">`;
            } else if (attachment.type === 'video_inline' && attachment.media?.source) {
                attachmentHtml = `<video controls class="post-video" preload="metadata">
                    <source src="${attachment.media.source}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>`;
            } else if (attachment.type === 'share' && attachment.target?.url) {
                attachmentHtml = `
                    <a href="${attachment.target.url}" target="_blank" class="post-link">
                        <div class="link-title">${attachment.title || 'Shared Link'}</div>
                        <div class="link-description">${attachment.description || ''}</div>
                    </a>`;
            }
        } else if (hasImage) {
            attachmentHtml = `<img src="${post.full_picture}" alt="Post image" class="post-image" loading="lazy">`;
        }

        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-time">${timeAgo}</div>
            </div>
            ${content ? `<div class="post-content">${this.formatPostContent(content)}</div>` : ''}
            ${attachmentHtml}
            <div class="post-stats">
                ${likes > 0 ? `<div class="post-stat"><span>👍</span> ${likes}</div>` : ''}
                ${comments > 0 ? `<div class="post-stat"><span>💬</span> ${comments}</div>` : ''}
                ${shares > 0 ? `<div class="post-stat"><span>🔄</span> ${shares}</div>` : ''}
            </div>
        `;

        this.postsContainer.appendChild(postElement);
    }

    formatPostContent(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        // Convert hashtags to styled spans
        const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
        content = content.replace(hashtagRegex, '<span style="color: #4ecdc4; font-weight: bold;">#$1</span>');
        
        // Convert line breaks to <br>
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        
        return date.toLocaleDateString();
    }

    updateStatus(status, message) {
        const statusElement = this.connectionStatus;
        if (!statusElement) return;

        statusElement.innerHTML = '';
        
        if (status === 'loading') {
            statusElement.innerHTML = `
                <div class="loading-spinner"></div>
                <span>${message}</span>
            `;
        } else if (status === 'connected') {
            statusElement.innerHTML = `
                <span style="color: #4ecdc4;">●</span>
                <span>${message}</span>
            `;
        } else if (status === 'error') {
            statusElement.innerHTML = `
                <span style="color: #ff6b6b;">●</span>
                <span>${message}</span>
            `;
        }
    }

    toggleLoadMoreSection() {
        if (this.nextPageUrl && this.posts.length > 0) {
            this.loadMoreSection.style.display = 'block';
        } else {
            this.loadMoreSection.style.display = 'none';
        }
    }

    toggleLoadMoreButton(loading) {
        const btnText = this.loadMoreBtn.querySelector('span');
        const btnLoading = this.loadMoreBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            this.loadMoreBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            this.loadMoreBtn.disabled = false;
        }
    }

    showError(message) {
        this.updateStatus('error', 'Connection failed');
        this.postsContainer.innerHTML = '';
        this.errorMessage.style.display = 'block';
        this.loadMoreSection.style.display = 'none';
        
        // Show fallback content
        this.showFallbackContent();
    }

    showFallbackContent() {
        // Show some static content when Facebook is unavailable
        this.postsContainer.innerHTML = `
            <div class="facebook-post">
                <div class="post-header">
                    <div class="post-time">Recently</div>
                </div>
                <div class="post-content">
                    Welcome to my digital universe! While I work on connecting the live Facebook feed, 
                    check out my latest works and feel free to connect with me through the contact form below. 
                    New updates and posts coming soon!
                </div>
                <div class="post-stats">
                    <div class="post-stat"><span>🌟</span> Stay tuned</div>
                </div>
            </div>
        `;
    }

    retryConnection() {
        this.errorMessage.style.display = 'none';
        this.loadInitialPosts();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `facebook-notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#4ecdc4',
            error: '#ff6b6b',
            info: '#45b7d1'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    // Configuration method for easy setup
    static configure(config) {
        return new FacebookFeed({
            ...FacebookFeed.prototype.config,
            ...config
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with your configuration
    new FacebookFeed();
    
    // Alternative: Configure with custom settings
    // FacebookFeed.configure({
    //     appId: 'your-app-id',
    //     pageId: 'your-page-id', 
    //     accessToken: 'your-access-token'
    // });
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FacebookFeed;
}