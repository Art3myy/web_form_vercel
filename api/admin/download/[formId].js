import { Redis } from '@upstash/redis';const redis = new Redis({  url: process.env.UPSTASH_REDIS_REST_URL,  token: process.env.UPSTASH_REDIS_REST_TOKEN,});export async function GET(request, { params }) {  const { searchParams } = new URL(request.url);  const token = searchParams.get('token');  if (token !== process.env.ADMIN_SECRET_KEY) {    return new Response('Unauthorized', { status: 401 });  }  const formId = params.formId;  try {    const submissions = await redis.lrange(`form:${formId}`, 0, -1);    let markdown = `# Submissions for ${formId}

`;    markdown += submissions      .map(submission => {        let entry = `**Submitted At:** ${submission.submittedAt}
`;        for (const [key, value] of Object.entries(submission.answers)) {          entry += `*   **${key}:** ${value}
`;        }        return entry;      })      .join('
---
');    return new Response(markdown, {      headers: {        'Content-Type': 'text/markdown',        'Content-Disposition': `attachment; filename="${formId}_submissions.md"`,      },    });  } catch (error) {    console.error(error);    return new Response('Error fetching submissions', { status: 500 });  }}