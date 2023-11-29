let videos;

document.addEventListener('DOMContentLoaded', function() {
    
    fetch('http://localhost:8000/videos')
        .then(response => response.json())
        .then(data => {
            videos = data;
            renderVideos();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    // Function to render videos
    function renderVideos() {
        const videosContainer = document.getElementById('videosContainer');
        videosContainer.innerHTML = '';

        if (videos) {
            videos.forEach((video, index) => {
                const videoElement = document.createElement('div');
                videoElement.classList.add('video');
                videoElement.innerHTML = `
                    <h2>${video.title}</h2>
                    ${video.url}`;
                videosContainer.appendChild(videoElement);
            });
        } else {
            // Handle the case where videos is undefined (perhaps show a message or take other actions)
            console.error('Videos data is undefined.');
        }
    }

    // Function to handle form submission
    document.getElementById('submit').addEventListener('click', function(event) {
        event.preventDefault();
        const videoUrl = document.getElementById('videoUrl').value;
        const videoTitle = document.getElementById('videoTitle').value;

        if (videoUrl && videoTitle) {
            let videopost = { url: videoUrl, title: videoTitle };
            videos.push(videopost);
            renderVideos();
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoTitle').value = '';
            fetch('http://localhost:8000/add_video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(videopost),
            })
            .then(response => response.text())
            .then(data => {
                console.log(data); // Message from the server
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        }

        
    });

    renderVideos();    

    document.getElementById('searchButton').addEventListener('click', function () {
        const searchInput = document.getElementById('searchInput').value;
    
        if (searchInput) {
            // Send a GET request to the server to search for videos
            fetch(`http://localhost:8000/searchvid?query=${searchInput}`)
                .then(response => response.json())
                .then(data => {
                    // Update the videos array with the filtered results
                    videos = data;
                    renderVideos();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        } else {
            // If search input is empty, reload all videos
            fetch('http://localhost:8000/videos')
                .then(response => response.json())
                .then(data => {
                    videos = data;
                    renderVideos();
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    });
    
    
    
});
