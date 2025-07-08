"""
Database connection and utilities
Handles Supabase connection and common database operations
"""

from supabase import create_client, Client
import os
from dotenv import load_dotenv
from typing import Optional, Dict, List, Any
import uuid
from datetime import datetime

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_service_key = os.getenv("SUPABASE_KEY_SERVICE")

if not supabase_url or not supabase_key:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY environment variables must be set")

# Client for regular operations
supabase: Client = create_client(supabase_url, supabase_key)

# Service client for admin operations
supabase_admin: Client = create_client(supabase_url, supabase_service_key)

class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self):
        self.client = supabase
        self.admin_client = supabase_admin
    
    # User operations
    async def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile by ID"""
        try:
            response = self.client.table('profiles').select('*').eq('id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    async def search_users(self, query: str, current_user_id: str) -> List[Dict]:
        """Search users by username, full_name, or email"""
        try:
            response = self.client.table('profiles').select(
                'id, username, full_name, email, bio, location, skills, is_online, last_seen'
            ).or_(
                f'username.ilike.%{query}%,full_name.ilike.%{query}%,email.ilike.%{query}%'
            ).neq('id', current_user_id).limit(20).execute()
            
            return response.data or []
        except Exception as e:
            print(f"Error searching users: {e}")
            return []
    
    async def get_user_connections(self, user_id: str) -> List[Dict]:
        """Get users that the current user is following"""
        try:
            response = self.client.table('user_connections').select(
                'following_id, profiles!user_connections_following_id_fkey(id, username, full_name, email, bio, is_online, last_seen)'
            ).eq('follower_id', user_id).execute()
            
            connections = []
            for conn in response.data or []:
                if conn.get('profiles'):
                    connections.append(conn['profiles'])
            
            return connections
        except Exception as e:
            print(f"Error getting user connections: {e}")
            return []
    
    async def follow_user(self, follower_id: str, following_id: str) -> bool:
        """Follow a user"""
        try:
            # Check if already following
            existing = self.client.table('user_connections').select('id').eq(
                'follower_id', follower_id
            ).eq('following_id', following_id).execute()
            
            if existing.data:
                return False  # Already following
            
            # Create connection
            self.client.table('user_connections').insert({
                'follower_id': follower_id,
                'following_id': following_id
            }).execute()
            
            return True
        except Exception as e:
            print(f"Error following user: {e}")
            return False
    
    async def unfollow_user(self, follower_id: str, following_id: str) -> bool:
        """Unfollow a user"""
        try:
            self.client.table('user_connections').delete().eq(
                'follower_id', follower_id
            ).eq('following_id', following_id).execute()
            return True
        except Exception as e:
            print(f"Error unfollowing user: {e}")
            return False
    
    async def is_following(self, follower_id: str, following_id: str) -> bool:
        """Check if a user is following another user"""
        try:
            response = self.client.table('user_connections').select('id').eq(
                'follower_id', follower_id
            ).eq('following_id', following_id).execute()
            
            return len(response.data) > 0
        except Exception as e:
            print(f"Error checking follow status: {e}")
            return False
    
    async def get_followers_count(self, user_id: str) -> int:
        """Get the number of followers for a user"""
        try:
            response = self.client.table('user_connections').select('id').eq(
                'following_id', user_id
            ).execute()
            
            return len(response.data)
        except Exception as e:
            print(f"Error getting followers count: {e}")
            return 0
    
    async def get_following_count(self, user_id: str) -> int:
        """Get the number of users a user is following"""
        try:
            response = self.client.table('user_connections').select('id').eq(
                'follower_id', user_id
            ).execute()
            
            return len(response.data)
        except Exception as e:
            print(f"Error getting following count: {e}")
            return 0
    
    async def get_user_followers(self, user_id: str) -> List[Dict]:
        """Get users that are following the specified user"""
        try:
            response = self.client.table('user_connections').select(
                'follower_id, profiles!user_connections_follower_id_fkey(id, username, full_name, email, bio, is_online, last_seen)'
            ).eq('following_id', user_id).execute()
            
            followers = []
            for conn in response.data or []:
                if conn.get('profiles'):
                    followers.append(conn['profiles'])
            
            return followers
        except Exception as e:
            print(f"Error getting user followers: {e}")
            return []
    
    async def update_user_profile(self, user_id: str, update_data: Dict) -> bool:
        """Update user profile"""
        try:
            # Add updated_at timestamp
            update_data['updated_at'] = datetime.now().isoformat()
            
            response = self.client.table('profiles').update(update_data).eq('id', user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            print(f"Error updating user profile: {e}")
            return False
    
    # Room operations
    async def get_user_rooms(self, user_id: str) -> List[Dict]:
        """Get all rooms for a user"""
        try:
            response = self.client.table('room_members').select(
                'room_id, rooms!room_members_room_id_fkey(id, name, type, created_by, created_at)'
            ).eq('user_id', user_id).execute()
            
            rooms = []
            for member in response.data or []:
                if member.get('rooms'):
                    room = member['rooms']
                    # Get last message for each room
                    last_message = await self.get_last_message(room['id'])
                    room['last_message'] = last_message
                    
                    # Get unread count
                    unread_count = await self.get_unread_count(room['id'], user_id)
                    room['unread_count'] = unread_count
                    
                    # Get room members
                    members = await self.get_room_members(room['id'])
                    room['members'] = members
                    
                    rooms.append(room)
            
            return rooms
        except Exception as e:
            print(f"Error getting user rooms: {e}")
            return []
    
    async def create_private_room(self, user1_id: str, user2_id: str) -> Optional[Dict]:
        """Create or get existing private room between two users"""
        try:
            # Check if private room already exists
            existing_rooms = self.client.table('room_members').select(
                'room_id, rooms!room_members_room_id_fkey(id, type)'
            ).eq('user_id', user1_id).execute()
            
            for room_member in existing_rooms.data or []:
                room = room_member.get('rooms')
                if room and room['type'] == 'private':
                    # Check if user2 is also in this room
                    other_member = self.client.table('room_members').select('id').eq(
                        'room_id', room['id']
                    ).eq('user_id', user2_id).execute()
                    
                    if other_member.data:
                        return room
            
            # Create new private room
            room_response = self.client.table('rooms').insert({
                'name': f'Private Chat',
                'type': 'private',
                'created_by': user1_id
            }).execute()
            
            if not room_response.data:
                return None
            
            room = room_response.data[0]
            
            # Add both users to the room
            self.client.table('room_members').insert([
                {'room_id': room['id'], 'user_id': user1_id},
                {'room_id': room['id'], 'user_id': user2_id}
            ]).execute()
            
            return room
        except Exception as e:
            print(f"Error creating private room: {e}")
            return None
    
    async def create_group_room(self, name: str, created_by: str, member_ids: List[str]) -> Optional[Dict]:
        """Create a group room"""
        try:
            # Create room
            room_response = self.client.table('rooms').insert({
                'name': name,
                'type': 'group',
                'created_by': created_by
            }).execute()
            
            if not room_response.data:
                return None
            
            room = room_response.data[0]
            
            # Add creator to member list if not already included
            if created_by not in member_ids:
                member_ids.append(created_by)
            
            # Add all members to the room
            members_data = [{'room_id': room['id'], 'user_id': user_id} for user_id in member_ids]
            self.client.table('room_members').insert(members_data).execute()
            
            return room
        except Exception as e:
            print(f"Error creating group room: {e}")
            return None
    
    async def get_room_members(self, room_id: str) -> List[Dict]:
        """Get all members of a room"""
        try:
            response = self.client.table('room_members').select(
                'user_id, profiles!room_members_user_id_fkey(id, username, full_name, email, is_online)'
            ).eq('room_id', room_id).execute()
            
            members = []
            for member in response.data or []:
                if member.get('profiles'):
                    members.append(member['profiles'])
            
            return members
        except Exception as e:
            print(f"Error getting room members: {e}")
            return []
    
    # Message operations
    async def get_room_messages(self, room_id: str, limit: int = 50, offset: int = 0) -> List[Dict]:
        """Get messages for a room with pagination"""
        try:
            response = self.client.table('messages').select(
                'id, content, file_url, created_at, sender_id, profiles!messages_sender_id_fkey(username, full_name)'
            ).eq('room_id', room_id).order('created_at', desc=True).limit(limit).offset(offset).execute()
            
            # Reverse to get chronological order
            messages = list(reversed(response.data or []))
            return messages
        except Exception as e:
            print(f"Error getting room messages: {e}")
            return []
    
    async def send_message(self, room_id: str, sender_id: str, content: str, file_url: Optional[str] = None) -> Optional[Dict]:
        """Send a message to a room"""
        try:
            response = self.client.table('messages').insert({
                'room_id': room_id,
                'sender_id': sender_id,
                'content': content,
                'file_url': file_url
            }).execute()
            
            if response.data:
                message = response.data[0]
                # Get sender info
                sender = await self.get_user_profile(sender_id)
                message['sender'] = sender
                return message
            
            return None
        except Exception as e:
            print(f"Error sending message: {e}")
            return None
    
    async def get_last_message(self, room_id: str) -> Optional[Dict]:
        """Get the last message in a room"""
        try:
            response = self.client.table('messages').select(
                'id, content, created_at, sender_id, profiles!messages_sender_id_fkey(username, full_name)'
            ).eq('room_id', room_id).order('created_at', desc=True).limit(1).execute()
            
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error getting last message: {e}")
            return None
    
    async def mark_message_as_read(self, message_id: str, user_id: str) -> bool:
        """Mark a message as read by a user"""
        try:
            # Check if already marked as read
            existing = self.client.table('message_reads').select('id').eq(
                'message_id', message_id
            ).eq('user_id', user_id).execute()
            
            if existing.data:
                return True  # Already marked as read
            
            # Mark as read
            self.client.table('message_reads').insert({
                'message_id': message_id,
                'user_id': user_id
            }).execute()
            
            return True
        except Exception as e:
            print(f"Error marking message as read: {e}")
            return False
    
    async def get_unread_count(self, room_id: str, user_id: str) -> int:
        """Get unread message count for a user in a room"""
        try:
            # Get all messages in room
            messages_response = self.client.table('messages').select('id').eq('room_id', room_id).execute()
            message_ids = [msg['id'] for msg in messages_response.data or []]
            
            if not message_ids:
                return 0
            
            # Get read messages
            read_response = self.client.table('message_reads').select('message_id').eq(
                'user_id', user_id
            ).in_('message_id', message_ids).execute()
            
            read_message_ids = [read['message_id'] for read in read_response.data or []]
            
            return len(message_ids) - len(read_message_ids)
        except Exception as e:
            print(f"Error getting unread count: {e}")
            return 0
    
    # Notification operations
    async def create_notification(self, recipient_id: str, sender_id: str, type: str, 
                                reference_id: Optional[str] = None, message: Optional[str] = None) -> bool:
        """Create a notification"""
        try:
            self.client.table('notifications').insert({
                'recipient_id': recipient_id,
                'sender_id': sender_id,
                'type': type,
                'reference_id': reference_id,
                'message': message
            }).execute()
            return True
        except Exception as e:
            print(f"Error creating notification: {e}")
            return False
    
    async def get_user_notifications(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Get notifications for a user"""
        try:
            response = self.client.table('notifications').select(
                'id, type, message, is_read, created_at, reference_id, profiles!notifications_sender_fkey(username, full_name)'
            ).eq('recipient_id', user_id).order('created_at', desc=True).limit(limit).execute()
            
            return response.data or []
        except Exception as e:
            print(f"Error getting notifications: {e}")
            return []
    
    async def mark_notification_as_read(self, notification_id: str) -> bool:
        """Mark a notification as read"""
        try:
            self.client.table('notifications').update({
                'is_read': True
            }).eq('id', notification_id).execute()
            return True
        except Exception as e:
            print(f"Error marking notification as read: {e}")
            return False

# Global database manager instance
db = DatabaseManager()