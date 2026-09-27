import { Component, inject, computed, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { IconComponent } from '../../shared/components/icon';
@Component({
  selector: 'app-blog-detail',
  imports: [DatePipe, RouterLink, IconComponent],
  template: `<section class="container page article-page">
    <a routerLink="/blog" class="text-link"><app-icon name="back" /> Back to the journal</a>
    @if (blog(); as story) {
      <header class="article-heading">
        <p class="eyebrow">{{ story.category || 'Village story' }}</p>
        <h1>{{ story.title }}</h1>
        <p class="article-excerpt">{{ story.excerpt }}</p>
        <div class="article-byline">
          <span class="avatar">{{ story.author.charAt(0) }}</span
          ><span
            >{{ story.author
            }}<small
              >{{ story.createdAt | date: 'longDate' }} · {{ readingMinutes() }} min read</small
            ></span
          >
        </div>
      </header>
      @if (story.image) {
        <img
          class="article-hero"
          [src]="story.image"
          [alt]="story.title"
          width="1200"
          height="650"
        />
      }
      <div class="article-body">
        @for (
          paragraph of story.content.split(
            '

'
          );
          track $index
        ) {
          <p>{{ paragraph }}</p>
        }
        <div class="article-share">
          <strong>A story is better shared.</strong
          ><button class="button button-outline" (click)="share()">
            <app-icon name="share" /> Share story</button
          ><a
            class="button button-primary"
            [href]="whatsapp.share(story.title, pageUrl)"
            target="_blank"
            rel="noopener noreferrer"
            ><app-icon name="chat" /> WhatsApp</a
          >
        </div>
        <div class="story-invitation">
          <p>Your memories belong here, too.</p>
          <a routerLink="/submit-blog" class="text-link">Share your story →</a>
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <h1>This story hasn’t been written yet.</h1>
        <p>
          The link may have changed, or this story exists only in another browser’s local workspace.
        </p>
        <a routerLink="/blog" class="button button-primary">Browse village stories</a>
      </div>
    }
  </section>`,
})
export class BlogDetail {
  private params = toSignal(inject(ActivatedRoute).paramMap);
  private service = inject(BlogService);
  private seo = inject(SeoService);
  private toast = inject(ToastService);
  whatsapp = inject(WhatsAppService);
  pageUrl = location.href;
  blog = computed(() => this.service.blogs().find((b) => b.slug === this.params()?.get('slug')));
  readingMinutes = computed(() =>
    Math.max(1, Math.ceil((this.blog()?.content.split(/\s+/).length || 0) / 200)),
  );
  constructor() {
    effect(() => {
      const b = this.blog();
      this.pageUrl = location.href;
      this.seo.set(b?.title || 'Story not found', b?.excerpt, b?.image);
    });
  }
  async share() {
    const b = this.blog();
    if (!b) return;
    try {
      if (navigator.share) await navigator.share({ title: b.title, url: location.href });
      else {
        await navigator.clipboard.writeText(location.href);
        this.toast.show('Story link copied.');
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError')
        this.toast.show('Sharing is unavailable. Copy the page address from your browser.');
    }
  }
}
