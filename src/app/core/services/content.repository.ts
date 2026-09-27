import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../../data/site-config';
import { Message, Blog, BlogSubmission } from '../models/content';
import { MESSAGES } from '../../data/messages';
import { BLOGS } from '../../data/blogs';
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
function strings(value: unknown, fields: string[]): boolean {
  return record(value) && fields.every((field) => typeof value[field] === 'string');
}
function messages(value: unknown): value is Message[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        strings(v, ['id', 'message', 'authorOfMessage', 'createdAt']) &&
        !isNaN(Date.parse(v.createdAt)),
    )
  );
}
function blogs(value: unknown): value is Blog[] {
  return (
    Array.isArray(value) &&
    value.every(
      (v) =>
        strings(v, ['id', 'title', 'slug', 'excerpt', 'content', 'author', 'createdAt']) &&
        !isNaN(Date.parse(v.createdAt)) &&
        (v.image === undefined || typeof v.image === 'string'),
    )
  );
}
@Injectable({ providedIn: 'root' })
export class ContentRepository {
  private storage = inject(StorageService);
  loadMessages() {
    return this.storage.read(STORAGE_KEYS.messages, MESSAGES, messages);
  }
  saveMessages(value: Message[]) {
    return this.storage.write(STORAGE_KEYS.messages, value);
  }
  loadBlogs() {
    return this.storage.read(STORAGE_KEYS.blogs, BLOGS, blogs);
  }
  saveBlogs(value: Blog[]) {
    return this.storage.write(STORAGE_KEYS.blogs, value);
  }
  loadSubmissions(): BlogSubmission[] {
    return this.storage.read(STORAGE_KEYS.submissions, [] as BlogSubmission[], blogs);
  }
  saveSubmissions(value: BlogSubmission[]) {
    return this.storage.write(STORAGE_KEYS.submissions, value);
  }
}
