import os
os.environ.pop("SSL_CERT_FILE", None)
from fastapi import FastAPI, HTTPException, Body, Depends, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
import os
import httpx
from fastapi import FastAPI, HTTPException, Path
# Import your own modules
from email_utils import send_otp_email
from auth.auth import verify_token
from chat.chat_routes import chat_app
from search.searchRoute import search_app
from chat_ws import ws_router
from db import get_projects_with_members, insert_app_project, insert_app_project_member
from db import get_pending_applications_for_project, update_project_member_status, get_project_member, insert_notification, get_project_info
from db import create_project_room, update_project_room_id, add_user_to_project_room, get_project_room, check_project_room_exists
from notification import notifrouter
from community.community_routes import community_app
from extractintent import extract_intent  # Your async function to extract intent/domain
from recom import find_people, find_projects  # Your async search functions
from supabase import create_client, Client
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173" , "https://dev-connect-fawn-one.vercel.app" , "https://dev-connect-git-main-adithya2152s-projects.vercel.app" ],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
supabase: Client = create_client(supabase_url, supabase_key)
if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

if not OPENROUTER_API_KEY:
    raise RuntimeError("OPENROUTER_API_KEY environment variable must be set")

supabase = create_client(supabase_url, supabase_key)

app.mount("/chat", chat_app)
app.mount("/search", search_app)
app.mount("/communities", community_app)
app.include_router(ws_router)
app.include_router(notifrouter)

# Temporary OTP storage
otp_storage = {}

class EmailRequest(BaseModel):
    email: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp: str

@app.post("/send-otp")
async def send_otp(request: EmailRequest):
    otp = send_otp_email(request.email)
    if not otp:
        raise HTTPException(status_code=500, detail="Failed to send OTP")
    
    otp_storage[request.email] = otp
    
    return {
        "status": 200,
        "message": "OTP sent successfully",
    }

@app.post("/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    stored_otp = otp_storage.get(request.email)
    if not stored_otp:
        raise HTTPException(status_code=400, detail="No OTP found for this email. Request a new one.")
    if request.otp != stored_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    del otp_storage[request.email]
    return {"success": True, "message": "OTP verified successfully"}

class UserRegister(BaseModel):
    email: str
    password: str

@app.post("/register")
async def register(
    email: str = Form(...),
    password: str = Form(...),
    username: Optional[str] = Form(None),
):
    try:
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {"username": username}
            }
        })
        if hasattr(auth_response, 'user') and auth_response.user:
            user_data = {
                "id": auth_response.user.id,
                "email": auth_response.user.email,
                "username": auth_response.user.user_metadata.get("username", username),
                "full_name": auth_response.user.user_metadata.get("username", username),
            }
            supabase.table("profiles").insert(user_data).execute()

            if hasattr(auth_response, 'session') and auth_response.session is not None:
                return {
                    "status": "success",
                    "access_token": auth_response.session.access_token,
                    "refresh_token": auth_response.session.refresh_token,
                    "user": {
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "username": auth_response.user.user_metadata.get("username")
                    }
                }
            else:
                raise HTTPException(status_code=400, detail="No session returned from Supabase. Registration may have failed.")
        else:
            error_message = getattr(auth_response, 'message', None) or "Registration failed"
            raise HTTPException(status_code=400, detail=error_message)
    except Exception as e:
        error_detail = str(e)
        if "User already registered" in error_detail:
            error_detail = "This email is already registered"
        raise HTTPException(status_code=400, detail=error_detail)

@app.post("/login")
async def login(request: UserRegister):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        if hasattr(auth_response, 'user') and auth_response.user:
            if hasattr(auth_response, 'session') and auth_response.session is not None:
                return {
                    "status": "success",
                    "user_id": auth_response.user.id,
                    "email": auth_response.user.email,
                    "access_token": auth_response.session.access_token,
                    "refresh_token": auth_response.session.refresh_token,
                    "user": {
                        "id": auth_response.user.id,
                        "email": auth_response.user.email,
                        "username": auth_response.user.user_metadata.get("username")
                    },
                }
            else:
                raise HTTPException(status_code=400, detail="No session returned from Supabase. Login may have failed.")
        else:
            error_message = getattr(auth_response, 'message', None) or "Login failed"
            raise HTTPException(status_code=400, detail=error_message)
    except Exception as e:
        error_detail = str(e)
        if "Invalid login credentials" in error_detail:
            error_detail = "Invalid email or password"
        raise HTTPException(status_code=400, detail=error_detail)

