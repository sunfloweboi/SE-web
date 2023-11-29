
const web = 'http://localhost:8000/'

window.onload = function() {

    document.getElementById('login').addEventListener('click', login);
    document.getElementById('register').addEventListener('click', register);
    document.getElementById('username').addEventListener('keyup', function(event) {
        if (event.keyCode === 13 && document.getElementById('username').value != "") {
            event.preventDefault();
            document.getElementById('login').click();
        }
    });
    document.getElementById('password').addEventListener('keyup', function(event) {
        if (event.keyCode === 13 && document.getElementById('username').value != "") {
            event.preventDefault();
            document.getElementById('login').click();
        }
    });

    localStorage.getItem("username") ? document.getElementById('username').value = localStorage.getItem("username") : null;
    localStorage.getItem("password") ? document.getElementById('password').value = localStorage.getItem("password") : null;

    document.getElementById('alert').style.display = "none";

    //check if token exists
    fetch(web + 'tokenGet')
        .then(response => response.json())
        .then(data => {
            if (data.length == 0) {
                console.log("no token");
                return;
            }
            var expire = data[0].expire;
            var now = new Date().getTime();
            if (now > expire) {
                //delete expired token
                fetch(web + 'expiredToken', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        "userID": userID
                    })
                });
                console.log("token expired");
                return;
            }
            window.location.href = `se.html`;
        });
}

function login() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch(web +'login')
        .then(response => response.json())
        .then(data => {
            for (var i = 0; i < data.length; i++) {
                if (username == data[i].username && password == data[i].password) {
                    saveCredential();
                    fetch(web + 'token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            "userID": idmapping(i),
                            "time": new Date().getTime(),
                            "expire": new Date().getTime() + 3600000
                        })
                    })
                    window.location.href = `se.html`;
                    return;
                }
            }
            document.getElementById('alert').innerHTML = "Wrong username or password!";
            document.getElementById('alert').style.display = "block";

            const container = document.querySelector('.login-container');
            container.style.height = '40%';
        })
        .catch(error => {
            console.error('Error loading data.json:', error);
        });
}

function register() {

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    fetch(web +'login')
        .then(response => response.json())
        .then(data => {
            if (username == "" || password == "") {
                document.getElementById('alert').innerHTML = "Username or password cannot be empty!";
                document.getElementById('alert').style.display = "block";

                const container = document.querySelector('.login-container');
                container.style.height = '40%';
                return;
            }
            for (var i = 0; i < data.length; i++) {
                if (username == data[i].username) {
                    document.getElementById('alert').innerHTML = "Username already exists!";
                    document.getElementById('alert').style.display = "block";

                    const container = document.querySelector('.login-container');
                    container.style.height = '40%';
                    return;
                }
            }
            saveCredential();
            fetch(web + 'register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                })
            })
            .then(response => response.json())
            .then(data => {
                alert("Register successfully!");
            })
            .catch(error => {
                console.error('Error loading data.json:', error);
            });
        }
    )
}

function saveCredential(){

    var remember = document.getElementById('remember').checked;

    if (remember) {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;

        localStorage.setItem("username", username);
        localStorage.setItem("password", password);
    } else {
        localStorage.removeItem("username");
        localStorage.removeItem("password");
    }
}

function idmapping(id){
    if (id / 10 < 1) {
        return "000" + id;
    } else if (id / 100 < 1) {
        return "00" + id;
    } else if (id / 1000 < 1) {
        return "0" + id;
    } else {
        return id;
    }
}