import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Message } from '../../core/models/content';
@Component({
  selector: 'app-message-card',
  imports: [DatePipe],
  template: `<article class="message-card">
    <span class="quote-mark" aria-hidden="true">“</span>
    <blockquote>{{ message().message }}</blockquote>
    <div class="message-author">
      <span class="avatar">{{ message().authorOfMessage.charAt(0) }}</span>
      <div>
        <strong>{{ message().authorOfMessage }}</strong
        ><small>{{ message().createdAt | date: 'MMM d, y' }}</small>
      </div>
    </div>
  </article>`,
})
export class MessageCardComponent {
  message = input.required<Message>();
}
