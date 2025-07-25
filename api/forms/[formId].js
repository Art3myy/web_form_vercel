import { readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

export async function GET(request, { params }) {
  const formId = params.formId;
  const filePath = resolve(process.cwd(), 'forms', `${formId}.md`);

  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

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
    if (error.code === 'ENOENT') {
      return new Response('Form not found', { status: 404 });
    }
    return new Response('Error reading form file', { status: 500 });
  }
}
