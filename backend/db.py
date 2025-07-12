import os
from supabase import create_client , Client
import logging
import datetime


try:
    url: str = os.environ["SUPABASE_URL"]
    key: str = os.environ["SUPABASE_KEY"]
    supabase:Client = create_client(url, key)
    logging.info("Connected to Supabase" , url, key)

except KeyError:
    # handle the case where the environment variable is not set
    print("Error: SUPABASE_URL or SUPABASE_KEY environment variable is not set")
    # you can also raise a custom exception or exit the program here

async def get_user_conv(user_id: str):
    try:
        response = (
            supabase.table("private_room_details")
            .select("*")
            .or_(f"user1_id.eq.{user_id},user2_id.eq.{user_id}")
            .execute()
        )

        conversations = []
        for room in response.data:
            # Determine the "other" user's details based on the current user
            if room["user1_id"] == user_id:
                other_user = {
                    "id": room["user2_id"],
                    "full_name": room["user2_name"],
                    "username": room["user2_username"],
                    "avatar_url": room.get("user2_avatar_url"),
                }
            else:
                other_user = {
                    "id": room["user1_id"],
                    "full_name": room["user1_name"],
                    "username": room["user1_username"],
                    "avatar_url": room.get("user1_avatar_url"),
                }

            conversations.append({
                "room_id": room["room_id"],
                "room_meta": {
                    "name": room.get("name"),
                    "type": room.get("type"),
                    "description": room.get("description"),
                    "created_at": room.get("created_at"),
                    # Add more room fields if needed
                },
                "other_user": other_user
            })

        print("🗨️ Conversations via view:", conversations)
        return conversations

    except Exception as e:
        print(f"❌ Error fetching conversations: {e}")
        return []


