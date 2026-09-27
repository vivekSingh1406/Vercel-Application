import { Component, inject, input } from '@angular/core';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from './icon';
@Component({
  selector: 'app-whatsapp-button',
  imports: [IconComponent],
  template: `@if (whatsapp.contact(); as url) {
      <a
        [class]="floating() ? 'floating-whatsapp' : 'button button-primary'"
        [href]="url"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Connect on WhatsApp"
        ><app-icon name="chat" />
        @if (!floating()) {
          {{ label() }}
        }
      </a>
    } @else {
      <button
        [class]="floating() ? 'floating-whatsapp' : 'button button-primary'"
        (click)="unavailable()"
        aria-label="WhatsApp contact information"
      >
        <app-icon name="chat" />
        @if (!floating()) {
          {{ label() }}
        }
      </button>
    }`,
})
export class WhatsAppButtonComponent {
  whatsapp = inject(WhatsAppService);
  private toast = inject(ToastService);
  floating = input(false);
  label = input('Let’s talk on WhatsApp');
  unavailable() {
    this.toast.show(
      'WhatsApp contact is not configured yet. The site owner needs to add their number before messages can be sent.',
    );
  }
}
