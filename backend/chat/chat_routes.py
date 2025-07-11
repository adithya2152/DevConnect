from db import get_user_conv, get_last_message
from fastapi import FastAPI , Depends , status , HTTPException
from fastapi.responses import JSONResponse
from auth.dependencies import get_current_user_id

chat_app = FastAPI()


from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

@chat_app.get("/conversations")
async def get_conversations(user_id: str = Depends(get_current_user_id)):
    """
    Fetch all 1-1 conversations the authenticated user is part of.
    """
    try:
        print("✅ Fetched userId through auth:", user_id)
        conversations = await get_user_conv(user_id)  # Expected to return a list of private_rooms

        if not conversations:
            return JSONResponse(
                status_code=status.HTTP_204_NO_CONTENT,
                content={"message": "No conversations found."}
            )

        # Fetch last messages for each room
        enriched_conversations = []
        for conv in conversations:
            room_id = conv["room_id"]
            last_msg = await get_last_message(room_id)

            enriched_conversations.append({
                **conv,  # All room details
                "last_message": last_msg  # Might be None if no messages yet
            })

        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"conversations": enriched_conversations}
        )

    except Exception as e:
        print(f"❌ Error fetching conversations for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching conversations."
        )
