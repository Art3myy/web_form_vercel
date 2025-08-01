import { createClient } from 'redis';
import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

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

    const formFilePath = resolve(process.cwd(), 'forms', `${formId}.md`);
    const formFileContent = await readFile(formFilePath, 'utf-8');
    const { data: formData } = matter(formFileContent);

    const submissions = await redis.lRange(`form:${formId}`, 0, -1);
    await redis.quit();

    let markdown = `# ${formData.title}\n\n`;
    markdown += '## Questions\n\n';
    formData.questions.forEach(q => {
      markdown += `*   **${q.id}:** ${q.label}\n`;
    });
    markdown += '\n---\n\n## Submissions\n\n';

    markdown += submissions
      .map(submissionStr => {
        const answers = JSON.parse(submissionStr);
        let entry = '';
        for (const [key, value] of Object.entries(answers)) {
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