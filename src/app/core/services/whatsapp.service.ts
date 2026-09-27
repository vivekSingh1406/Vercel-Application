import { Injectable } from '@angular/core';
import { SITE_CONFIG } from '../../data/site-config';
@Injectable({ providedIn: 'root' })
export class WhatsAppService {
  readonly configured = /^[1-9][0-9]{7,14}$/.test(SITE_CONFIG.whatsappNumber);
  contact(text = 'Hello Gautiyan Tola! I would like to connect with the community.') {
    return this.configured
      ? `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`
      : null;
  }
  message(name: string, message: string) {
    return this.contact(
      `New Message From Gautiyan Tola Website\n\nName:\n${name}\n\nMessage:\n${message}`,
    );
  }
  blog(author: string, title: string, content: string, imageName?: string) {
    return this.contact(
      `New Blog Submission\n\nAuthor:\n${author}\n\nTitle:\n${title}\n\nContent:\n${content}${imageName ? '\n\nImage: ' + imageName + ' (please attach manually in WhatsApp)' : ''}`,
    );
  }
  share(title: string, url: string) {
    return `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`;
  }
}
