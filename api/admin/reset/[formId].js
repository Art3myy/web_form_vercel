import { kv } from '@vercel/kv';

export async function POST(request, { params }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formId = params.formId;
  try {
    await kv.del(`form:${formId}`);
    return new Response(`Submissions for ${formId} have been reset.`, { status: 200 });
  } catch (error) {
    return new Response('Error resetting submissions', { status: 500 });
  }
}
