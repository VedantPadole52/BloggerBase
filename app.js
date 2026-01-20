// Database Service
const DB_NAME = 'EditorialDB';
const STORE = 'stories';

const db = {
    async init() {
        return new Promise((res) => {
            const req = indexedDB.open(DB_NAME, 1);
            req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
            req.onsuccess = (e) => res(e.target.result);
        });
    },
    async save(obj) {
        const conn = await this.init();
        const tx = conn.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).add(obj);
    },
    async fetchAll() {
        const conn = await this.init();
        return new Promise(res => {
            const req = conn.transaction(STORE, 'readonly').objectStore(STORE).getAll();
            req.onsuccess = () => res(req.result.reverse());
        });
    }
};

// UI Handling
const render = async () => {
    const stories = await db.fetchAll();
    const grid = document.getElementById('posts-grid');
    grid.innerHTML = stories.map(s => `
        <article class="post-card">
            <span class="category">${s.category}</span>
            <h3>${s.title}</h3>
            <p>${s.content}</p>
            <div style="margin-top: 1rem; font-size: 0.8rem; color: #999;">
                ${new Date().toLocaleDateString()} · 5 min read
            </div>
        </article>
    `).join('');
};

// Modal Logic
const modal = document.getElementById('creator-modal');
document.getElementById('open-creator').onclick = () => modal.style.display = 'block';
document.querySelector('.close-modal').onclick = () => modal.style.display = 'none';

document.getElementById('post-form').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await db.save(Object.fromEntries(fd));
    modal.style.display = 'none';
    e.target.reset();
    render();
};

window.onload = render;
