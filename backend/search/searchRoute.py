from db import get_devs
from fastapi import FastAPI , Depends , Query,status , HTTPException
from fastapi.responses import JSONResponse
from auth.dependencies import get_current_user_id


search_app = FastAPI()

@search_app.get("/devs")
async def search_devs(
    q: str = Query(..., min_length=1),
    user_id: str = Depends(get_current_user_id)
):
    """
    Search developer profiles by name or username.
    Protected route — requires valid access token.
    """
    try:
        all_devs = await get_devs()
        if not all_devs:
            return JSONResponse(status_code=200, content=[])

        q_lower = q.lower()

        filtered_devs = [
            dev for dev in all_devs
            if q_lower in (dev.get("name") or "").lower()
            or q_lower in (dev.get("username") or "").lower()
        ]

        return JSONResponse(status_code=200, content=filtered_devs)

    except Exception as e:
        print(f"❌ Error during /search/devs for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error while searching developers"
        )