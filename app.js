// Database Service Module
const DB_NAME = 'BloggerBaseDB';
const STORE_NAME = 'posts';

const dbService = {
    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                }
            };
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    async getAllPosts() {
        const db = await this.init();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.reverse());
        });
    },

    async savePost(post) {
        const db = await this.init();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        return post.id ? store.put(post) : store.add(post);
    },

    async deletePost(id) {
        const db = await this.init();
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        transaction.objectStore(STORE_NAME).delete(id);
    }
};

// UI Controller
const UI = {
    renderPost(post) {
        const template = `
            <article class="post-card" data-id="${post.id}">
                <div class="post-badge">${post.category || 'General'}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.content.substring(0, 150)}...</p>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${new Date(post.date).toLocaleDateString()}</span>
                    <span><i class="far fa-heart"></i> ${post.likes || 0}</span>
                </div>
                <div class="post-footer">
                    <button onclick="editPost(${post.id})" class="btn-icon"><i class="fas fa-edit"></i></button>
                    <button onclick="deletePost(${post.id})" class="btn-icon btn-danger"><i class="fas fa-trash"></i></button>
                </div>
            </article>
        `;
        document.getElementById('posts-grid').insertAdjacentHTML('beforeend', template);
    },

    async refreshFeed() {
        const container = document.getElementById('posts-grid');
        container.innerHTML = '<div class="loader"></div>';
        const posts = await dbService.getAllPosts();
        container.innerHTML = posts.length ? '' : '<p class="empty-state">No stories yet. Start writing!</p>';
        posts.forEach(post => this.renderPost(post));
    }
};

// Event Initializers
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const postData = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category'),
        date: new Date().toISOString(),
        likes: 0
    };
    
    await dbService.savePost(postData);
    e.target.reset();
    UI.refreshFeed();
});

document.addEventListener('DOMContentLoaded', () => UI.refreshFeed());
