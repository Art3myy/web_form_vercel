import { createClient } from 'redis';

export async function POST(request) {
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

    await redis.del(`form:${formId}`);
    await redis.quit();

    return new Response(`Submissions for ${formId} have been reset.`, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error resetting submissions', { status: 500 });
  }
}