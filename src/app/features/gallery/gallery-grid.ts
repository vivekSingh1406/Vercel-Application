import { Component, input, signal, computed } from '@angular/core';
import { GalleryItem } from '../../core/models/content';
import { GALLERY } from '../../data/gallery';
import { ModalComponent } from '../../shared/components/modal';
import { IconComponent } from '../../shared/components/icon';
@Component({
  selector: 'app-gallery-grid',
  imports: [ModalComponent, IconComponent],
  template: `@if (filters()) {
      <div class="filter-row" aria-label="Filter photographs">
        @for (category of categories; track category) {
          <button
            [class.active]="filter() === category"
            [attr.aria-pressed]="filter() === category"
            (click)="filter.set(category)"
          >
            {{ category }}
          </button>
        }
      </div>
    }
    <div class="gallery-grid" [class.preview]="!filters()">
      @for (item of visible(); track item.id; let i = $index) {
        <button
          class="gallery-tile"
          (click)="selected.set(i)"
          [attr.aria-label]="'View ' + item.title"
        >
          <img [src]="item.src" [alt]="item.alt" loading="lazy" width="700" height="560" /><span
            class="gallery-caption"
            ><span
              ><small>{{ item.category }}</small
              ><strong>{{ item.title }}</strong></span
            ><span class="circle-arrow">↗</span></span
          >
        </button>
      } @empty {
        <p class="empty-state">No photographs in this collection yet.</p>
      }
    </div>
    @if (current(); as item) {
      <app-modal [title]="item.title" (closed)="selected.set(null)"
        ><div class="lightbox" (keydown.arrowleft)="move(-1)" (keydown.arrowright)="move(1)">
          <img [src]="item.src" [alt]="item.alt" />
          <div class="lightbox-controls">
            <button class="icon-button" aria-label="Previous image" (click)="move(-1)">
              <app-icon name="back" />
            </button>
            <p>
              {{ item.credit }}<small>{{ (selected() || 0) + 1 }} / {{ visible().length }}</small>
            </p>
            <button class="icon-button" aria-label="Next image" (click)="move(1)">
              <app-icon name="arrow" />
            </button>
          </div></div
      ></app-modal>
    }`,
})
export class GalleryGridComponent {
  filters = input(false);
  limit = input(4);
  filter = signal('All moments');
  selected = signal<number | null>(null);
  categories = ['All moments', ...new Set(GALLERY.map((i) => i.category))];
  visible = computed(() => {
    const items =
      this.filter() === 'All moments'
        ? GALLERY
        : GALLERY.filter((i) => i.category === this.filter());
    return this.filters() ? items : items.slice(0, this.limit());
  });
  current = computed<GalleryItem | null>(() =>
    this.selected() === null ? null : this.visible()[this.selected()!] || null,
  );
  move(direction: number) {
    this.selected.set(
      ((this.selected() || 0) + direction + this.visible().length) % this.visible().length,
    );
  }
}
