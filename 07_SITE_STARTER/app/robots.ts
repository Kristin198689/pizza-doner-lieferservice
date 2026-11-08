import type { MetadataRoute } from 'next';
import biz from '@/config/business.json';

// Demo / unconfirmed data: keep every crawler out. Flip `publishReady` in business.json (and set `domain`) to open the site.
export default function robots(): MetadataRoute.Robots {
  return biz.publishReady
    ? { rules: { userAgent: '*', allow: '/' } }
    : { rules: { userAgent: '*', disallow: '/' } };
}
