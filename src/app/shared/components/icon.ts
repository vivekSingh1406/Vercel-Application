import { Component, input } from '@angular/core';
@Component({
  selector: 'app-icon',
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="paths[name()] || paths['arrow']" />
  </svg>`,
  styles: `
    :host {
      display: inline-flex;
      width: 1.3em;
      height: 1.3em;
      flex-shrink: 0;
      vertical-align: middle;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  name = input('arrow');
  paths: Record<string, string> = {
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    up: 'M12 20V4m-6 6 6-6 6 6',
    close: 'm6 6 12 12M18 6 6 18',
    menu: 'M4 6h16M4 12h16M4 18h16',
    play: 'm9 5 11 7-11 7z',
    leaf: 'M19 3c-9-1-16 3-15 10 1 8 12 8 15-10ZM4 21 15 9m-7 8-1-6m4 3 5 1',
    sun: 'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
    people:
      'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 21v-3a7 7 0 0 1 14 0v3M19 5a3 3 0 0 1 0 6M2 5a3 3 0 0 1 0 6',
    chat: 'M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-1l-5 2 1-5a9 9 0 1 1 17-5ZM8 11h8m-8 4h5',
    pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Zm-5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
    heart: 'M20 5c-3-3-7-1-8 2-1-3-5-5-8-2-5 5 8 15 8 15S25 10 20 5Z',
    search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',
    pen: 'm4 16-1 5 5-1L21 7l-4-4L4 16Zm10-10 4 4',
    image: 'M3 3h18v18H3zM3 17l5-5 4 4 4-6 5 7M9 7h.01',
    check: 'm4 12 5 5L20 6',
    back: 'M20 12H4m6-6-6 6 6 6',
    share: 'M12 16V3m-4 4 4-4 4 4M6 10H3v11h18V10h-3',
    rotate: 'M20 8A8 8 0 1 0 20 16M20 3v5h-5',
  };
}
