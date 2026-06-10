import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { validatePreviewUrl } from '@sanity/preview-url-secret';
import { client } from '@/sanity/lib/client';

export async function GET(request: Request) {
  const token = process.env.SANITY_API_READ_TOKEN;
  
  // If no token is configured, fall back to simple manual check (for easy local dev setup)
  if (!token) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret') || searchParams.get('sanity-preview-secret');
    const previewSecret = process.env.SANITY_PREVIEW_SECRET;
    
    if (previewSecret && secret !== previewSecret) {
      return new Response('Invalid secret (API read token not set)', { status: 401 });
    }
    
    const draft = await draftMode();
    draft.enable();
    
    const slug = searchParams.get('slug') || '/';
    redirect(slug);
  }

  // Secure validation using Sanity's official preview url secret validator
  const clientWithToken = client.withConfig({ token });
  const { isValid, redirectTo = '/' } = await validatePreviewUrl(
    clientWithToken,
    request.url
  );

  if (!isValid) {
    return new Response('Invalid secret', { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(redirectTo);
}
