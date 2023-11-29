  
document.addEventListener('DOMContentLoaded', function() {
    window.addEventListener("load", () => {
        const loader = document.querySelector(".loader");
      
        loader.classList.add("loader--hidden");
      
        loader.addEventListener("transitionend", () => {
          document.body.removeChild(loader);
        });
        });
    let blogPosts = []
    let activePostIndex = null;

    function renderBlogPosts() {
        const blogPostsContainer = document.getElementById('blogPosts');
        blogPostsContainer.innerHTML = '';
        blogPosts.reverse();

        blogPosts.forEach((post, index) => {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p>${post.content}</p>
                <button class="toggleReplies" data-index="${index}">Show Replies</button>
                <div class="replies" style="display:none;"></div>
                <input type="text" class="commentText" id="commentText${index}" placeholder="Your Comment" style="display:none;">
                <button class="commentButton" data-index="${index}" style="display:none;">Comment</button>
            `;
            blogPostsContainer.appendChild(postElement);

            const toggleButton = postElement.querySelector('.toggleReplies');
            const repliesContainer = postElement.querySelector('.replies');
            const commentTextInput = postElement.querySelector('.commentText');
            const commentButton = postElement.querySelector('.commentButton');

            toggleButton.addEventListener('click', () => {
                repliesContainer.innerHTML = '';
                post.subthread.forEach(reply => {
                    const replyElement = document.createElement('div');
                    replyElement.classList.add('reply');
                    replyElement.textContent = reply.reply;
                    repliesContainer.appendChild(replyElement);
                });

                repliesContainer.style.display = repliesContainer.style.display === 'none' ? 'block' : 'none';

                if (activePostIndex !== null && activePostIndex !== index) {
                    const prevCommentTextInput = document.getElementById(`commentText${activePostIndex}`);
                    const prevCommentButton = document.querySelector(`.commentButton[data-index="${activePostIndex}"]`);
                    prevCommentTextInput.style.display = 'none';
                    prevCommentButton.style.display = 'none';
                }

                commentTextInput.style.display = commentTextInput.style.display === 'none' ? 'block' : 'none';
                commentButton.style.display = commentButton.style.display === 'none' ? 'block' : 'none';

                activePostIndex = index;
            });

            commentButton.addEventListener('click', () => {
                commentOnPost(index);
            });
        });
    }

    function commentOnPost(selectedPostIndex) {
        const commentText = document.getElementById(`commentText${selectedPostIndex}`).value;

        if (commentText) {
            const newComment = { reply: commentText };
            blogPosts[selectedPostIndex].subthread.push(newComment);
            renderBlogPosts();

            document.getElementById(`commentText${selectedPostIndex}`).value = '';
        }
    }

    function createNewPost(title, content) {
        const newPost = {
            title: title,
            content: content,
            subthread: []
        };

        blogPosts.push(newPost);
        renderBlogPosts();

        // Send a POST request to the server to update the JSON file
        fetch('http://localhost:8000/newpost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPost),
        })
        .then(response => response.text())
        .then(data => {
            console.log(data); // Message from the server
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    fetch('http://localhost:8000/posts')
        .then(response => response.json())
        .then(data => {
            blogPosts = data;
            renderBlogPosts(blogPosts);
        })
        .catch((error) => {
            console.error('Error:', error);
            });
        
    document.getElementById('newPostButton').addEventListener('click', function() {
        const newPostTitle = document.getElementById('newPostTitle').value;
        const newPostContent = document.getElementById('newPostContent').value;

        if (newPostTitle && newPostContent) {
            createNewPost(newPostTitle, newPostContent);
            document.getElementById('newPostTitle').value = '';
            document.getElementById('newPostContent').value = '';
        }
    });

    renderBlogPosts();

    document.getElementById('searchButton').addEventListener('click', function () {
        const searchInput = document.getElementById('searchInput').value;
    
        if (searchInput) {
            // Send a GET request to the server to search for posts
            fetch(`http://localhost:8000/search?query=${searchInput}`)
                .then(response => response.json())
                .then(data => {
                    // Update the blogPosts array with the filtered results
                    blogPosts = data;
                    renderBlogPosts();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            // If search input is empty, reload all blog posts
            fetch('http://localhost:8000/posts')
                .then(response => response.json())
                .then(data => {
                    blogPosts = data;
                    renderBlogPosts();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    });
    
});


