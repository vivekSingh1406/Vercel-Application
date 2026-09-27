import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar';
import { FooterComponent } from './shared/components/footer';
import { WhatsAppButtonComponent } from './shared/components/whatsapp-button';
import { IconComponent } from './shared/components/icon';
import { ToastService } from './core/services/toast.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, WhatsAppButtonComponent, IconComponent],
  templateUrl: './app.html',
  host: { '(window:scroll)': 'scrolled.set(isScrolled())' },
})
export class App {
  toast = inject(ToastService);
  scrolled = signal(false);
  isScrolled() {
    return window.scrollY > 600;
  }
  top() {
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }
}
