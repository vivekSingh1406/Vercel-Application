import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroComponent } from './hero';
import { SectionTitleComponent } from '../../shared/components/section-title';
import { GalleryGridComponent } from '../gallery/gallery-grid';
import { VideoSectionComponent } from '../videos/video-section';
import { MessageCardComponent } from '../../shared/components/message-card';
import { MessageFormComponent } from '../messages/message-form';
import { BlogCardComponent } from '../../shared/components/blog-card';
import { WhatsAppButtonComponent } from '../../shared/components/whatsapp-button';
import { IconComponent } from '../../shared/components/icon';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { VILLAGE_INFO } from '../../data/village-info';
import { MessageService } from '../../core/services/message.service';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    HeroComponent,
    SectionTitleComponent,
    GalleryGridComponent,
    VideoSectionComponent,
    MessageCardComponent,
    MessageFormComponent,
    BlogCardComponent,
    WhatsAppButtonComponent,
    IconComponent,
    RevealDirective,
  ],
  templateUrl: './home.html',
})
export class HomeComponent {
  info = VILLAGE_INFO;
  messages = inject(MessageService);
  blogs = inject(BlogService);
  constructor() {
    inject(SeoService).set('Welcome home');
  }
}
