"""
Chat API Routes
FastAPI routes for handling chat functionality with real database integration
"""

from fastapi import APIRouter, HTTPException, Depends, status, WebSocket, WebSocketDisconnect
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid
import json

from auth_utils import get_current_user
from database import db
from websocket_manager import manager

# Initialize router
router = APIRouter(prefix="/api/chat", tags=["chat"])

# Pydantic models
class MessageCreate(BaseModel):
    content: str
    file_url: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    content: str
    file_url: Optional[str]
    created_at: datetime
    sender_id: str
    sender: Dict[str, Any]

class RoomResponse(BaseModel):
    id: str
    name: str
    type: str
    created_by: str
    created_at: datetime
    members: List[Dict[str, Any]]
    last_message: Optional[Dict[str, Any]]
    unread_count: int

class CreateGroupRequest(BaseModel):
    name: str
    member_ids: List[str]

class UserSearchResponse(BaseModel):
    id: str
    username: Optional[str]
    full_name: Optional[str]
    email: str
    bio: Optional[str]
    location: Optional[str]
    skills: Optional[List[str]]
    is_online: bool

class NotificationResponse(BaseModel):
    id: str
    type: str
    message: Optional[str]
    is_read: bool
    created_at: datetime
    sender: Dict[str, Any]

# User and connection endpoints
@router.get("/users/search")
async def search_users(
    q: str,
    current_user: Dict = Depends(get_current_user)
):
    """Search for users to start conversations with"""
    try:
        users = await db.search_users(q, current_user["id"])
        return {"success": True, "data": users}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search users: {str(e)}"
        )

@router.get("/users/connections")
async def get_connections(current_user: Dict = Depends(get_current_user)):
    """Get users that the current user is following"""
    try:
        connections = await db.get_user_connections(current_user["id"])
        return {"success": True, "data": connections}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get connections: {str(e)}"
        )

@router.post("/users/{user_id}/follow")
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

@router.delete("/users/{user_id}/follow")
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

# Room/conversation endpoints
@router.get("/rooms")
async def get_user_rooms(current_user: Dict = Depends(get_current_user)):
    """Get all rooms for the current user"""
    try:
        rooms = await db.get_user_rooms(current_user["id"])
        return {"success": True, "data": rooms}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get rooms: {str(e)}"
        )

@router.post("/rooms/private/{user_id}")
async def create_or_get_private_room(
    user_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Create or get existing private room with another user"""
    try:
        if user_id == current_user["id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create private room with yourself"
            )
        
        room = await db.create_private_room(current_user["id"], user_id)
        if not room:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create private room"
            )
        
        # Get room details
        members = await db.get_room_members(room["id"])
        room["members"] = members
        room["last_message"] = None
        room["unread_count"] = 0
        
        return {"success": True, "data": room}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create private room: {str(e)}"
        )

@router.post("/rooms/group")
async def create_group_room(
    request: CreateGroupRequest,
    current_user: Dict = Depends(get_current_user)
):
    """Create a group room"""
    try:
        room = await db.create_group_room(
            name=request.name,
            created_by=current_user["id"],
            member_ids=request.member_ids
        )
        
        if not room:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create group room"
            )
        
        # Get room details
        members = await db.get_room_members(room["id"])
        room["members"] = members
        room["last_message"] = None
        room["unread_count"] = 0
        
        # Create notifications for all members
        for member_id in request.member_ids:
            if member_id != current_user["id"]:
                await db.create_notification(
                    recipient_id=member_id,
                    sender_id=current_user["id"],
                    type="chat_request",
                    reference_id=room["id"],
                    message=f"{current_user.get('username', 'Someone')} added you to group '{request.name}'"
                )
        
        return {"success": True, "data": room}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create group room: {str(e)}"
        )

@router.get("/rooms/{room_id}/members")
async def get_room_members(
    room_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Get members of a room"""
    try:
        members = await db.get_room_members(room_id)
        return {"success": True, "data": members}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get room members: {str(e)}"
        )

# Message endpoints
@router.get("/rooms/{room_id}/messages")
async def get_room_messages(
    room_id: str,
    page: int = 1,
    limit: int = 50,
    current_user: Dict = Depends(get_current_user)
):
    """Get messages for a room with pagination"""
    try:
        offset = (page - 1) * limit
        messages = await db.get_room_messages(room_id, limit, offset)
        
        return {
            "success": True,
            "data": messages,
            "pagination": {
                "page": page,
                "limit": limit,
                "has_more": len(messages) == limit
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get messages: {str(e)}"
        )

@router.post("/rooms/{room_id}/messages")
async def send_message(
    room_id: str,
    message_data: MessageCreate,
    current_user: Dict = Depends(get_current_user)
):
    """Send a message to a room"""
    try:
        message = await db.send_message(
            room_id=room_id,
            sender_id=current_user["id"],
            content=message_data.content,
            file_url=message_data.file_url
        )
        
        if not message:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send message"
            )
        
        # Broadcast to WebSocket subscribers
        await manager.broadcast_to_room(room_id, {
            "type": "new_message",
            "data": message
        }, exclude_user=current_user["id"])
        
        # Create notifications for room members
        members = await db.get_room_members(room_id)
        for member in members:
            if member["id"] != current_user["id"]:
                await db.create_notification(
                    recipient_id=member["id"],
                    sender_id=current_user["id"],
                    type="message",
                    reference_id=room_id,
                    message=f"New message in {room_id}"
                )
        
        return {"success": True, "data": message}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

@router.post("/messages/{message_id}/read")
async def mark_message_as_read(
    message_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Mark a message as read"""
    try:
        success = await db.mark_message_as_read(message_id, current_user["id"])
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to mark message as read"
            )
        
        return {"success": True, "message": "Message marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark message as read: {str(e)}"
        )

# Notification endpoints
@router.get("/notifications")
async def get_notifications(
    limit: int = 50,
    current_user: Dict = Depends(get_current_user)
):
    """Get notifications for the current user"""
    try:
        notifications = await db.get_user_notifications(current_user["id"], limit)
        return {"success": True, "data": notifications}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get notifications: {str(e)}"
        )

@router.post("/notifications/{notification_id}/read")
async def mark_notification_as_read(
    notification_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Mark a notification as read"""
    try:
        success = await db.mark_notification_as_read(notification_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to mark notification as read"
            )
        
        return {"success": True, "message": "Notification marked as read"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark notification as read: {str(e)}"
        )

# WebSocket endpoint for real-time messaging
@router.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for real-time messaging"""
    await websocket.accept()
    
    # TODO: Authenticate user from WebSocket connection
    # For now, using mock user
    user_id = "550e8400-e29b-41d4-a716-446655440000"
    
    await manager.connect(websocket, room_id, user_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            message_type = message_data.get("type")
            
            if message_type == "typing_start":
                await manager.broadcast_typing_indicator(room_id, user_id, True)
            elif message_type == "typing_stop":
                await manager.broadcast_typing_indicator(room_id, user_id, False)
            elif message_type == "message_read":
                message_id = message_data.get("message_id")
                if message_id:
                    await db.mark_message_as_read(message_id, user_id)
                    await manager.broadcast_message_read(room_id, user_id, message_id)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, room_id, user_id)