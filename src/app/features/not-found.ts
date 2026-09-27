import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../core/services/seo.service';
@Component({
  imports: [RouterLink],
  template: `<section class="container page empty-state">
    <p class="eyebrow">A little off the beaten path</p>
    <h1>Let’s find our way home.</h1>
    <p>This page does not exist. There is still plenty of our village to discover.</p>
    <a class="button button-primary" routerLink="/">Back to home →</a>
  </section>`,
})
export class NotFoundComponent {
  constructor() {
    inject(SeoService).set('Page not found');
  }
}
