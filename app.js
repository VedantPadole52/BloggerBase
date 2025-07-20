// Initialize posts array from localStorage or empty array if none exists
let posts = JSON.parse(localStorage.getItem('blogPosts')) || [];
let currentEditId = null;

// Function to render all posts
function renderPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';
    
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'post';
        postElement.innerHTML = `
            <div class="post-header">
                <h2>${post.title}</h2>
                <span class="post-date">${post.date}</span>
                ${post.category ? `<span class="post-category">${post.category}</span>` : ''}
            </div>
            <p>${post.content}</p>
            <div class="post-tags">
                ${post.tags ? post.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
            </div>
            <div class="post-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
                <button class="like-btn">${post.likes || 0} ❤️</button>
                <button class="comment-btn">Comments (${post.comments ? post.comments.length : 0})</button>
            </div>
            <div class="comments-section" style="display: none;">
                <div class="comments-list">
                    ${post.comments ? post.comments.map(comment => 
                        `<div class="comment">
                            <p class="comment-author">${comment.author}</p>
                            <p class="comment-text">${comment.text}</p>
                            <p class="comment-date">${comment.date}</p>
                        </div>`
                    ).join('') : ''}
                </div>
                <div class="add-comment">
                    <input type="text" class="comment-author-input" placeholder="Your Name">
                    <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                    <button class="submit-comment-btn">Submit</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editBtn = postElement.querySelector('.edit-btn');
        const deleteBtn = postElement.querySelector('.delete-btn');
        const likeBtn = postElement.querySelector('.like-btn');
        const commentBtn = postElement.querySelector('.comment-btn');
        const commentsSection = postElement.querySelector('.comments-section');
        const submitCommentBtn = postElement.querySelector('.submit-comment-btn');
        
        // Edit post
        editBtn.addEventListener('click', () => {
            document.getElementById('title').value = post.title;
            document.getElementById('content').value = post.content;
            document.getElementById('category').value = post.category || '';
            document.getElementById('tags').value = post.tags ? post.tags.join(', ') : '';
            document.getElementById('submit-btn').textContent = 'Update Post';
            currentEditId = index;
            
            // Scroll to form
            document.getElementById('post-form').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Delete post
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this post?')) {
                posts.splice(index, 1);
                saveAndRenderPosts();
            }
        });
        
        // Like post
        likeBtn.addEventListener('click', () => {
            posts[index].likes = (posts[index].likes || 0) + 1;
            likeBtn.textContent = `${posts[index].likes} ❤️`;
            saveAndRenderPosts();
        });
        
        // Toggle comments section
        commentBtn.addEventListener('click', () => {
            commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
        });
        
        // Add comment
        submitCommentBtn.addEventListener('click', () => {
            const authorInput = postElement.querySelector('.comment-author-input');
            const commentInput = postElement.querySelector('.comment-input');
            const author = authorInput.value.trim();
            const text = commentInput.value.trim();
            
            if (author && text) {
                if (!posts[index].comments) {
                    posts[index].comments = [];
                }
                
                posts[index].comments.push({
                    author,
                    text,
                    date: new Date().toLocaleString()
                });
                
                saveAndRenderPosts();
                
                // Clear inputs
                authorInput.value = '';
                commentInput.value = '';
            } else {
                alert('Please enter your name and comment');
            }
        });
        
        postsContainer.appendChild(postElement);
    });
}

// Function to save posts to localStorage and re-render
function saveAndRenderPosts() {
    localStorage.setItem('blogPosts', JSON.stringify(posts));
    renderPosts();
}

// Form submission handler
document.getElementById('post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const category = document.getElementById('category').value.trim();
    const tagsInput = document.getElementById('tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [];
    
    if (currentEditId !== null) {
        // Update existing post
        posts[currentEditId] = {
            ...posts[currentEditId],
            title,
            content,
            category,
            tags,
            lastEdited: new Date().toLocaleString()
        };
        currentEditId = null;
        document.getElementById('submit-btn').textContent = 'Publish Post';
    } else {
        // Create new post
        posts.unshift({
            title,
            content,
            category,
            tags,
            date: new Date().toLocaleString(),
            likes: 0,
            comments: []
        });
    }
    
    // Save and render posts
    saveAndRenderPosts();
    
    // Clear the form
    this.reset();
})
// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Render existing posts from localStorage
    renderPosts();
});

  
  
