import { defineLive } from 'next-sanity/live';
import { client } from './client';

export const { sanityFetch, SanityLive } = defineLive({
  client,
  // Use a reader token on the server/browser side so we can view drafts in draftMode
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
});
