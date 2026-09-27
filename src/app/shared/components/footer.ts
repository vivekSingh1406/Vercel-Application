import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_CONFIG } from '../../data/site-config';
import { VILLAGE_INFO } from '../../data/village-info';
import { IconComponent } from './icon';
@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent],
  template: `<footer class="site-footer">
    <div class="container footer-top">
      <div>
        <a class="brand" routerLink="/"
          ><span class="brand-mark"><app-icon name="leaf" /></span
          ><span
            >{{ config.shortName }}<small>{{ info.hindi }}</small></span
          ></a
        >
        <p>{{ config.tagline }}</p>
      </div>
      <div class="footer-links">
        <a routerLink="/" fragment="about">Our village</a
        ><a routerLink="/gallery">Gallery & films</a><a routerLink="/blog">Village journal</a
        ><a routerLink="/submit-blog">Share a story</a
        ><a routerLink="/" fragment="contact">Get in touch</a>
        @for (social of socials; track social.name) {
          @if (social.url) {
            <a [href]="social.url" target="_blank" rel="noopener noreferrer">{{ social.name }} ↗</a>
          }
        }
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© {{ year }} {{ config.siteName }}. {{ info.footer }}</span
      ><a routerLink="/admin">Content workspace <span aria-hidden="true">↗</span></a>
    </div>
  </footer>`,
})
export class FooterComponent {
  config = SITE_CONFIG;
  info = VILLAGE_INFO;
  year = new Date().getFullYear();
  socials = Object.entries(SITE_CONFIG.socialLinks).map(([name, url]) => ({ name, url }));
}
