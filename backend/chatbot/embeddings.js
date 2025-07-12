// embeddings.js

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import * as dotenv from 'dotenv';
dotenv.config();

// === CONFIG ===
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const NVIDIA_EMBEDDING_ENDPOINT = "https://integrate.api.nvidia.com/v1/embeddings";

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !NVIDIA_API_KEY) {
  throw new Error('❌ Missing environment variables in .env file.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// === Generate embedding ===
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

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`NVIDIA API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const embedding = data.data[0].embedding;

  if (!embedding || embedding.length === 0) {
    throw new Error('❌ Empty or invalid embedding returned.');
  }

  return embedding;
}

// === Embed profiles ===
async function embedProfiles() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, bio, skills,projects');

  if (error) throw error;

  for (const profile of profiles) {
    const text = `${profile.bio || ''} ${profile.skills|| ''} ${profile.projects || ''}`;
    console.log(`\n🔹 Embedding profile: ${profile.username}`);
    console.log(`📄 Text: "${text}"`);

    try {
      const embedding = await generateEmbedding(text);
      

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ embedding })
        .eq('id', profile.id);

      if (updateError) {
        console.error(`❌ Failed to update profile ${profile.username}:`, updateError.message);
      } else {
        console.log(`✅ Successfully updated profile ${profile.username}`);
      }

    } catch (err) {
      console.error(`❌ Embedding failed for ${profile.username}:`, err.message);
    }
  }
}

// === Embed app_projects ===
async function embedProjects() {
  const { data: projects, error } = await supabase
    .from('app_projects')
    .select(`
      id, 
      title, 
      description, 
      detailed_description, 
      domain, 
      required_skills, 
      tech_stack, 
      programming_languages
    `);

  if (error) throw error;

  for (const project of projects) {
    const text = `
      Title: ${project.title}
      Description: ${project.description}
      Details: ${project.detailed_description || ''}
      Domain: ${project.domain || ''}
      Skills: ${(project.required_skills || []).join(', ')}
      Stack: ${(project.tech_stack || []).join(', ')}
      Languages: ${(project.programming_languages || []).join(', ')}
    `.replace(/\s+/g, ' ').trim();  // Clean extra whitespace

    console.log(`\n🔹 Embedding project: ${project.title}`);
    console.log(`📄 Text: "${text}"`);

    try {
      const embedding = await generateEmbedding(text);

      const { error: updateError } = await supabase
        .from('app_projects')
        .update({ embedding })
        .eq('id', project.id);

      if (updateError) {
        console.error(`❌ Failed to update project ${project.title}:`, updateError.message);
      } else {
        console.log(`✅ Successfully updated project ${project.title}`);
      }

    } catch (err) {
      console.error(`❌ Embedding failed for ${project.title}:`, err.message);
    }
  }
}


// === Main ===
async function main() {
  console.log('🚀 Starting embedding process...');
  await embedProfiles();
  await embedProjects();
  console.log('\n✅ All embeddings completed.');
}

main().catch(err => {
  console.error('❌ Fatal error during embedding:', err);
});
