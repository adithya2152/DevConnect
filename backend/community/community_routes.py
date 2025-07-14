from fastapi import FastAPI, Depends, status, HTTPException , Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from auth.dependencies import get_current_user_id
from db import (
    supabase,
    get_communities,
    get_joined_communities,
    get_comminities_by_userid,
    add_community,
    Join_community,
    check_community_membership ,
    check_community_ownership,
    get_community_messages  ,
    get_community_members
)

community_app = FastAPI()

# Response Models
class CommunityResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    is_private: bool = False
    member_count: int = 0
    room_admin_id: str = ""
    created_at: str

class CreateCommunityRequest(BaseModel):
    name: str
    description: str
    is_private: bool
    

# API Endpoints
from fastapi import HTTPException, status, Depends
from typing import List

@community_app.get("/explore", response_model=List[CommunityResponse])
async def explore_communities(user_id: str = Depends(get_current_user_id)):
    """
    Get all public communities available to explore
    Returns:
        List of communities with:
        - id: str
        - name: str
        - description: str
        - is_private: bool
        - member_count: int
        - room_admin_id: str
        - created_at: datetime
    """
    try:
        communities = await get_communities(user_id)
        if not communities:  # Changed from None to empty list check
            return []
            
        # Transform to match CommunityResponse model
        formatted_communities = []
        for community in communities:
            formatted_communities.append({
                "id": community.get("id"),
                "name": community.get("name"),
                "description": community.get("description", ""),
                "is_private": community.get("is_private", False),
                "member_count": community.get("member_count", 0),
                "room_admin_id": community.get("room_admin_id"),
                "created_at": community.get("created_at"),
                # Add any other required fields
            })
        
        return formatted_communities
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching communities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching communities."
        )

@community_app.get("/joined", response_model=List[CommunityResponse])
async def joined_communities(user_id: str = Depends(get_current_user_id)):
    """
    Get all communities the current user has joined
    Returns:
        List of communities with:
        - id: str
        - name: str
        - description: str
        - is_private: bool
        - member_count: int
        - room_admin_id: str
        - created_at: datetime
    """
    try:
        communities = await get_joined_communities(user_id)
        if not communities:
            return []
            
        # Transform to match CommunityResponse model
        formatted_communities = []
        for community in communities:
            formatted_communities.append({
                "id": community.get("id"),
                "name": community.get("name"),
                "description": community.get("description", ""),
                "is_private": community.get("is_private", False),
                "member_count": community.get("member_count", 0),
                "room_admin_id": community.get("room_admin_id"),
                "created_at": community.get("created_at"),
                # Add any other required fields
            })
        
        return formatted_communities
        
    except Exception as e:
        print(f"❌ Error fetching joined communities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching joined communities."
        )

@community_app.get("/hosted", response_model=List[CommunityResponse])
async def hosted_communities(user_id: str = Depends(get_current_user_id)):
    """
    Get all communities hosted/created by the current user
    Returns:
        List of communities with:
        - id: str
        - name: str
        - description: str
        - is_private: bool
        - member_count: int
        - room_admin_id: str (will be current user's ID)
        - created_at: datetime
    """
    try:
        communities = await get_comminities_by_userid(user_id)
        if not communities:
            return []
            
        # Transform to match CommunityResponse model
        formatted_communities = []
        for community in communities:
            formatted_communities.append({
                "id": community.get("id"),
                "name": community.get("name"),
                "description": community.get("description", ""),
                "is_private": community.get("is_private", False),
                "member_count": community.get("member_count", 0),
                "room_admin_id": community.get("room_admin_id"),  # Should be same as user_id
                "created_at": community.get("created_at"),
                # Add any other required fields
            })
        
        return formatted_communities
        
    except Exception as e:
        print(f"❌ Error fetching hosted communities: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching hosted communities."
        )

