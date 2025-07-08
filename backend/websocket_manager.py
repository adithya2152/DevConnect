"""
WebSocket Manager for Real-time Chat
Handles WebSocket connections and message broadcasting
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    """Manages WebSocket connections for real-time chat"""
    
    def __init__(self):
        # Store active connections grouped by room
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store user to connection mapping
        self.user_connections: Dict[str, WebSocket] = {}
        # Store room participants
        self.room_participants: Dict[str, Set[str]] = {}
        # Store user to room mapping
        self.user_rooms: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: str, user_id: str):
        """Accept a new WebSocket connection and add to room group"""
        await websocket.accept()
        
        # Add connection to room group
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
        
        # Map user to connection
        self.user_connections[user_id] = websocket
        
        # Add user to room participants
        if room_id not in self.room_participants:
            self.room_participants[room_id] = set()
        self.room_participants[room_id].add(user_id)
        
        # Add room to user's rooms
        if user_id not in self.user_rooms:
            self.user_rooms[user_id] = set()
        self.user_rooms[user_id].add(room_id)
        
        # Notify other participants that user is online
        await self.broadcast_to_room(room_id, {
            "type": "user_online",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }, exclude_user=user_id)
        
        print(f"User {user_id} connected to room {room_id}")
    
    def disconnect(self, websocket: WebSocket, room_id: str, user_id: str):
        """Remove WebSocket connection and clean up"""
        # Remove from room group
        if room_id in self.active_connections:
            if websocket in self.active_connections[room_id]:
                self.active_connections[room_id].remove(websocket)
            
            # Clean up empty room groups
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
        
        # Remove user connection mapping
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        
        # Remove from room participants
        if room_id in self.room_participants:
            self.room_participants[room_id].discard(user_id)
            
            # Notify other participants that user is offline
            asyncio.create_task(self.broadcast_to_room(room_id, {
                "type": "user_offline",
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }))
        
        # Remove room from user's rooms
        if user_id in self.user_rooms:
            self.user_rooms[user_id].discard(room_id)
            if not self.user_rooms[user_id]:
                del self.user_rooms[user_id]
        
        print(f"User {user_id} disconnected from room {room_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send a message to a specific user"""
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending personal message to {user_id}: {e}")
                # Connection might be stale, remove it
                del self.user_connections[user_id]
    
    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: str = None):
        """Broadcast a message to all participants in a room"""
        if room_id in self.active_connections:
            message_text = json.dumps(message)
            disconnected_connections = []
            
            for connection in self.active_connections[room_id]:
                try:
                    # Skip sending to excluded user (e.g., message sender)
                    if exclude_user:
                        # Find user_id for this connection
                        user_id = None
                        for uid, conn in self.user_connections.items():
                            if conn == connection:
                                user_id = uid
                                break
                        
                        if user_id == exclude_user:
                            continue
                    
                    await connection.send_text(message_text)
                except Exception as e:
                    print(f"Error broadcasting to connection: {e}")
                    disconnected_connections.append(connection)
            
            # Clean up disconnected connections
            for connection in disconnected_connections:
                self.active_connections[room_id].remove(connection)
    
    async def broadcast_typing_indicator(self, room_id: str, user_id: str, is_typing: bool):
        """Broadcast typing indicator to room participants"""
        await self.broadcast_to_room(room_id, {
            "type": "typing_indicator",
            "user_id": user_id,
            "is_typing": is_typing,
            "timestamp": datetime.now().isoformat()
        }, exclude_user=user_id)
    
    async def broadcast_message_read(self, room_id: str, user_id: str, message_id: str):
        """Broadcast message read status to room participants"""
        await self.broadcast_to_room(room_id, {
            "type": "message_read",
            "user_id": user_id,
            "message_id": message_id,
            "timestamp": datetime.now().isoformat()
        }, exclude_user=user_id)
    
    def get_online_users(self, room_id: str) -> List[str]:
        """Get list of online users in a room"""
        if room_id in self.room_participants:
            return list(self.room_participants[room_id])
        return []
    
    def is_user_online(self, user_id: str) -> bool:
        """Check if a user is currently online"""
        return user_id in self.user_connections
    
    async def broadcast_to_user_rooms(self, user_id: str, message: dict):
        """Broadcast a message to all rooms a user is in"""
        if user_id in self.user_rooms:
            for room_id in self.user_rooms[user_id]:
                await self.broadcast_to_room(room_id, message)

# Global connection manager instance
manager = ConnectionManager()