import { Redis } from '@upstash/redis';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const formId = pathname.split('/').pop();
  const filePath = resolve(process.cwd(), 'forms', `${formId}.md`);

  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const { data } = matter(fileContent);
    const submission = await request.json();

    // Basic validation
    const requiredFields = data.questions
      .filter(q => q.required)
      .map(q => q.id);

    for (const field of requiredFields) {
      if (!submission.answers[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
    }

    const newSubmission = {
      submittedAt: new Date().toISOString(),
      answers: submission.answers,
    };

    await redis.lpush(`form:${formId}`, newSubmission);

    return new Response(JSON.stringify({ message: 'Submission successful' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in /api/submit/[formId]:', error);
    if (error.code === 'ENOENT') {
      return new Response(JSON.stringify({ error: 'Form not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Error processing submission' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
