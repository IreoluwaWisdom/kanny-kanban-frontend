import { cookies } from 'next/headers';

export async function getServerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('refreshToken');
  
  if (!token) {
    return null;
  }

  // In a real app, you'd verify the token here
  // For now, we'll just check if it exists
  return { token: token.value };
}

