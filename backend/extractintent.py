import os
import re
import httpx
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def extract_intent(message: str) -> dict:
    prompt = f'''
You are an assistant that extracts the user's intent and domain from their message.

Return JSON like:
{{
  "intent": "find_people" or "find_projects",
  "domain": "find the domain and project related stack mentioned include all information give this in a single string"
}}

Message: "{message}"
'''

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    json_data = {
        "model": "mistralai/mistral-7b-instruct",
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=json_data,
        )
        response.raise_for_status()
        data = response.json()

    raw = data["choices"][0]["message"]["content"]
    print("Extracted raw intent response:", raw)

    try:
        match = re.search(r'"intent"\s*:\s*"(.+?)".+"domain"\s*:\s*"(.+?)"', raw, re.DOTALL)
        if not match:
            raise ValueError("Bad format in intent extraction response")
        intent = match.group(1).strip()
        domain = match.group(2).strip()
        return {"intent": intent, "domain": domain}
    except Exception as e:
        print(f"Failed to extract intent: {e}")
        return {"intent": None, "domain": None}
