import { Component, inject, signal, DestroyRef } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SITE_CONFIG } from '../../data/site-config';
import { ThemeSwitcherComponent } from './theme-switcher';
import { IconComponent } from './icon';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, ThemeSwitcherComponent, IconComponent],
  host: {
    '(window:scroll)': 'scrolled.set(windowScroll())',
    '(document:keydown.escape)': 'menu.set(false)',
  },
  template: `<header class="navbar" [class.scrolled]="scrolled()">
    <div class="nav-inner">
      <a class="brand" routerLink="/" aria-label="Gautiyan Tola home"
        ><span class="brand-mark"><app-icon name="leaf" /></span
        ><span>{{ config.shortName }}<small>SAMAN · OUR VILLAGE, OUR HOME</small></span></a
      >
      <nav id="main-nav" aria-label="Main navigation" [class.open]="menu()">
        @for (link of config.navigation; track link.label) {
          <a
            [routerLink]="link.path"
            [fragment]="link.fragment || undefined"
            [class.active]="active(link.path, link.fragment)"
            (click)="menu.set(false)"
            >{{ link.label }}</a
          >
        }
        <a class="mobile-story" routerLink="/submit-blog">Share your story ↗</a>
      </nav>
      <div class="nav-actions">
        <app-theme-switcher /><a class="button button-small nav-story" routerLink="/submit-blog"
          >Share your story <app-icon name="arrow" /></a
        ><button
          class="icon-button menu-toggle"
          aria-label="Toggle navigation"
          aria-controls="main-nav"
          [attr.aria-expanded]="menu()"
          (click)="menu.set(!menu())"
        >
          <app-icon [name]="menu() ? 'close' : 'menu'" />
        </button>
      </div>
    </div>
  </header>`,
})
export class NavbarComponent {
  config = SITE_CONFIG;
  menu = signal(false);
  scrolled = signal(false);
  private router = inject(Router);
  url = signal(this.router.url);
  constructor() {
    this.router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.menu.set(false);
        this.url.set(e.urlAfterRedirects);
      }
    });
  }
  windowScroll() {
    return window.scrollY > 20;
  }
  active(path: string, fragment: string) {
    return fragment
      ? this.url() === path + '#' + fragment
      : path === '/'
        ? this.url() === '/'
        : this.url().startsWith(path);
  }
}
