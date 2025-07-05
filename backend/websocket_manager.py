"""
WebSocket Manager
Handles real-time connections for chat functionality
Manages connection lifecycle and message broadcasting
"""

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    """
    Manages WebSocket connections for real-time chat
    Handles connection grouping by conversation and broadcasting
    """
    
    def __init__(self):
        # Store active connections grouped by conversation
        self.active_connections: Dict[str, List[WebSocket]] = {}
        # Store user to connection mapping
        self.user_connections: Dict[str, WebSocket] = {}
        # Store conversation participants
        self.conversation_participants: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, conversation_id: str, user_id: str):
        """
        Accept a new WebSocket connection and add to conversation group
        """
        await websocket.accept()
        
        # Add connection to conversation group
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append(websocket)
        
        # Map user to connection
        self.user_connections[user_id] = websocket
        
        # Add user to conversation participants
        if conversation_id not in self.conversation_participants:
            self.conversation_participants[conversation_id] = set()
        self.conversation_participants[conversation_id].add(user_id)
        
        # Notify other participants that user is online
        await self.broadcast_to_conversation(conversation_id, {
            "type": "user_online",
            "user_id": user_id,
            "timestamp": datetime.now().isoformat()
        }, exclude_user=user_id)
        
        print(f"User {user_id} connected to conversation {conversation_id}")
    
    def disconnect(self, websocket: WebSocket, conversation_id: str, user_id: str):
        """
        Remove WebSocket connection and clean up
        """
        # Remove from conversation group
        if conversation_id in self.active_connections:
            if websocket in self.active_connections[conversation_id]:
                self.active_connections[conversation_id].remove(websocket)
            
            # Clean up empty conversation groups
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]
        
        # Remove user connection mapping
        if user_id in self.user_connections:
            del self.user_connections[user_id]
        
        # Remove from conversation participants
        if conversation_id in self.conversation_participants:
            self.conversation_participants[conversation_id].discard(user_id)
            
            # Notify other participants that user is offline
            asyncio.create_task(self.broadcast_to_conversation(conversation_id, {
                "type": "user_offline",
                "user_id": user_id,
                "timestamp": datetime.now().isoformat()
            }))
        
        print(f"User {user_id} disconnected from conversation {conversation_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """
        Send a message to a specific user
        """
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            try:
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                print(f"Error sending personal message to {user_id}: {e}")
                # Connection might be stale, remove it
                del self.user_connections[user_id]
    
    async def broadcast_to_conversation(self, conversation_id: str, message: dict, exclude_user: str = None):
        """
        Broadcast a message to all participants in a conversation
        """
        if conversation_id in self.active_connections:
            message_text = json.dumps(message)
            disconnected_connections = []
            
            for connection in self.active_connections[conversation_id]:
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
                self.active_connections[conversation_id].remove(connection)
    
    async def broadcast_typing_indicator(self, conversation_id: str, user_id: str, is_typing: bool):
        """
        Broadcast typing indicator to conversation participants
        """
        await self.broadcast_to_conversation(conversation_id, {
            "type": "typing_indicator",
            "user_id": user_id,
            "is_typing": is_typing,
            "timestamp": datetime.now().isoformat()
        }, exclude_user=user_id)
    
    async def broadcast_message_read(self, conversation_id: str, user_id: str, message_id: str):
        """
        Broadcast message read status to conversation participants
        """
        await self.broadcast_to_conversation(conversation_id, {
            "type": "message_read",
            "user_id": user_id,
            "message_id": message_id,
            "timestamp": datetime.now().isoformat()
        }, exclude_user=user_id)
    
    def get_online_users(self, conversation_id: str) -> List[str]:
        """
        Get list of online users in a conversation
        """
        if conversation_id in self.conversation_participants:
            return list(self.conversation_participants[conversation_id])
        return []
    
    def is_user_online(self, user_id: str) -> bool:
        """
        Check if a user is currently online
        """
        return user_id in self.user_connections

# Global connection manager instance
manager = ConnectionManager()

# WebSocket endpoint handler
async def websocket_endpoint(websocket: WebSocket, conversation_id: str, user_id: str):
    """
    Handle WebSocket connections for real-time chat
    """
    await manager.connect(websocket, conversation_id, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Handle different message types
            message_type = message_data.get("type")
            
            if message_type == "new_message":
                # Broadcast new message to all participants
                await manager.broadcast_to_conversation(
                    conversation_id,
                    {
                        "type": "new_message",
                        "data": message_data.get("data"),
                        "timestamp": datetime.now().isoformat()
                    },
                    exclude_user=user_id
                )
            
            elif message_type == "typing_start":
                # Broadcast typing indicator
                await manager.broadcast_typing_indicator(conversation_id, user_id, True)
            
            elif message_type == "typing_stop":
                # Stop typing indicator
                await manager.broadcast_typing_indicator(conversation_id, user_id, False)
            
            elif message_type == "message_read":
                # Broadcast message read status
                message_id = message_data.get("message_id")
                await manager.broadcast_message_read(conversation_id, user_id, message_id)
            
            else:
                print(f"Unknown message type: {message_type}")
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, conversation_id, user_id)