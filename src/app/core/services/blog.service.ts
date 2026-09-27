import { Injectable, inject, signal } from '@angular/core';
import { ContentRepository } from './content.repository';
import { Blog, BlogSubmission } from '../models/content';
@Injectable({ providedIn: 'root' })
export class BlogService {
  private repository = inject(ContentRepository);
  private state = signal(this.repository.loadBlogs());
  private drafts = signal(this.repository.loadSubmissions());
  readonly blogs = this.state.asReadonly();
  readonly submissions = this.drafts.asReadonly();
  save(blog: Blog): boolean {
    if (this.blogs().some((b) => b.slug === blog.slug && b.id !== blog.id)) return false;
    const items = [blog, ...this.blogs().filter((b) => b.id !== blog.id)].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
    if (!this.repository.saveBlogs(items)) return false;
    this.state.set(items);
    return true;
  }
  remove(id: string) {
    const items = this.blogs().filter((b) => b.id !== id);
    if (!this.repository.saveBlogs(items)) return false;
    this.state.set(items);
    return true;
  }
  submit(blog: BlogSubmission) {
    const items = [blog, ...this.submissions()];
    if (!this.repository.saveSubmissions(items)) return false;
    this.drafts.set(items);
    return true;
  }
  removeSubmission(id: string) {
    const items = this.submissions().filter((b) => b.id !== id);
    if (!this.repository.saveSubmissions(items)) return false;
    this.drafts.set(items);
    return true;
  }
  slug(title: string) {
    return (
      title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'village-story'
    );
  }
}
