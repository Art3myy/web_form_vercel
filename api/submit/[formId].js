import { Redis } from '@upstash/redis';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function POST(request, { params }) {
  const formId = params.formId;
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
        return new Response(`Missing required field: ${field}`,
          { status: 400 });
      }
    }

    const newSubmission = {
      submittedAt: new Date().toISOString(),
      answers: submission.answers,
    };

    await redis.lpush(`form:${formId}`, newSubmission);

    return new Response('Submission successful', { status: 200 });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new Response('Form not found', { status: 404 });
    }
    console.error(error);
    return new Response('Error processing submission', { status: 500 });
  }
}