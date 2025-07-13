import os
os.environ.pop("SSL_CERT_FILE", None)
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables from a .env file (make sure you have python-dotenv installed)
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_and_print():
    response =  supabase.from_("profiles").select("*").eq("id", "04a7eead-f5cc-464d-a34d-e0f15fa27338").single().execute()


    print("Data:", response.data)

if __name__ == "__main__":
    fetch_and_print()
