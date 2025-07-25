import { createClient } from 'redis';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function POST(request, { params }) {
  const formId = params.formId;
  const filePath = resolve(process.cwd(), 'forms', `${formId}.md`);

  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

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

    await redis.lPush(`form:${formId}`, JSON.stringify(newSubmission));

    return new Response(JSON.stringify({ message: 'Submission successful' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('Error in /api/submit/[formId]:', error);
    if (error.code === 'ENOENT') {
      return new Response(JSON.stringify({ error: 'Form not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Error processing submission' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
