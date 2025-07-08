"""
Profile API Routes
FastAPI routes for handling user profiles, following, and profile management
"""

from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime

from auth_utils import get_current_user
from database import db

# Initialize router
router = APIRouter(prefix="/api/profiles", tags=["profiles"])

# Pydantic models
class ProfileResponse(BaseModel):
    id: str
    username: Optional[str]
    full_name: Optional[str]
    email: str
    bio: Optional[str]
    location: Optional[str]
    skills: Optional[List[str]]
    github_url: Optional[str]
    linkedin_url: Optional[str]
    stackoverflow_url: Optional[str]
    website_url: Optional[str]
    is_online: bool
    last_seen: Optional[datetime]
    created_at: datetime
    updated_at: Optional[datetime]
    is_following: bool = False
    followers_count: int = 0
    following_count: int = 0

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: Optional[List[str]] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    stackoverflow_url: Optional[str] = None
    website_url: Optional[str] = None

@router.get("/me")
async def get_my_profile(current_user: Dict = Depends(get_current_user)):
    """Get current user's profile"""
    try:
        profile = await db.get_user_profile(current_user["id"])
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Get follower/following counts
        followers_count = await db.get_followers_count(current_user["id"])
        following_count = await db.get_following_count(current_user["id"])
        
        profile["followers_count"] = followers_count
        profile["following_count"] = following_count
        profile["is_following"] = False  # Can't follow yourself
        
        return {"success": True, "data": profile}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

@router.get("/{user_id}")
async def get_user_profile(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a user's profile by ID"""
    try:
        profile = await db.get_user_profile(user_id)
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profile not found"
            )
        
        # Check if current user is following this user
        is_following = await db.is_following(current_user["id"], user_id)
        
        # Get follower/following counts
        followers_count = await db.get_followers_count(user_id)
        following_count = await db.get_following_count(user_id)
        
        profile["is_following"] = is_following
        profile["followers_count"] = followers_count
        profile["following_count"] = following_count
        
        return {"success": True, "data": profile}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile: {str(e)}"
        )

@router.put("/me")
async def update_my_profile(
    update_data: ProfileUpdateRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Update current user's profile"""
    try:
        # Filter out None values
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if not update_dict:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data provided for update"
            )
        
        success = await db.update_user_profile(current_user["id"], update_dict)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update profile"
            )
        
        # Get updated profile
        updated_profile = await db.get_user_profile(current_user["id"])
        
        return {"success": True, "data": updated_profile, "message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.post("/{user_id}/follow")
async def follow_user(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Follow a user"""
    try:
        if user_id == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot follow yourself"
            )
        
        success = await db.follow_user(current_user["id"], user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already following this user"
            )
        
        # Create notification
        await db.create_notification(
            recipient_id=user_id,
            sender_id=current_user["id"],
            type="connection_request",
            message=f"{current_user.get('username', 'Someone')} started following you"
        )
        
        return {"success": True, "message": "Successfully followed user"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to follow user: {str(e)}"
        )

@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Unfollow a user"""
    try:
        success = await db.unfollow_user(current_user["id"], user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Not following this user"
            )
        
        return {"success": True, "message": "Successfully unfollowed user"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to unfollow user: {str(e)}"
        )

@router.get("/{user_id}/followers")
async def get_user_followers(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get a user's followers"""
    try:
        followers = await db.get_user_followers(user_id)
        return {"success": True, "data": followers}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get followers: {str(e)}"
        )

@router.get("/{user_id}/following")
async def get_user_following(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get users that a user is following"""
    try:
        following = await db.get_user_connections(user_id)
        return {"success": True, "data": following}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get following: {str(e)}"
        )