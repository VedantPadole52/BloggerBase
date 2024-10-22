document.getElementById('post-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;

    // Create a new post element
    const post = document.createElement('div');
    post.className = 'post';
    post.innerHTML = `<h2>${title}</h2><p>${content}</p>`;

    // Create a delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function() {
        post.remove();
    });

    // Append the delete button to the post
    post.appendChild(deleteButton);

    // Append the post to the posts container
    document.getElementById('posts').appendChild(post);

    // Clear the form
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
});