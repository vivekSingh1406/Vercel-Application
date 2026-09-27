import { Component, inject, signal } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { THEMES } from '../../data/themes';
import { IconComponent } from './icon';
@Component({
  selector: 'app-theme-switcher',
  imports: [IconComponent],
  host: { '(document:keydown.escape)': 'open.set(false)', '(document:click)': 'outside($event)' },
  template: `<div class="theme-control">
    <button
      class="icon-button theme-trigger"
      aria-label="Choose color theme"
      [attr.aria-expanded]="open()"
      (click)="open.set(!open()); $event.stopPropagation()"
    >
      <app-icon name="sun" />
    </button>
    @if (open()) {
      <div class="theme-popover">
        <p class="eyebrow">Make yourself at home</p>
        <strong>Choose your atmosphere</strong>
        <div class="theme-options">
          @for (theme of themes; track theme.id) {
            <button
              [class.selected]="service.selected() === theme.id"
              [attr.aria-pressed]="service.selected() === theme.id"
              (click)="service.set(theme.id)"
            >
              <span [style.background]="theme.swatch"></span>{{ theme.name }}
              @if (service.selected() === theme.id) {
                <app-icon name="check" />
              }
            </button>
          }
        </div>
      </div>
    }
  </div>`,
})
export class ThemeSwitcherComponent {
  service = inject(ThemeService);
  themes = THEMES;
  open = signal(false);
  outside(event: Event) {
    if (!(event.target as HTMLElement).closest('app-theme-switcher')) this.open.set(false);
  }
}
