from fastapi import FastAPI, HTTPException, Depends,Response

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId
from typing import List
from pymongo import MongoClient
from fastapi import Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse


# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["data_base"]  # Replace with your MongoDB database name
collection_users = db["users"]
collection_notes = db["data_base"]

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for your deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirmPassword: str = Field(..., min_length=6)

class Note(BaseModel):
    title: str
    description: str
    date: str

class LoginRequest(BaseModel):
    username: str
    password: str

# Routes


@app.post("/register")
async def register_user(
    username: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    confirmPassword: str = Form(...)
):
    if password != confirmPassword:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing_user = collection_users.find_one({"email": email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = {
        "username": username,
        "email": email,
        "password": password  # Note: In a real application, password hashing should be used
    }
    result = collection_users.insert_one(user_data)
    return {"message": "User registered successfully"}


@app.get("/")
def get_register_form():
    with open("signup.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)


@app.post("/login")
async def login(request: LoginRequest):
    if not (request.username and request.password):
        raise HTTPException(status_code=422, detail="Username and password are required")
    # Authentication logic here
    return {"message": "Login successful"}

from fastapi.responses import HTMLResponse

@app.get("/login.html")
def get_index_html():
    with open("index.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, media_type="text/html")

@app.get("/notes.html")
async def get_notes_page():
    with open("notes.html", "r") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content, status_code=200)



@app.post("/notes", response_model=dict)
async def add_note(note: Note):
    try:
        note_data = {
            "title": note.title,
            "description": note.description,
            "date": note.date
        }
        result = collection_notes.insert_one(note_data)
        return {"message": "Note added successfully"}
    except Exception as e:
        return {"message": f"Internal server error: {str(e)}"}
@app.put("/notes/{note_id}", response_model=dict)
async def update_note(note_id: str, note: Note):
    try:
        result = collection_notes.update_one(
            {"_id": ObjectId(note_id)},
            {"$set": {
                "title": note.title,
                "description": note.description,
                "date": note.date
            }}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note updated successfully"}
    except Exception as e:
        return {"message": f"Internal server error: {str(e)}"}


@app.delete("/notes/{note_id}", response_model=dict)
async def delete_note(note_id: str):
    try:
        result = collection_notes.delete_one({"_id": ObjectId(note_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Note not found")
        return {"message": "Note deleted successfully"}
    except Exception as e:
        return {"message": f"Internal server error: {str(e)}"}

# Optional: Update note route can be added similarly

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
