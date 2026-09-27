import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { VILLAGE_INFO } from '../../data/village-info';
import { SITE_CONFIG } from '../../data/site-config';
import { IconComponent } from '../../shared/components/icon';
import { ModalComponent } from '../../shared/components/modal';
import { VIDEOS } from '../../data/videos';
@Component({
  selector: 'app-hero',
  imports: [RouterLink, IconComponent, ModalComponent],
  template: `<section class="hero">
      <img
        class="hero-photo"
        [src]="info.heroImage"
        [alt]="info.heroAlt"
        fetchpriority="high"
        width="1080"
        height="608"
      />
      <div class="hero-overlay"></div>
      <div class="container hero-content">
        <div class="hero-eyebrow">
          <span class="live-dot"></span> {{ config.siteName }} <span class="hero-line"></span>
        </div>
        <h1>
          {{ info.heroTitle }}<br /><em>{{ info.heroEmphasis }}</em>
        </h1>
        <p>{{ info.heroDescription }}</p>
        <div class="hero-actions">
          <a class="button button-cream" routerLink="/" fragment="about"
            >Discover our village <app-icon name="arrow" /></a
          ><button class="hero-film" (click)="film.set(true)">
            <span class="play-small"><app-icon name="play" /></span> A glimpse of home
            <small>{{ video.duration }}</small>
          </button>
        </div>
      </div>
      <div class="container hero-bottom">
        <a routerLink="/" fragment="about" class="scroll-cue"
          ><span>↓</span> SCROLL TO FEEL AT HOME</a
        >
        <p lang="hi">{{ info.hindi }}</p>
        <span class="hero-location"><app-icon name="pin" /> {{ config.location }}</span>
      </div>
      <div class="hero-side-note">ROOTED HERE. CONNECTED EVERYWHERE.</div>
    </section>
    @if (film()) {
      <app-modal title="Our home, from above" (closed)="film.set(false)"
        ><div class="video-player">
          <video
            [src]="video.src"
            [poster]="video.poster"
            controls
            playsinline
            autoplay
            preload="metadata"
          ></video>
        </div>
        <p class="media-note">{{ video.credit }}</p></app-modal
      >
    }`,
})
export class HeroComponent {
  info = VILLAGE_INFO;
  config = SITE_CONFIG;
  film = signal(false);
  video = VIDEOS[1];
}
