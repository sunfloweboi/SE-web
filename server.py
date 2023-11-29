from fastapi import FastAPI, HTTPException, Body
from pydantic import BaseModel
import json 
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, HTMLResponse
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to the actual origins you want to allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# static_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "static")

# Mount the static files directory to the "/static" path
app.mount("/static", StaticFiles(directory="static"), name="static")

# Mount another directory for resources to the "/resources" path
app.mount("/resources", StaticFiles(directory="resources"), name="resources")

# Load existing blog posts
with open('blogPosts.json', 'r') as file:
    blogPosts = json.load(file)

# Load existing accounts
with open('login.json', 'r') as file:
    accounts = json.load(file)

# Load existing tokens
with open('tokens.json', 'r') as file:
    tokens = json.load(file)


with open('videos.json', 'r') as file:
    videos = json.load(file)

class User(BaseModel):
    username: str
    password: str

class VideoRequest(BaseModel):
    url: str
    title: str

class BlogPost(BaseModel):
    name: str
    title: str
    content: str
    subthread: list = []

class Comment(BaseModel):
    name: str
    title: str
    reply: str
    

class Token(BaseModel):
    userID: str
    time: str
    expire: str

# Initialize an empty list to store videos

@app.get("/")
async def root():
    return RedirectResponse(url='/static/se.html')

@app.get("/login")
async def get_login():
    return RedirectResponse(url='/static/login.html')

@app.post("/logout")
async def logout():
    file_path = 'tokens.json'

    empty_array = []

    with open(file_path, 'w') as file:
        json.dump(empty_array, file)

    with open('tokens.json', 'r') as file:
        tokens = json.load(file)
    print (tokens)
    return {"message": "Logout successful!"}

@app.post("/login")
def login(user: User):
    for existing_user in accounts:
        if existing_user['username'] == user.username and existing_user['password'] == user.password:
            import datetime
            now = datetime.datetime.now()
            now = now.strftime('%Y-%m-%d %H:%M:%S')
            now = int(now[11:13]) * 60 + int(now[14:16])
            expire = now + 30
    
            # if tokens not empty
            for t in tokens:
                t['time'] = now
                t['expire'] = expire
                print('Renewed token!')
                return {"message": "Login successful!"}
                # return RedirectResponse(url='/static/se.html', status_code=307)

            tokens.append({"userID": existing_user['userID'], "time": now, "expire": expire})
            with open('tokens.json', 'w') as file:
                json.dump(tokens, file, indent=4)
            print('New token created!')

            return {"message": "Login successful!"}
            # return RedirectResponse(url='/static/se.html', status_code=307)
    
    return {"message": "Invalid credentials"}

# @app.options("se.html")
# def options_se_html():
#     return {"message": "Allow"}

@app.post("/register")
def register(user: User):
    for existing_user in accounts:
        if existing_user['username'] == user.username:
            return {"message": "Username already exists"}

    # Add the new user to the in-memory database and update the JSON file
    accounts.append({"username": user.username, "password": user.password, "userID": str(len(accounts) + 1).zfill(6)})
    with open('login.json', 'w') as file:
        json.dump(accounts, file, indent=4)

    return {"message": "Registration successful!"}

@app.get('/tokenGet')
def get_token():
    print(tokens)
    return tokens

@app.post('/expiredToken')
def expired_token(token: dict = Body(...)):
    for t in tokens:
        if t['userID'] == token['userID']:
            tokens.remove(t)
            print('Token removed!')
    print (tokens)

# @app.post('/token')
# def require_token(token: dict = Body(...)):

#     #get current time
#     import datetime
#     now = datetime.datetime.now()
#     now = now.strftime('%Y-%m-%d %H:%M:%S')
    
        
#     for t in tokens:
#         if t['userID'] == token['userID']:
#             t['time'] = token['time']
#             t['expire'] = token['expire']
#             print('Renewed token!')
#             return

#     # if tokens not empty
#     if tokens:
#         print('Already logged in!')
#         return

#     tokens.append(token)
#     with open('tokens.json', 'w') as file:
#         json.dump(tokens, file, indent=4)
#     print('New token created!')
#     return 

# Endpoint to add a new video
@app.post("/add_video")
async def add_video(video: VideoRequest = Body(...)): 
    videos.append(video.dict())

    with open('videos.json', 'w') as file:
        json.dump(videos, file, indent=4)

    return 'videocreated successfully!'
    

# Endpoint to get all videos
@app.get("/videos")
async def get_videos():
    return videos


@app.get('/posts')
def get_blog_posts():
    return blogPosts

@app.post('/newpost')
def create_new_post(post: BlogPost = Body(...)):
    blogPosts.append(post.dict())

    with open('blogPosts.json', 'w') as file:
        json.dump(blogPosts, file, indent=4)

    return 'Post created successfully!'

@app.post('/newcomment')
def create_new_post(comment: Comment = Body(...)):
    for post in blogPosts:
        if post['title'] == comment.title:
            post['subthread'].append(comment.dict())
            break

    with open('blogPosts.json', 'w') as file:
        json.dump(blogPosts, file, indent=4)
        

    return 'Post created successfully!'
@app.post('/deletepost')
def deletepost(post: BlogPost = Body(...)):
    
    for p in blogPosts:
        if p['title'] == post.title:
            blogPosts.remove(p)
            break

    with open('blogPosts.json', 'w') as file:
        json.dump(blogPosts, file, indent=4)
        

    return 'Post deleted successfully!'

@app.get('/search/')
def search_posts(query: str):
    filtered_posts = [post for post in blogPosts if query.lower() in post['title'].lower()]
    return filtered_posts

@app.get('/searchvid/')
def search_video(query: str):
    filtered_video = [video for video in videos if query.lower() in video['title'].lower()]
    return filtered_video

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)