@app.post("/logout")
async def logout():
    try:
        supabase.auth.sign_out()
        return {"status": "success", "message": "User logged out successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e) or "Logout failed")

@app.get("/api/protected")
async def protected(payload: dict = Depends(verify_token)):
    return {"status": "success", "user_id": payload["sub"], "email": payload["email"]}

@app.get("/api/app_projects_with_members")
async def api_get_projects_with_members(payload: dict = Depends(verify_token)):
    data = await get_projects_with_members()
    if data is None:
        raise HTTPException(status_code=500, detail="Failed to fetch projects with members")
    return {"projects": data}

class AppProjectCreate(BaseModel):
    title: str
    description: str
    detailed_description: Optional[str] = None
    status: Optional[str] = 'active'
    project_type: Optional[str] = None
    domain: Optional[str] = None
    difficulty_level: Optional[str] = 'intermediate'
    required_skills: Optional[List[str]] = None
    tech_stack: Optional[List[str]] = None
    programming_languages: Optional[List[str]] = None
    estimated_duration: Optional[str] = None
    team_size_min: Optional[int] = 1
    team_size_max: Optional[int] = 5
    is_remote: Optional[bool] = True
    timezone_preference: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    figma_url: Optional[str] = None
    documentation_url: Optional[str] = None
    image_url: Optional[str] = None
    is_recruiting: Optional[bool] = True
    is_public: Optional[bool] = True
    collaboration_type: Optional[str] = 'open'
    created_by: Optional[str] = None
    tags: Optional[List[str]] = None
    deadline: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None

class AppProjectMemberCreate(BaseModel):
    project_id: str
    user_id: Optional[str] = None
    role: Optional[str] = 'member'
    status: Optional[str] = 'pending'
    contribution_description: Optional[str] = None

@app.post("/api/app_projects")
async def create_app_project(project: AppProjectCreate, payload: dict = Depends(verify_token)):
    project_data = project.dict()
    project_data['created_by'] = payload["sub"]
    
    # Handle empty image_url - set default Unsplash image
    if project_data.get('image_url') == '' or project_data.get('image_url') is None:
        project_data['image_url'] = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&h=300&fit=crop'
    
    created = insert_app_project(project_data)
    if created:
        return {"status": "success", "project": created}
    else:
        raise HTTPException(status_code=500, detail="Failed to create project")

@app.post("/api/app_project_members")
async def create_app_project_member(member: AppProjectMemberCreate, payload: dict = Depends(verify_token)):
    member_data = member.dict()
    member_data['status'] = 'pending'
    member_data['user_id'] = payload["sub"]
    created = insert_app_project_member(member_data)
    if created:
        return {"status": "success", "member": created}
    else:
        raise HTTPException(status_code=500, detail="Failed to apply to join project")

# Get pending applications for a project
@app.get("/api/projects/{project_id}/applications")
async def get_project_applications(project_id: str, payload: dict = Depends(verify_token)):
    try:
        # Verify the user is the project owner
        project_info = get_project_info(project_id)
        if not project_info or project_info['created_by'] != payload["sub"]:
            raise HTTPException(status_code=403, detail="Only project owner can view applications")
        
        applications = get_pending_applications_for_project(project_id)
        return {"status": "success", "applications": applications}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Accept a project application
@app.patch("/api/app_project_members/{member_id}/accept")
async def accept_project_application(member_id: str, payload: dict = Depends(verify_token)):
    try:
        # Get the project member details
        member_info = get_project_member(member_id)
        if not member_info:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Verify the user is the project owner
        project_info = get_project_info(member_info['project_id'])
        if not project_info or project_info['created_by'] != payload["sub"]:
            raise HTTPException(status_code=403, detail="Only project owner can accept applications")
        
        # Update the status to active
        updated = update_project_member_status(member_id, "active")
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update application status")
        
        # Send notification to the applicant
        notification_data = {
            "type": "project_invite",
            "reference_id": member_info['project_id'],
            "message": f"Your application to join '{project_info['title']}' has been accepted!",
            "is_read": False,
            "recipient_id": member_info['user_id'],
            "sender_id": payload["sub"]
        }
        insert_notification(notification_data)
        
        return {"status": "success", "message": "Application accepted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Deny a project application
@app.patch("/api/app_project_members/{member_id}/deny")
async def deny_project_application(member_id: str, payload: dict = Depends(verify_token)):
    try:
        # Get the project member details
        member_info = get_project_member(member_id)
        if not member_info:
            raise HTTPException(status_code=404, detail="Application not found")
        
        # Verify the user is the project owner
        project_info = get_project_info(member_info['project_id'])
        if not project_info or project_info['created_by'] != payload["sub"]:
            raise HTTPException(status_code=403, detail="Only project owner can deny applications")
        
        # Update the status to rejected
        updated = update_project_member_status(member_id, "rejected")
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to update application status")
        
        # Send notification to the applicant
        notification_data = {
            "type": "project_invite",
            "reference_id": member_info['project_id'],
            "message": f"Your application to join '{project_info['title']}' has been denied.",
            "is_read": False,
            "recipient_id": member_info['user_id'],
            "sender_id": payload["sub"]
        }
        insert_notification(notification_data)
        
        return {"status": "success", "message": "Application denied successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Create room for a project
@app.post("/api/projects/{project_id}/create-room")
async def create_project_room_endpoint(project_id: str, payload: dict = Depends(verify_token)):
    try:
        print(f"Creating room for project: {project_id}")
        
        # Get project info
        project_info = get_project_info(project_id)
        if not project_info:
            print(f"Project not found: {project_id}")
            raise HTTPException(status_code=404, detail="Project not found")
        
        print(f"Project info: {project_info}")
        
        # Verify the user is the project owner
        if project_info['created_by'] != payload["sub"]:
            print(f"User {payload['sub']} is not owner of project {project_id}")
            raise HTTPException(status_code=403, detail="Only project owner can create room")
        
        # Check if room already exists
        if check_project_room_exists(project_id):
            print(f"Room already exists for project: {project_id}")
            existing_room_id = get_project_room(project_id)
            return {"status": "success", "room_id": existing_room_id, "message": "Room already exists"}
        
        # Create room for the project
        room_id = create_project_room(project_info)
        if not room_id:
            print("Failed to create room")
            raise HTTPException(status_code=500, detail="Failed to create project room")
        
        print(f"Created room: {room_id}")
        
        # Update project with room_id
        update_result = update_project_room_id(project_id, room_id)
        if not update_result:
            print("Failed to update project with room_id")
            # Don't fail the request, just log the issue
        
        return {"status": "success", "room_id": room_id, "message": "Project room created successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error creating project room: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Add user to project room (when application is accepted)
@app.post("/api/projects/{project_id}/add-to-room")
async def add_user_to_project_room_endpoint(project_id: str, payload: dict = Depends(verify_token)):
    try:
        # Get project room
        room_id = get_project_room(project_id)
        if not room_id:
            raise HTTPException(status_code=404, detail="Project room not found")
        
        # Add user to room
        result = add_user_to_project_room(room_id, payload["sub"])
        if not result:
            raise HTTPException(status_code=500, detail="Failed to add user to project room")
        
        return {"status": "success", "message": "Added to project room successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------- CHATBOT INTEGRATION ---------

async def generate_reply(message: str, context: str = "") -> str:
    prompt = f"""
You are DevBot, a helpful AI assistant like ChatGPT. You help users find people and projects.
Respond conversationally and clearly using the context.

Context: {context}

User: {message}
DevBot:
"""
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    json_data = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [{"role": "user", "content": prompt}],
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=json_data,
        )
        response.raise_for_status()
        data = response.json()
    return data["choices"][0]["message"]["content"].strip()

@app.post("/chat")
async def chat_endpoint(message: Dict[str, str] = Body(...)) -> Dict[str, Any]:
    user_message = message.get("message")
    if not user_message:
        return {"message": "No message provided", "results": []}

    try:
        intent_data = await extract_intent(user_message)
        intent = intent_data.get("intent")
        domain = intent_data.get("domain")

        context = ""
        results = []

        if intent == "find_people":
            people = await find_people(domain)
            results = people
            if people:
                context = (
                    f"These people are working on {domain}:\n"
                    + ", ".join(f"{p.get('full_name') or p.get('username')} (score: {p.get('score')})" for p in people)
                )
            else:
                context = f"No people found for {domain}."
        elif intent == "find_projects":
            projects = await find_projects(domain)
            results = [
                {
                    "id": p["id"],
                    "title": p["title"],
                    "description": p["description"],
                    "domain": p.get("domain"),
                    "difficulty_level": p.get("difficulty_level"),
                    "tech_stack": p.get("tech_stack"),
                    "programming_languages": p.get("programming_languages"),
                    "github_url": p.get("github_url"),
                    "demo_url": p.get("demo_url"),
                    "is_recruiting": p.get("is_recruiting"),
                    "score": p.get("score"),
                }
                for p in projects
            ]
            if projects:
                context = (
                    f"Here are some projects on {domain}:\n"
                    + ", ".join(f"{p['title']} (Domain: {p.get('domain', 'N/A')})" for p in projects)
                )
            else:
                context = f"No projects found for {domain}."
        else:
            context = "No specific intent matched. Just chat freely!"

        reply = await generate_reply(user_message, context)
        return {"message": reply, "results": results}

    except Exception as e:
        print("Chat error:", e)
        raise HTTPException(status_code=500, detail="Internal chatbot error")

@app.get("/api/profile/{user_id}")
def get_profile(user_id: str = Path(..., title="User ID")):
    try:
        response = supabase.from_("profiles").select("*").eq("id", user_id).single().execute()
    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=404, detail="Profile not found")
    return response.data

def to_pg_array(arr):
    escaped = [str(item).replace('"', '\\"') for item in arr]
    quoted = [f'"{item}"' for item in escaped]
    return "{" + ",".join(quoted) + "}"

@app.get("/feed/{user_id}")
def personalized_feed(user_id: str = Path(..., title="User ID")):
    profile_response = supabase.table("profiles").select("skills, projects").eq("id", user_id).single().execute()
    if not profile_response.data:
        raise HTTPException(404, detail="User not found")

    profile = profile_response.data
    tags = list(set((profile.get("skills") or []) + (profile.get("projects") or [])))
    if not tags:
        return []

    # Build 'or' filter for ilike substring matching on tags text
    or_filters = " or ".join([f"tags::text.ilike.%{tag}%" for tag in tags])

    posts_response = (
        supabase
        .table("posts")
        .select("*")
        .execute()
    )

    

    return posts_response.data

class ProfileUpdate(BaseModel):
    id: str
    email: str
    full_name: str = ""
    username: str = ""
    bio: str = ""
    location: str = ""
    skills: list[str] = []
    projects: list[str] = []
    github_url: str = ""
    linkedin_url: str = ""
    stackoverflow_url: str = ""
    website_url: str = ""

@app.post("/api/profile/update")
async def update_profile(profile: ProfileUpdate):
    try:
        # Update profile in Supabase
        response = supabase.table("profiles").update({
            "full_name": profile.full_name,
            "username": profile.username,
            "bio": profile.bio,
            "location": profile.location,
            "skills": profile.skills,
            "projects": profile.projects,
            "github_url": profile.github_url,
            "linkedin_url": profile.linkedin_url,
            "stackoverflow_url": profile.stackoverflow_url,
            "website_url": profile.website_url,
        }).eq("id", profile.id).execute()

        if len(response.data) == 0:
            raise HTTPException(status_code=404, detail="Profile not found")

        return {"message": "Profile updated successfully", "data": response.data[0]}

    except Exception as e:
        print("Error updating profile:", e)
        raise HTTPException(status_code=500, detail="Failed to update profile")

