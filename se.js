
var userID = 0;
// var loggedIn = false;

window.onload = function() {
  // userID = fetchUserID();

  // if (userID != 0) {
  //   loggedIn = true;
  // }

  // console.log("loggedInAs: " + userID);
  // console.log("loggedIn: " + loggedIn);

  fetchUserID();

  document.getElementById('login-div').addEventListener('click', () => {
    window.location.href = `login.html`;
  });

}

function fetchUserID() {
  // if (userID == 0) {
    fetch('http://localhost:8000/tokenGet')
      .then(response => response.json())
      .then(data => {
        if (data.length == 0) {
          console.log("no token");
          document.getElementById('login-text').innerHTML = "Login";

          console.log("loggedInAs: " + document.getElementById('login-text').innerHTML);
          var elements = document.querySelectorAll('.dropdown');
        
          elements.forEach(function(element) {
            element.style.visibility = 'hidden';
          });

          return;
        }
        var expire = data[0].expire;
        var now = new Date().getTime();
        if (now > expire) {
          // loggedIn = false;
          //delete expired token
          fetch('http://localhost:8000/expiredToken', {
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "userID": userID
            })
          });
          // return 0;
          console.log("token expired");
          document.getElementById('login-text').innerHTML = "Login";

          console.log("loggedInAs: " + document.getElementById('login-text').innerHTML);
          var elements = document.querySelectorAll('.dropdown');
        
          elements.forEach(function(element) {
            element.classList.toggle('hidden');
          });

          return;
        }
        console.log("token: " + data[0].userID);
        document.getElementById('login-text').innerHTML = data[0].userID;
        // return data[0].userID;
        // console.log("loggedInAs: " + userID);
        // console.log("loggedIn: " + loggedIn);
      });
    // }
  }

document.addEventListener("DOMContentLoaded", function () {

window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");

  loader.classList.add("loader--hidden");

  loader.addEventListener("transitionend", () => {
    document.body.removeChild(loader);
  });
});


});
function toggleVisibility() {
  var item2 = document.querySelector('.item2');
  var tag = document.querySelector('.tag');
  
  
  item2.style.visibility = (item2.style.visibility === 'visible') ? 'hidden' : 'visible';
  
  tag.style.marginLeft = (tag.style.marginLeft === '75%') ? '90%' : '75%';
}
var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    
    this.classList.toggle("active");

    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}