@community_app.post("/add", response_model=CommunityResponse, status_code=status.HTTP_201_CREATED)
async def create_community(
    request: CreateCommunityRequest, 
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new community
    - Sets the creator as admin
    - Default type is 'group'
    """
    try:
        # Validate input
        if not request.name or len(request.name) < 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Community name must be at least 3 characters"
            )

        # Prepare community data
        community_data = {
            "name": request.name,
            "description": request.description,
            "type": "private_group" if request.is_private else "group",
            "created_by": user_id
        }

        # Create community
        community = await add_community(community_data)
        if not community:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create community"
            )

        return community

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while creating community."
        )
        
@community_app.post("/join")
async def JoinCommunity(
    request: Request,  # Add this to get the request body
    user_id: str = Depends(get_current_user_id)
):
    """
    Join a community/room.
    Expects JSON: {"community_id": "some_id"}
    Returns:
        - 200: Success (already member or newly joined)
        - 404: Room doesn't exist
        - 400: Bad request (join error)
        - 500: Internal server error
    """
    try:
        # Get community_id from request body
        data = await request.json()
        community_id = data.get("community_id")
        
        if not community_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="community_id is required"
            )
            
        result = await Join_community(community_id, user_id)
        
        if result is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Internal server error while joining community"
            )
            
        if "error" in result:
            status_code = status.HTTP_400_BAD_REQUEST
            if "Room does not exist" in result["error"]:
                status_code = status.HTTP_404_NOT_FOUND
            raise HTTPException(
                status_code=status_code,
                detail=result["error"]
            )
        
        # Success response
        return {
            "status": "success",
            "community_id": community_id,
            "user_id": user_id,
            "message": result.get("message", "Successfully joined community"),
            "is_existing": "already" in result.get("message", "")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error joining community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while joining community"
        )
        
# Add to your communities router file

@community_app.get("/{community_id}/chat")
async def get_chat_messages(
    community_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get chat messages for a community
    """
    # Verify user is member of community
    is_member = await check_community_membership(community_id, user_id)
    if not is_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be a member to view chat"
        )
    
    # Get messages from database
    messages = await get_community_messages(community_id)
    return {"messages": messages}

@community_app.get("/{community_id}/manage")
async def get_community_management(
    community_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get community management data
    """
    # Verify user is owner of community
    is_owner = await check_community_ownership(community_id, user_id)
    if not is_owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only community owners can manage"
        )
    
    # Get community management data
    community = await get_community_messages(community_id)
    members = await get_community_members(community_id)
    
    return {
        "community": community,
        "members": members
    }
    


@community_app.get("/{community_id}")
async def get_community(
    community_id: str,
    user_id: str = Depends(get_current_user_id)
):
    print(f"🔍 Getting community: {community_id}, user: {user_id}")
    
    community = supabase.table("rooms") \
                      .select("*") \
                      .eq("id", community_id) \
                      .single() \
                      .execute()
    
    if not community.data:
        print(f"❌ Community not found: {community_id}")
        raise HTTPException(status_code=404, detail="Community not found")
    
    print(f"✅ Found community: {community.data}")
    return community.data


@community_app.post("/{community_id}/messages")
async def create_message(
    community_id: str,
    message_data: dict,
    user_id: str = Depends(get_current_user_id)
):
    # Verify user is member
    is_member = await check_community_membership(community_id, user_id)
    if not is_member:
        raise HTTPException(status_code=403, detail="Not a member")
    
    # Create message
    message = supabase.table("messages") \
                    .insert({
                        "room_id": community_id,
                        "sender_id": user_id,
                        "content": message_data["content"]
                    }) \
                    .execute()
    
    # Add sender info to response
    sender = supabase.table("profiles") \
                   .select("username") \
                   .eq("id", user_id) \
                   .single() \
                   .execute()
    
    return {
        **message.data[0],
        "sender_name": sender.data.get("username", "Anonymous")
    }
# @community_app.get("/{community_id}/messsages")
# async def get_community_messages(community_id: str,userId : str = Depends(get_current_user_id)):
#     try:
#         result = supabase.table("messages") \
#                        .select("*") \
#                        .eq("room_id", community_id) \
#                        .order("created_at") \
#                        .execute()
#         return result.data
#     except Exception as e:
#         print(f"❌ Error fetching community messages: {e}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail="Internal server error while fetching community messages."
#         )\

# Alternative members endpoint without joins
@community_app.get("/{room_id}/members")
async def get_room_members(
    room_id: str,
    user_id: str = Depends(get_current_user_id)
):
    print(f"🔍 Getting members for room: {room_id}, user: {user_id}")
    
    # Verify user is member
    is_member = await check_community_membership(room_id, user_id)
    print(f"👥 Is member: {is_member}")
    
    if not is_member:
        print(f"❌ Access denied: User {user_id} is not member of room {room_id}")
        raise HTTPException(status_code=403, detail="Not a member")

    # Get room members
    members = supabase.table("room_members") \
                    .select("*") \
                    .eq("room_id", room_id) \
                    .execute()

    print(f"📋 Found {len(members.data)} members")

    # Get profile info separately
    profiles = {}
    for member in members.data:
        profile = supabase.table("profiles") \
                       .select("*") \
                       .eq("id", member["user_id"]) \
                       .single() \
                       .execute()
        if profile.data:
            profiles[member["user_id"]] = profile.data

    # Combine data
    result = []
    for member in members.data:
        result.append({
            **member,
            "profile": profiles.get(member["user_id"], {})
        })
    
    print(f"✅ Returning {len(result)} members with profiles")
    return result

# ---------------- manage community handelers --------------------

@community_app.get("/{community_id}/requests")
async def get_community_requests(
    community_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get pending join requests for a community
    Only community owners can view requests
    """
    try:
        print(f"🔍 Checking requests for community: {community_id}, user: {user_id}")
        
        # Check if user is the community owner
        community = supabase.table("rooms") \
                          .select("*") \
                          .eq("id", community_id) \
                          .single() \
                          .execute()
        
        if not community.data:
            print(f"❌ Community not found: {community_id}")
            raise HTTPException(status_code=404, detail="Community not found")
        
        print(f"📋 Community data: {community.data}")
        print(f"👤 User ID: {user_id}")
        print(f"👑 Admin ID: {community.data.get('room_admin_id')}")
        
        # Check if user is the owner - use created_by since that's what's stored in the database
        is_owner = community.data.get("created_by") == user_id
        print(f"🔐 Is owner: {is_owner}")
        
        if not is_owner:
            print(f"❌ Access denied: User {user_id} is not owner of community {community_id}")
            print(f"📋 Created by: {community.data.get('created_by')}")
            raise HTTPException(status_code=403, detail="Only community owners can view requests")
        
        print(f"✅ Access granted for user {user_id}")
        
        # Get pending requests (this would need to be implemented based on your schema)
        # For now, return empty array
        return []
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching community requests: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching community requests."
        )

