import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { extractIntent } from './extract-intent.js';
import { findPeople, findProjects } from './search.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// === NATURAL REPLY GENERATOR ===
async function generateReply(message, context = '') {
  const prompt = `
You are DevBot, a helpful AI assistant like ChatGPT. You help users find people and projects.
Respond conversationally and clearly using the context.

Context: ${context}

User: ${message}
DevBot:
  `;

  const res = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'mistralai/mistral-7b-instruct',
      messages: [{ role: 'user', content: prompt }]
    },
    {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return res.data.choices[0].message.content.trim();
}

// === MAIN CHAT ENDPOINT ===
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  try {
    const { intent, domain } = await extractIntent(message);
    let context = '';
    let results = [];

    if (intent === 'find_people') {
      const people = await findPeople(domain);
      results = people;

      if (people.length > 0) {
        context = `These people are working on ${domain}:\n` +
          people.map(p => `${p.full_name || p.username} (score: ${p.score})`).join(', ');
      } else {
        context = `No people found for ${domain}.`;
      }
    } else if (intent === 'find_projects') {
      const projects = await findProjects(domain);

      // Pick only important fields for frontend cards:
      results = projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        domain: p.domain,
        difficulty_level: p.difficulty_level,
        tech_stack: p.tech_stack,
        programming_languages: p.programming_languages,
        github_url: p.github_url,
        demo_url: p.demo_url,
        is_recruiting: p.is_recruiting,
        score: p.score // if you have similarity score
      }));

      if (projects.length > 0) {
        context = `Here are some projects on ${domain}:\n` +
          projects.map(p => `${p.title} (Domain: ${p.domain || 'N/A'})`).join(', ');
      } else {
        context = `No projects found for ${domain}.`;
      }
    } else {
      context = "No specific intent matched. Just chat freely!";
    }

    const reply = await generateReply(message, context);

    return res.json({ message: reply, results });

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ message: 'Internal chatbot error' });
  }
});

app.listen(3000, () => {
  console.log('🚀 Chatbot backend running at http://localhost:3000');
});
