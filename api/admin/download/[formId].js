import { kv } from '@vercel/kv';

export async function GET(request, { params }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formId = params.formId;
  try {
    const submissions = await kv.lrange(`form:${formId}`, 0, -1);

    let markdown = `# Submissions for ${formId}\n\n`;
    markdown += submissions
      .map(submission => {
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
    return new Response('Error fetching submissions', { status: 500 });
  }
}