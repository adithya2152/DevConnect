import os
os.environ.pop("SSL_CERT_FILE", None)

from supabase import create_client, Client, SupabaseException
import requests
from dotenv import load_dotenv

load_dotenv()  # Loads .env file contents into environment variables

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
NVIDIA_EMBEDDING_ENDPOINT = "https://integrate.api.nvidia.com/v1/embeddings"

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY or not NVIDIA_API_KEY:
    raise RuntimeError("❌ Missing environment variables in .env file.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def generate_embedding(text: str) -> list[float]:
    payload = {
        "input": [text],
        "model": "nvidia/nv-embedqa-e5-v5",
        "encoding_format": "float",
        "input_type": "query",
        "truncate": "NONE",
    }

    response = requests.post(
        NVIDIA_EMBEDDING_ENDPOINT,
        headers={
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json",
        },
        json=payload,
    )

    if response.status_code != 200:
        raise RuntimeError(f"NVIDIA API error: {response.status_code} {response.text}")

    data = response.json()
    embedding = data.get("data", [{}])[0].get("embedding")
    if not embedding or len(embedding) == 0:
        raise RuntimeError("❌ Empty or invalid embedding returned.")
    return embedding

def embed_profiles():
    try:
        response = supabase.from_("profiles").select("id, username, full_name, bio, skills, projects").execute()
        profiles = response.data
    except SupabaseException as e:
        raise RuntimeError(f"Failed to fetch profiles: {e}")

    if not profiles:
        print("No profiles found.")
        return

    for profile in profiles:
        text = f"{profile.get('bio') or ''} {profile.get('skills') or ''} {profile.get('projects') or ''}".strip()
        print(f"\n🔹 Embedding profile: {profile.get('username')}")
        print(f"📄 Text: \"{text}\"")

        try:
            embedding = generate_embedding(text)

            update_response = supabase.from_("profiles").update({"embedding": embedding}).eq("id", profile["id"]).execute()
            # update_response.data contains updated rows
            print(f"✅ Successfully updated profile {profile.get('username')}")

        except Exception as err:
            print(f"❌ Embedding failed for {profile.get('username')}: {err}")

def embed_projects():
    try:
        response = supabase.from_("app_projects").select(
            "id, title, description, detailed_description, domain, required_skills, tech_stack, programming_languages"
        ).execute()
        projects = response.data
    except SupabaseException as e:
        raise RuntimeError(f"Failed to fetch projects: {e}")

    if not projects:
        print("No projects found.")
        return

    for project in projects:
        text = f"""
        Title: {project.get('title')}
        Description: {project.get('description')}
        Details: {project.get('detailed_description') or ''}
        Domain: {project.get('domain') or ''}
        Skills: {', '.join(project.get('required_skills') or [])}
        Stack: {', '.join(project.get('tech_stack') or [])}
        Languages: {', '.join(project.get('programming_languages') or [])}
        """.replace("\n", " ").strip()

        print(f"\n🔹 Embedding project: {project.get('title')}")
        print(f"📄 Text: \"{text}\"")

        try:
            embedding = generate_embedding(text)

            update_response = supabase.from_("app_projects").update({"embedding": embedding}).eq("id", project["id"]).execute()
            print(f"✅ Successfully updated project {project.get('title')}")

        except Exception as err:
            print(f"❌ Embedding failed for {project.get('title')}: {err}")

def main():
    print("🚀 Starting embedding process...")
    embed_profiles()
    embed_projects()
    print("\n✅ All embeddings completed.")

if __name__ == "__main__":
    main()
