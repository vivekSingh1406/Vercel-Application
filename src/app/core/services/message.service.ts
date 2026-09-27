import { Injectable, inject, signal } from '@angular/core';
import { ContentRepository } from './content.repository';
import { Message } from '../models/content';
import { SITE_CONFIG } from '../../data/site-config';
@Injectable({ providedIn: 'root' })
export class MessageService {
  private repository = inject(ContentRepository);
  private state = signal(this.trim(this.repository.loadMessages()));
  readonly messages = this.state.asReadonly();
  private trim(items: Message[]) {
    return [...items]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, SITE_CONFIG.maxMessages);
  }
  save(item: Message) {
    return this.commit(this.trim([item, ...this.messages().filter((m) => m.id !== item.id)]));
  }
  remove(id: string) {
    return this.commit(this.messages().filter((m) => m.id !== id));
  }
  private commit(items: Message[]) {
    if (!this.repository.saveMessages(items)) return false;
    this.state.set(items);
    return true;
  }
}
