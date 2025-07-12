// extract-intent.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function extractIntent(message) {
  const prompt = `
You are an assistant that extracts the user's intent and domain from their message.

Return JSON like:
{
  "intent": "find_people" or "find_projects",
  "domain": "find the domain and project related stack mentioned include all information give this in a single string"
}

Message: "${message}"
`;

  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  const raw = res.data.choices[0].message.content;
  console.log(raw);

  try {
    const match = raw.match(/"intent"\s*:\s*"(.+?)".+"domain"\s*:\s*"(.+?)"/s);
    if (!match) throw new Error('Bad format');
    const intent = match[1].trim();
    const domain = match[2].trim();
    return { intent, domain };
  } catch (err) {
    console.error('Failed to extract intent:', raw);
    return { intent: null, domain: null };
  }
}
