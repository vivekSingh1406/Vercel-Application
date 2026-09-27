import { Component, input, signal } from '@angular/core';
import { VIDEOS } from '../../data/videos';
import { VillageVideo } from '../../core/models/content';
import { ModalComponent } from '../../shared/components/modal';
import { IconComponent } from '../../shared/components/icon';
@Component({
  selector: 'app-video-section',
  imports: [ModalComponent, IconComponent],
  template: `<div class="video-grid">
      @for (video of videos.slice(0, limit()); track video.id) {
        <button class="video-card" (click)="select(video)">
          <span class="video-poster"
            ><img
              [src]="video.poster"
              [alt]="video.title"
              loading="lazy"
              width="600"
              height="400"
            /><span class="play-button"><app-icon name="play" /></span
            ><span class="duration">{{ video.duration }}</span></span
          ><span class="video-card-title">{{ video.title }}<app-icon name="arrow" /></span
          ><span class="video-description">{{ video.description }}</span>
        </button>
      }
    </div>
    @if (selected(); as video) {
      <app-modal [title]="video.title" (closed)="selected.set(null)"
        ><div class="video-player" [class.rotated]="rotated()">
          <video
            [src]="video.src"
            [poster]="video.poster"
            controls
            playsinline
            autoplay
            preload="metadata"
            (error)="failed.set(true)"
          ></video>
        </div>
        @if (video.id === 'v6' || video.id === 'v5') {
          <button class="button button-outline" (click)="rotated.set(!rotated())">
            <app-icon name="rotate" /> Rotate view
          </button>
        }
        <p class="media-note">{{ video.description }}</p>
        <p class="media-note">{{ video.credit }} This original clip may include music.</p>
        @if (failed()) {
          <p role="alert">
            Your browser could not play this video.
            <a [href]="video.src" target="_blank" rel="noopener">Open the original file</a>.
          </p>
        }
      </app-modal>
    }`,
})
export class VideoSectionComponent {
  limit = input(3);
  videos = VIDEOS;
  selected = signal<VillageVideo | null>(null);
  rotated = signal(false);
  failed = signal(false);
  select(video: VillageVideo) {
    this.rotated.set(false);
    this.failed.set(false);
    this.selected.set(video);
  }
}
