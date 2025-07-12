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
        projects = response.data or []
        # Add applications_count (pending) to each project
        for project in projects:
            members = project.get("app_project_members", [])
            project["applications_count"] = sum(1 for m in members if m.get("status") == "pending")
        return projects
    except Exception as e:
        print(f"Error fetching projects with members: {e}")
        return None
    
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
            .select("*")
            .eq("following_id", user_id)
            .execute()
        )
        
        # Get following count
        following = (
            supabase.table("user_connections")
            .select("*")
            .eq("follower_id", user_id)
            .execute()
        )
        
        # Get projects count
        projects = (
            supabase.table("projects")
            .select("*")
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
        # Insert the project member
        response = supabase.table("app_project_members").insert(member_data).execute()
        member_result = response.data[0] if response.data else None
        
        if member_result:
            # Get project information to find the owner
            project_info = get_project_info(member_data['project_id'])
            if project_info and project_info['created_by']:
                # Create notification for project owner
                notification_data = {
                    "type": "project_invite",
                    "reference_id": member_data['project_id'],
                    "message": f"New application to join your project '{project_info['title']}'",
                    "is_read": False,
                    "recipient_id": project_info['created_by'],
                    "sender_id": member_data['user_id']
                }
                
                # Insert the notification
                insert_notification(notification_data)
                print(f"✅ Notification sent to project owner {project_info['created_by']}")
        
        return member_result
    except Exception as e:
        print(f"Error inserting project member: {e}")
        return None

# Get project information including owner
def get_project_info(project_id: str):
    try:
        response = supabase.table("app_projects").select("*").eq("id", project_id).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error getting project info: {e}")
        return None

# Insert a new notification
def insert_notification(notification_data: dict):
    try:
        response = supabase.table("notifications").insert(notification_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error inserting notification: {e}")
        return None

async def get_notifications(user_id: str):
    try:
        notif = (supabase.table("notification_with_sender")
               .select("*")
               .eq("recipient_id", user_id)
               .order("created_at", desc=True)
               .limit(20)
               .execute())
        
        unread = (supabase.table("notifications")
                .select("count")
                .eq("recipient_id", user_id)
                .eq("is_read", False)
                .execute())
        
        return {
            "notifications": notif.data,
            "unread_count": unread.count or 0
        }
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return {"notifications": [], "unread_count": 0}
    
    
async def get_unread_notifications(user_id: str):
    """
    Get all unread notifications for a specific user
    Returns: List of notification dictionaries or empty list on error
    """
    try:
        res = (supabase.table("notifications")
               .select("*")
               .eq("recipient_id", user_id)
               .eq("is_read", False)
               .execute()
              )
        return res.data
    except Exception as e:
        print(f"Error fetching unread notifications: {e}")
        return []

async def Update_notif(notif_id:str):
    try:
        res = (supabase.table("notifications")
               .update({
                   "is_read":True,
                   "read_at":datetime.datetime.now().isoformat()
               })
               .eq("id",notif_id)
               .execute()
               )
        
        return res.data
    except Exception as e:
        print(f"Error fetching notifications: {e}")
        return []   
    
async def get_communities(user_id: str):
    try:
        response = (supabase.table("rooms")
                    .select("*")
                    .eq("type",  "group")
                    .neq("created_by", user_id)
                    .execute()
                    )
        if response.data:
            return response.data
        else:
            return []
    except Exception as e:
        print(f"Error fetching communities: {e}")
        return []
    
async def get_comminities_by_userid(userId : str):
    try:
        response = ( supabase.table("rooms")
                    .select("*")
                    .eq("type", "group")
                    .eq("created_by", userId)
                    .execute()
                    )
        if response.data:
            return response.data
        else:
            return []
    except Exception as e:
        print(f"Error fetching communities: {e}")
        return []
    
async def get_joined_communities(user_id: str):
    """
    Fetch all communities (rooms) a user has joined
    Args:
        user_id: UUID of the user
    Returns:
        List of communities with details or empty list on error
    """
    try:
        # First get all room IDs the user is a member of
        member_response = (
            supabase.table("room_members")
            .select("room_id")
            .eq("user_id", user_id)
            .execute()
        )
        
        if not member_response.data:
            return []
            
        room_ids = [member["room_id"] for member in member_response.data]
        
        # Then fetch full details of those rooms
        rooms_response = (
            supabase.table("rooms")
            .select("*")
            .in_("id", room_ids)
            .execute()
        )
        
        return rooms_response.data
        
    except Exception as e:
        print(f"Error fetching joined communities: {str(e)}")
        return []
    
async def add_community(room: dict):
    try:
        response = supabase.table("rooms").insert({"name":room['name'] , "type": "group" , "description":room['description'] , "created_by":room['created_by']}).execute()
        
        member_data = {
            "room_id":response.data[0]['id'],
            "user_id":room['created_by'],
            "role":"admin",
        }
        supabase.table("room_members").insert(member_data).execute()
        
        return response.data[0]
    except Exception as e:
        print(f"Error inserting community: {e}")
        return None
    
async def Join_community(room_id: str, user_id: str):
    try:
        
        #checkl if room exists
        
        room = (supabase.table("rooms")
                .select("*")
                .eq("id" , room_id)
                .execute()
                )
        
        if not room.data:
            return {"error":"Room does not exist"}
        
        #check if user is already a member of the room
        
        member = (supabase.table("room_members")
                  .select("*")
                  .eq("room_id" , room_id)
                  .eq("user_id" , user_id)
                  .execute()
                  )
        
        if member.data:
            return {"message":"User is already a member of the room"}
        
        #join the room
        response = supabase.table("room_members").insert({"room_id":room_id , "user_id":user_id , "role":"member"}).execute()
        if not response.data:
            return {"error":"Error joining room"}
        return response.data[0]
    except Exception as e:
        print(f"Error joining community: {e}")
        return None
    
# Get pending applications for a project
def get_pending_applications_for_project(project_id: str):
    try:
        response = (
            supabase.table("app_project_members")
            .select("*, profiles(*)")
            .eq("project_id", project_id)
            .eq("status", "pending")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching pending applications: {e}")
        return []

# Update project member status
def update_project_member_status(member_id: str, status: str):
    try:
        response = (
            supabase.table("app_project_members")
            .update({"status": status})
            .eq("id", member_id)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error updating project member status: {e}")
        return None

# Get project member by ID
def get_project_member(member_id: str):
    try:
        response = (
            supabase.table("app_project_members")
            .select("*, app_projects(*)")
            .eq("id", member_id)
            .single()
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching project member: {e}")
        return None   

# Create a room for a project
def create_project_room(project_data: dict):
    try:
        print(f"Creating room for project: {project_data['title']}")
        
        # Debug room_members table structure
        debug_room_members_structure()
        
        # Create room for the project
        room_data = {
            "name": project_data['title'],
            "type": "group",
            "created_by": project_data['created_by'],
            "description": project_data['description']
        }
        
        print(f"Room data: {room_data}")
        
        response = supabase.table("rooms").insert(room_data).execute()
        print(f"Room creation response: {response}")
        
        if response.data:
            room_id = response.data[0]['id']
            print(f"Created room with ID: {room_id}")
            
            # Add project owner as admin member
            member_data = {
                "room_id": room_id,
                "user_id": project_data['created_by'],
                "role": "admin"
                # Removed request_status as it might not exist in the table
            }
            
            print(f"Adding member: {member_data}")
            try:
                member_response = supabase.table("room_members").insert(member_data).execute()
                print(f"Member addition response: {member_response}")
            except Exception as member_error:
                print(f"Error adding member to room: {member_error}")
                # Continue even if member addition fails
                # The room was created successfully
            
            return room_id
        else:
            print("No data returned from room creation")
            return None
    except Exception as e:
        print(f"Error creating project room: {e}")
        import traceback
        traceback.print_exc()
        return None

# Update project with room_id
def update_project_room_id(project_id: str, room_id: str):
    try:
        response = (
            supabase.table("app_projects")
            .update({"room_id": room_id})
            .eq("id", project_id)
            .execute()
        )
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error updating project room_id: {e}")
        return None

# Add user to project room
def add_user_to_project_room(room_id: str, user_id: str):
    try:
        member_data = {
            "room_id": room_id,
            "user_id": user_id,
            "role": "member"
            # Removed request_status as it might not exist in the table
        }
        response = supabase.table("room_members").insert(member_data).execute()
        return response.data[0] if response.data else None
    except Exception as e:
        print(f"Error adding user to project room: {e}")
        return None

# Get project room info
def get_project_room(project_id: str):
    try:
        response = (
            supabase.table("app_projects")
            .select("room_id")
            .eq("id", project_id)
            .single()
            .execute()
        )
        return response.data.get('room_id') if response.data else None
    except Exception as e:
        print(f"Error getting project room: {e}")
        return None

# Check if room exists for a project
def check_project_room_exists(project_id: str):
    try:
        room_id = get_project_room(project_id)
        if room_id:
            # Verify the room actually exists
            room_response = (
                supabase.table("rooms")
                .select("id")
                .eq("id", room_id)
                .single()
                .execute()
            )
            return room_response.data is not None
        return False
    except Exception as e:
        print(f"Error checking project room existence: {e}")
        return False

# Debug function to check room_members table structure
def debug_room_members_structure():
    try:
        # Try to get a sample record to see the structure
        response = supabase.table("room_members").select("*").limit(1).execute()
        print(f"Room members table structure: {response.data}")
        return True
    except Exception as e:
        print(f"Error checking room_members structure: {e}")
        return False

async def check_community_membership(community_id: str, user_id: str):
    # Check if user is member of community
    result = supabase.table("room_members") \
                   .select("*") \
                   .eq("room_id", community_id) \
                   .eq("user_id", user_id) \
                   .execute()
    return len(result.data) > 0

async def check_community_ownership(community_id: str, user_id: str):
    # Check if user is owner of community
    result = supabase.table("rooms") \
                   .select("*") \
                   .eq("id", community_id) \
                   .eq("owner_id", user_id) \
                   .execute()
    return len(result.data) > 0

async def get_community_messages(community_id: str):
    # Get chat messages for community
    result = supabase.table("messages") \
                   .select("*") \
                   .eq("room_id", community_id) \
                   .order("created_at") \
                   .execute()
    return result.data

async def get_community_members(community_id: str):
    # Get all members of community
    result = supabase.table("room_members") \
                   .select("*, profiles(*)") \
                   .eq("room_id", community_id) \
                   .execute()
    return result.data