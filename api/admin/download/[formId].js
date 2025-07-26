export async function GET(request) {
  const { pathname, searchParams } = new URL(request.url);
  const formId = pathname.split('/').pop();
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  return new Response(`This is a test for formId: ${formId}. The endpoint is working.`, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
