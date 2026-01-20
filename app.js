// Database Configuration
const DB_NAME = 'BloggerBase_Pro';
const STORE_NAME = 'articles';

const dbService = {
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, 2);
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

    async save(data) {
        const db = await this.init();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).add({ ...data, date: new Date().toISOString() });
        return new Promise(resolve => tx.oncomplete = resolve);
    },

    async getAll() {
        const db = await this.init();
        return new Promise(resolve => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            tx.objectStore(STORE_NAME).getAll().onsuccess = (e) => resolve(e.target.result.reverse());
        });
    },

    async delete(id) {
        const db = await this.init();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(id);
        return new Promise(resolve => tx.oncomplete = resolve);
    }
};

// UI Rendering Logic
const UI = {
    renderPosts(posts) {
        const grid = document.getElementById('posts-grid');
        grid.innerHTML = posts.length ? '' : `
            <div class="empty-state">
                <i class="fas fa-feather" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <p>No stories yet. Be the first to write!</p>
            </div>
        `;

        posts.forEach(post => {
            const card = `
                <article class="post-card">
                    <span class="post-badge">${post.category}</span>
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.content}</p>
                    <div class="post-footer">
                        <span style="font-size: 0.8rem; color: #94a3b8;">
                            <i class="far fa-calendar-alt"></i> ${new Date(post.date).toLocaleDateString()}
                        </span>
                        <div class="actions">
                            <button class="btn-icon" onclick="alert('Like feature coming soon!')">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="btn-icon delete" onclick="handleDelete(${post.id})">
                                <i class="far fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
            grid.insertAdjacentHTML('beforeend', card);
        });
    }
};

// Event Listeners
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const postData = Object.fromEntries(formData.entries());
    
    const btn = document.getElementById('submit-btn');
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Publishing...';

    await dbService.save(postData);
    e.target.reset();
    
    btn.innerHTML = '<span>Publish Story</span> <i class="fas fa-paper-plane"></i>';
    const posts = await dbService.getAll();
    UI.renderPosts(posts);
});

async function handleDelete(id) {
    if(confirm('Delete this story?')) {
        await dbService.delete(id);
        const posts = await dbService.getAll();
        UI.renderPosts(posts);
    }
}

// Initial Load
window.addEventListener('DOMContentLoaded', async () => {
    const posts = await dbService.getAll();
    UI.renderPosts(posts);
});
