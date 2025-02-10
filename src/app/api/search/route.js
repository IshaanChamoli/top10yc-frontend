import { OpenAI } from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';
import { headers } from 'next/headers';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Simple in-memory store for rate limiting
const rateLimit = new Map();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.timestamp > 24 * 60 * 60 * 1000) { // 24 hours
      rateLimit.delete(key);
    }
  }
}, 60 * 60 * 1000);

export async function POST(request) {
  try {
    // Get IP address
    const headersList = headers();
    const ip = headersList.get('x-forwarded-for') || 'anonymous';
    
    // Check rate limit
    const now = Date.now();
    const userLimit = rateLimit.get(ip) || { count: 0, timestamp: now };
    
    // Reset count if it's a new day
    if (now - userLimit.timestamp > 24 * 60 * 60 * 1000) {
      userLimit.count = 0;
      userLimit.timestamp = now;
    }
    
    // Check if user has exceeded 100 requests per day
    if (userLimit.count >= 100) {
      const resetTime = new Date(userLimit.timestamp + 24 * 60 * 60 * 1000);
      return Response.json({
        error: 'Rate limit exceeded',
        details: `Daily limit reached. Try again after ${resetTime.toLocaleTimeString()}`
      }, { status: 429 });
    }
    
    // Increment count
    userLimit.count++;
    rateLimit.set(ip, userLimit);

    const { query, limit = 10 } = await request.json();
    
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get embedding for search query
    const embedding = await openai.embeddings.create({
      input: query,
      model: "text-embedding-3-small"
    });

    // Search Pinecone
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    const results = await index.query({
      vector: embedding.data[0].embedding,
      topK: limit,
      includeMetadata: true
    });

    return Response.json({ 
      companies: results.matches,
      remaining: 100 - userLimit.count
    });
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: 'Failed to search companies' }, { status: 500 });
  }
} 