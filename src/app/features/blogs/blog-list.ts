import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { BlogCardComponent } from '../../shared/components/blog-card';
import { IconComponent } from '../../shared/components/icon';
import { VILLAGE_INFO } from '../../data/village-info';
import { SeoService } from '../../core/services/seo.service';
@Component({
  selector: 'app-blog-list',
  imports: [BlogCardComponent, RouterLink, IconComponent],
  template: `<section class="container page">
    <header class="page-heading">
      <p class="eyebrow">{{ copy.eyebrow }}</p>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.description }}</p>
      <a routerLink="/submit-blog" class="button button-primary"
        >Share your story <app-icon name="pen"
      /></a>
    </header>
    <div class="journal-toolbar">
      <label class="search-field"
        ><app-icon name="search" /><input
          type="search"
          aria-label="Search village stories"
          placeholder="Find a story, a memory, a name…"
          (input)="search.set($any($event.target).value)" /></label
      ><span
        >{{ filtered().length }} {{ filtered().length === 1 ? 'story' : 'stories' }} to
        discover</span
      >
    </div>
    <div class="blogs-grid">
      @for (blog of filtered(); track blog.id) {
        <app-blog-card [blog]="blog" />
      } @empty {
        <div class="empty-state">
          <app-icon name="search" />
          <h2>No stories found.</h2>
          <p>Try another word, or share a story of your own.</p>
        </div>
      }
    </div>
  </section>`,
})
export class BlogList {
  copy = VILLAGE_INFO.pages.journal;
  private service = inject(BlogService);
  search = signal('');
  filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.service
      .blogs()
      .filter((b) =>
        [b.title, b.excerpt, b.author, b.category].join(' ').toLowerCase().includes(q),
      );
  });
  constructor() {
    inject(SeoService).set('Village journal');
  }
}
