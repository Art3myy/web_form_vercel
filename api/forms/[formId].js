import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

export async function GET(request) {
  const { pathname } = new URL(request.url);
  const formId = pathname.split('/').pop();
  console.log('Attempting to render form with formId:', formId);

  const filePath = resolve(process.cwd(), 'forms', `${formId}.md`);
  console.log('Resolved file path:', filePath);

  try {
    const fileContent = await readFile(filePath, 'utf-8');
    console.log('Successfully read file content.');

    const { data, content } = matter(fileContent);
    console.log('Successfully parsed frontmatter.');

    return new Response(
      JSON.stringify({
        title: data.title,
        description: content,
        questions: data.questions,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/forms/[formId]:', error);
    if (error.code === 'ENOENT') {
      return new Response(JSON.stringify({ error: 'Form not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ error: 'Error reading form file' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
