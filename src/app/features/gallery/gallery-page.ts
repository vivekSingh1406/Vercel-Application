import { Component, inject } from '@angular/core';
import { GalleryGridComponent } from './gallery-grid';
import { VideoSectionComponent } from '../videos/video-section';
import { SectionTitleComponent } from '../../shared/components/section-title';
import { VIDEOS } from '../../data/videos';
import { VILLAGE_INFO } from '../../data/village-info';
import { SeoService } from '../../core/services/seo.service';
@Component({
  selector: 'app-gallery-page',
  imports: [GalleryGridComponent, VideoSectionComponent, SectionTitleComponent],
  template: `<div class="container page">
    <header class="page-heading">
      <p class="eyebrow">{{ info.pages.gallery.eyebrow }}</p>
      <h1>{{ info.pages.gallery.title }}</h1>
      <p>{{ info.gallery.description }}</p>
    </header>
    <app-gallery-grid [filters]="true" />
    <p class="media-note">{{ info.mediaCredit }}</p>
    <section id="videos" class="section">
      <app-section-title
        [eyebrow]="info.videos.eyebrow"
        [title]="info.videos.title"
        [description]="info.videos.description"
      /><app-video-section [limit]="videoCount" />
    </section>
  </div>`,
})
export class GalleryPage {
  info = VILLAGE_INFO;
  videoCount = VIDEOS.length;
  constructor() {
    inject(SeoService).set('Village gallery & films');
  }
}
