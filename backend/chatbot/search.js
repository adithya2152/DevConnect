// search.js
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_EMBEDDING_ENDPOINT = "https://integrate.api.nvidia.com/v1/embeddings";

async function generateEmbedding(text) {
  const payload = {
    input: [text],
    model: "nvidia/nv-embedqa-e5-v5",
    encoding_format: "float",
    input_type: "query",
    truncate: "NONE"
  };

  const response = await fetch(NVIDIA_EMBEDDING_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  return data.data[0].embedding;
}

export async function findPeople(query) {
  const embedding = await generateEmbedding(query);
  const { data, error } = await supabase.rpc('match_profiles_by_embedding', {
    query_embedding: embedding
  });

  if (error) throw error;

  return data.map(person => ({
    ...person,
    score: person.score.toFixed(3)
  }));
}

export async function findProjects(query) {
  const embedding = await generateEmbedding(query);
  const { data, error } = await supabase.rpc('match_projects_by_embedding', {
    query_embedding: embedding
  });

  if (error) throw error;

  return data.map(({ embedding, ...rest }) => rest);
}
