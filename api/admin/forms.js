import { readdir, readFile } from 'fs/promises';
import matter from 'gray-matter';
import { resolve } from 'path';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const formsDir = resolve(process.cwd(), 'forms');
  try {
    const files = await readdir(formsDir);
    const forms = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))
        .map(async file => {
          const filePath = resolve(formsDir, file);
          const fileContent = await readFile(filePath, 'utf-8');
          const { data } = matter(fileContent);
          return {
            formId: file.replace('.md', ''),
            title: data.title,
          };
        })
    );
    return new Response(JSON.stringify(forms), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Error reading forms directory' }), { status: 500 });
  }
}
