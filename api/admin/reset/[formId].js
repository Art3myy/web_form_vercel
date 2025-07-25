import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));

await redis.connect();

export async function POST(request, { params }) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (token !== process.env.ADMIN_SECRET_KEY) {
    return new Response('Unauthorized', { status: 401 });
  }

  const formId = params.formId;
  try {
    await redis.del(`form:${formId}`);
    return new Response(`Submissions for ${formId} have been reset.`, { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response('Error resetting submissions', { status: 500 });
  }
}