@community_app.post("/{community_id}/invite")
async def invite_member(
    community_id: str,
    request: dict,
    user_id: str = Depends(get_current_user_id)
):
    """
    Invite a member to join the community
    """
    try:
        email = request.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        
        # Check if user is the community owner
        community = supabase.table("rooms") \
                          .select("*") \
                          .eq("id", community_id) \
                          .single() \
                          .execute()
        
        if not community.data:
            raise HTTPException(status_code=404, detail="Community not found")
        
        if community.data.get("created_by") != user_id:
            raise HTTPException(status_code=403, detail="Only community owners can invite members")
        
        # For now, just return success (email sending would be implemented later)
        return {"message": "Invitation sent successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sending invitation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while sending invitation."
        )

@community_app.put("/{community_id}/members/{member_id}/role")
async def update_member_role(
    community_id: str,
    member_id: str,
    request: dict,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update a member's role in the community
    """
    try:
        role = request.get("role")
        if not role:
            raise HTTPException(status_code=400, detail="Role is required")
        
        # Check if user is the community owner
        community = supabase.table("rooms") \
                          .select("*") \
                          .eq("id", community_id) \
                          .single() \
                          .execute()
        
        if not community.data:
            raise HTTPException(status_code=404, detail="Community not found")
        
        if community.data.get("created_by") != user_id:
            raise HTTPException(status_code=403, detail="Only community owners can update roles")
        
        # Update member role (this would need to be implemented based on your schema)
        # For now, just return success
        return {"message": f"Member role updated to {role}"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating member role: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating member role."
        )

@community_app.delete("/{community_id}/members/{member_id}")
async def remove_member(
    community_id: str,
    member_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Remove a member from the community
    """
    try:
        # Check if user is the community owner
        community = supabase.table("rooms") \
                          .select("*") \
                          .eq("id", community_id) \
                          .single() \
                          .execute()
        
        if not community.data:
            raise HTTPException(status_code=404, detail="Community not found")
        
        if community.data.get("created_by") != user_id:
            raise HTTPException(status_code=403, detail="Only community owners can remove members")
        
        # Remove member (this would need to be implemented based on your schema)
        # For now, just return success
        return {"message": "Member removed successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error removing member: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while removing member."
        )

@community_app.put("/{community_id}")
async def update_community(
    community_id: str,
    request: dict,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update community settings
    """
    try:
        # Check if user is the community owner
        community = supabase.table("rooms") \
                          .select("*") \
                          .eq("id", community_id) \
                          .single() \
                          .execute()
        
        if not community.data:
            raise HTTPException(status_code=404, detail="Community not found")
        
        if community.data.get("created_by") != user_id:
            raise HTTPException(status_code=403, detail="Only community owners can update settings")
        
        # Update community settings
        updated_community = supabase.table("rooms") \
                                   .update({
                                       "name": request.get("name", community.data.get("name")),
                                       "description": request.get("description", community.data.get("description")),
                                       "is_private": request.get("is_private", community.data.get("is_private", False))
                                   }) \
                                   .eq("id", community_id) \
                                   .execute()
        
        return updated_community.data[0] if updated_community.data else community.data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while updating community."
        )

@community_app.delete("/{community_id}")
async def delete_community(
    community_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Delete a community
    """
    try:
        # Check if user is the community owner
        community = supabase.table("rooms") \
                          .select("*") \
                          .eq("id", community_id) \
                          .single() \
                          .execute()
        
        if not community.data:
            raise HTTPException(status_code=404, detail="Community not found")
        
        if community.data.get("created_by") != user_id:
            raise HTTPException(status_code=403, detail="Only community owners can delete communities")
        
        # Delete community
        supabase.table("rooms") \
               .delete() \
               .eq("id", community_id) \
               .execute()
        
        return {"message": "Community deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting community: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while deleting community."
        )