import os
os.environ.pop("SSL_CERT_FILE", None)

from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def test_supabase():
    response = supabase.from_("profiles").select("*").execute()
    print(type(response))
    print(dir(response))
    print("Error:", response.error)
    print("Data:", response.data)

if __name__ == "__main__":
    test_supabase()
