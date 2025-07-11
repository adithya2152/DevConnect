import os
from supabase import create_client , Client
import logging


try:
    url: str = os.environ["SUPABASE_URL"]
    key: str = os.environ["SUPABASE_KEY"]
    supabase:Client = create_client(url, key)
    logging.info("Connected to Supabase" , url, key)

except KeyError:
    # handle the case where the environment variable is not set
    print("Error: SUPABASE_URL or SUPABASE_KEY environment variable is not set")
    # you can also raise a custom exception or exit the program here

async def get_user_conv(user_id:str):
    try:
        response = (
            supabase.table("private_rooms")
            .select("*")
            .or_(f"user1_id.eq.{user_id},user2_ideq.{user_id}")
            .execute()
        )
        print("selected all conversations",response.data)
        return response.data
    except Exception as e:
        print(f"Error fetching conversations: {e}")
        return None
            
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

async def get_devs():
    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .execute()
        )
        return response.data
    except Exception as e:
        print(f"Error fetching conversations: {e}")
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
    
# async def get_projects():