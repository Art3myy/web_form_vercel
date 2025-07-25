import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formId = params.formId;
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
    const submissions = await redis.lRange(`form:${formId}`, 0, -1);

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
