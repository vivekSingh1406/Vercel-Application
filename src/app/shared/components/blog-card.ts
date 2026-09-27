import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Blog } from '../../core/models/content';
import { IconComponent } from './icon';
@Component({
  selector: 'app-blog-card',
  imports: [RouterLink, DatePipe, IconComponent],
  template: `<article class="blog-card">
    <a class="blog-image" [routerLink]="['/blog', blog().slug]"
      ><img
        [src]="blog().image || '/media/village-2.jpg'"
        [alt]="blog().title"
        loading="lazy"
        width="640"
        height="440" /><span class="image-arrow"><app-icon name="arrow" /></span
    ></a>
    <div class="blog-meta">
      <span>{{ blog().category || 'Community' }}</span
      ><span>{{ blog().createdAt | date: 'MMM d, y' }}</span>
    </div>
    <h3>
      <a [routerLink]="['/blog', blog().slug]">{{ blog().title }}</a>
    </h3>
    <p>{{ blog().excerpt }}</p>
    <div class="blog-bottom">
      <span>By {{ blog().author }}</span
      ><a [routerLink]="['/blog', blog().slug]" [attr.aria-label]="'Read ' + blog().title"
        >Read story <app-icon name="arrow"
      /></a>
    </div>
  </article>`,
})
export class BlogCardComponent {
  blog = input.required<Blog>();
}
