import os
import json
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_EMBEDDING_ENDPOINT = "https://integrate.api.nvidia.com/v1/embeddings"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


async def generate_embedding(text: str) -> list[float]:
    payload = {
        "input": [text],
        "model": "nvidia/nv-embedqa-e5-v5",
        "encoding_format": "float",
        "input_type": "query",
        "truncate": "NONE"
    }

    headers = {
        "Authorization": f"Bearer {NVIDIA_API_KEY}",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(NVIDIA_EMBEDDING_ENDPOINT, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    return data["data"][0]["embedding"]


async def find_people(query: str) -> list[dict]:
    embedding = await generate_embedding(query)

    # Supabase RPC expects a vector param, pass as a list (depends on the supabase client)
    response = supabase.rpc("match_profiles_by_embedding", {"query_embedding": embedding}).execute()

    

    data = response.data or []

    # Format score to 3 decimals as string
    for person in data:
        if "score" in person:
            person["score"] = f"{person['score']:.3f}"

    return data


async def find_projects(query: str) -> list[dict]:
    embedding = await generate_embedding(query)

    response = supabase.rpc("match_projects_by_embedding", {"query_embedding": embedding}).execute()

   

    data = response.data or []

    # Remove embedding field if present
    for project in data:
        project.pop("embedding", None)

    return data