async def get_last_message(room_id: str):
    try:
        response = (
            supabase.table("messages")
            .select("*")
            .eq("room_id", room_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )

        if response.data:
            return response.data[0]  # the latest message
        else:
            return {"message": "No messages found or error occurred."}

    except Exception as e:
        print(f"Error fetching last message: {e}")
        return {"error": str(e)}

async def get_devs(q: str):
    try:
        response = (
            supabase.table("profiles")
            .select("id, full_name, username")  # Only fetch what you need
            .or_(f"full_name.ilike.%{q}%,username.ilike.%{q}%")  # Case-insensitive filter
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching developers: {e}")
        return None

async def get_projects_with_members():
    try:
        response = (
            supabase.table("app_projects")
            .select("*, app_project_members(*, profiles(*))")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching projects with members: {e}")
        return None
    
<<<<<<< HEAD
async def get_projects(q:str):
    try:
        response = (
            supabase.table("app_projects")
            .select("id , title , detailed_description")
            .or_(f"title.ilike.%{q}%,detailed_description.ilike.%{q}%")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching projects: {e}")
        return None
    
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .eq("id", user_id)
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching user profile: {e}")
        return None
    

async def create_private_room(user1_id: str, user2_id: str):
    """Create or get existing private room between two users"""
    try:
        # Check if room already exists
        existing_room = (
            supabase.table("private_rooms")
            .select("*, rooms(*)")
            .or_(f"and(user1_id.eq.{user1_id},user2_id.eq.{user2_id}),and(user1_id.eq.{user2_id},user2_id.eq.{user1_id})")
            .execute()
        )
        
        if existing_room.data:
            return existing_room.data[0]
        
        # Create new room first
        room_data = {
            "name": f"Private chat",
            "type": "private",
            "created_by": user1_id,
            "created_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
        
        room_result = supabase.table("rooms").insert(room_data).execute()
        
        if room_result.data:
            room_id = room_result.data[0]["id"]
            
            # Create private room entry
            private_room_data = {
                "room_id": room_id,
                "user1_id": user1_id,
                "user2_id": user2_id
            }
            
            private_result = supabase.table("private_rooms").insert(private_room_data).execute()
            
            # Add both users as room members
            members_data = [
                {"room_id": room_id, "user_id": user1_id, "role": "member"},
                {"room_id": room_id, "user_id": user2_id, "role": "member"}
            ]
            
            supabase.table("room_members").insert(members_data).execute()
            
            return {
                **private_result.data[0],
                "rooms": room_result.data[0]
            } if private_result.data else None
        
        return None
        
    except Exception as e:
        print(f"Error creating private room: {e}")
        return None

async def get_room_messages(room_id: str, limit: int = 50, offset: int = 0):
    """
    Fetch messages for a given room ID.
    Returns a list of messages, sorted by creation time.
    """
    try:
        response = (
            supabase
            .table("messages")
            .select("*")   
            .eq("room_id", room_id)
            .order("created_at", desc=False)
            .limit(limit)
            .offset(offset)
            .execute()
        )

        messages = response.data or []
        print(f"📩 {len(messages)} messages fetched for room {room_id}")
        return messages

    except Exception as e:
        print(f"❌ Error fetching messages for room {room_id}: {e}")
        return []


async def follow_user(follower_id: str, following_id: str):
    """Follow a user"""
    try:
        # Check if already following
        existing = (
            supabase.table("user_connections")
            .select("*")
            .eq("follower_id", follower_id)
            .eq("following_id", following_id)
            .execute()
        )
        
        if existing.data:
            return {"success": False, "message": "Already following"}
        
        connection_data = {
            "follower_id": follower_id,
            "following_id": following_id
        }
        
        result = supabase.table("user_connections").insert(connection_data).execute()
        return {"success": True, "data": result.data[0]} if result.data else {"success": False}
    except Exception as e:
        print(f"Error following user: {e}")
        return {"success": False, "message": str(e)}

async def unfollow_user(follower_id: str, following_id: str):
    """Unfollow a user"""
    try:
        response = (
            supabase.table("user_connections")
            .delete()
            .eq("follower_id", follower_id)
            .eq("following_id", following_id)
            .execute()
        )
        return {"success": True}
    except Exception as e:
        print(f"Error unfollowing user: {e}")
        return {"success": False, "message": str(e)}

async def check_following_status(follower_id: str, following_id: str):
    """Check if user is following another user"""
    try:
        response = (
            supabase.table("user_connections")
            .select("*")
            .eq("follower_id", follower_id)
            .eq("following_id", following_id)
            .execute()
        )
        return len(response.data) > 0
    except Exception as e:
        print(f"Error checking following status: {e}")
        return False

async def get_user_stats(user_id: str):
    """Get user statistics (followers, following, projects)"""
    try:
        # Get followers count
        followers = (
            supabase.table("user_connections")
            .select("*", count="exact")
            .eq("following_id", user_id)
            .execute()
        )
        
        # Get following count
        following = (
            supabase.table("user_connections")
            .select("*", count="exact")
            .eq("follower_id", user_id)
            .execute()
        )
        
        # Get projects count
        projects = (
            supabase.table("projects")
            .select("*", count="exact")
            .eq("profile_id", user_id)
            .execute()
        )
        
        return {
            "followers": followers.count or 0,
            "following": following.count or 0,
            "projects": projects.count or 0
        }
    except Exception as e:
        print(f"Error fetching user stats: {e}")
        return {"followers": 0, "following": 0, "projects": 0}
    

async def save_message(room_id: str, sender_id: str, content: str):
    """Save message to database"""
    try:
        print(f"💾 Saving message: room_id={room_id}, sender_id={sender_id}, content={content[:50]}...")
        
        message_data = {
            "room_id": room_id,
            "sender_id": sender_id,
            "content": content
        }
        
        result = supabase.table("messages").insert(message_data).execute()
        
        if result.data:
            print(f"✅ Message saved successfully: {result.data[0]}")
            return result.data[0]
        else:
            print("❌ No data returned from message insert")
            return None
            
    except Exception as e:
        print(f"❌ Error saving message: {e}")
        return None
    
=======
# async def get_projects():

# Insert a new project into app_projects
def insert_app_project(project_data: dict):
    try:
        response = supabase.table("app_projects").insert(project_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error inserting project: {e}")
        return None

# Insert a new member into app_project_members
def insert_app_project_member(member_data: dict):
    try:
        response = supabase.table("app_project_members").insert(member_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error inserting project member: {e}")
        return None
>>>>>>> 314029131cd2d7aac07d898ea77b1edf9080ae36
