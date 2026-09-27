import { Injectable, inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { SITE_CONFIG } from '../../data/site-config';
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  set(
    title: string,
    description: string = SITE_CONFIG.description,
    image = '/media/village-2.jpg',
  ) {
    const full = `${title} | ${SITE_CONFIG.siteName}`;
    this.title.setTitle(full);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: new URL(image, location.origin).href });
    this.meta.updateTag({ property: 'og:url', content: location.href });
    this.meta.updateTag({
      property: 'og:type',
      content: location.pathname.startsWith('/blog/') ? 'article' : 'website',
    });
  }
}
