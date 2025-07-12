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
    description: str | None = None
    type: str
    created_by: str
    created_at: str

class CreateCommunityRequest(BaseModel):
    name: str
    description: str

# API Endpoints
@community_app.get("/explore", response_model=List[CommunityResponse])
async def explore_communities(user_id: str = Depends(get_current_user_id)):
    """
    Get all public communities available to explore
    """
    try:
        communities = await get_communities(user_id)
        if communities is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No communities found"
            )
        return communities
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
    """
    try:
        communities = await get_joined_communities(user_id)
        if communities is None:
            return []
        return communities
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
    """
    try:
        communities = await get_comminities_by_userid(user_id)
        if communities is None:
            return []
        return communities
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
            "type": "group",
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
    community = supabase.table("rooms") \
                      .select("*") \
                      .eq("id", community_id) \
                      .single() \
                      .execute()
    
    if not community.data:
        raise HTTPException(status_code=404, detail="Community not found")
    
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
                        "roomid": community_id,
                        "sender_id": user_id,
                        "content": message_data["content"]
                    }) \
                    .execute()
    
    # Add sender info to response
    sender = supabase.table("profiles") \
                   .select("username") \
                   .eq("user_id", user_id) \
                   .single() \
                   .execute()
    
    return {
        **message.data[0],
        "sender_name": sender.data.get("username", "Anonymous")
    }