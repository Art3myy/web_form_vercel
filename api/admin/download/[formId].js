import { createClient } from 'redis';

export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url);
  const formId = pathname.split('/').pop();
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const redis = createClient({ url: process.env.REDIS_URL });
    redis.on('error', (err) => console.error('Redis Client Error', err));
    await redis.connect();

    const submissions = await redis.lRange(`form:${formId}`, 0, -1);
    await redis.quit();

    let markdown = `# Submissions for ${formId}\n\n`;
    markdown += submissions
      .map(submissionStr => {
        const submission = JSON.parse(submissionStr);
        let entry = `**Submitted At:** ${submission.submittedAt}\n`;
        for (const [key, value] of Object.entries(submission.answers)) {
          entry += `*   **${key}:** ${value}\n`;
        }
        return entry;
      })
      .join('\n---\n');

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="${formId}_submissions.md"`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Error fetching submissions', { status: 500 });
  }
}