"""
Authentication utilities
Handles JWT token validation and user authentication
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer
import jwt
import os
from typing import Optional, Dict
from database import db

security = HTTPBearer()

async def get_current_user(token: str = Depends(security)) -> Dict:
    """
    Extract and validate user from JWT token
    """
    try:
        # For development, we'll use a simple mock
        # In production, implement proper JWT validation
        
        # Mock user for development - replace with actual JWT validation
        if token.credentials == "mock_token":
            return {
                "id": "550e8400-e29b-41d4-a716-446655440000",  # Mock UUID
                "email": "alex.chen@example.com",
                "username": "alexchen"
            }
        
        # TODO: Implement actual JWT validation
        # payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        # user_id = payload.get("sub")
        # if not user_id:
        #     raise HTTPException(status_code=401, detail="Invalid token")
        
        # user = await db.get_user_profile(user_id)
        # if not user:
        #     raise HTTPException(status_code=401, detail="User not found")
        
        # return user
        
        # For now, return mock user
        return {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "email": "alex.chen@example.com", 
            "username": "alexchen"
        }
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

async def get_optional_user(token: Optional[str] = Depends(security)) -> Optional[Dict]:
    """
    Get user if token is provided, otherwise return None
    """
    if not token:
        return None
    
    try:
        return await get_current_user(token)
    except HTTPException:
        return None