import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { MessageService } from '../../core/services/message.service';
import { ToastService } from '../../core/services/toast.service';
import { SeoService } from '../../core/services/seo.service';
import { Blog, Message, BlogSubmission } from '../../core/models/content';
import { nonBlank, safeImageUrl } from '../../core/models/validators';
import { SITE_CONFIG, FORM_LIMITS } from '../../data/site-config';
import { IconComponent } from '../../shared/components/icon';
import { ModalComponent } from '../../shared/components/modal';
import { FormErrorComponent } from '../../shared/components/form-error';
@Component({
  selector: 'app-admin',
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    IconComponent,
    ModalComponent,
    FormErrorComponent,
  ],
  templateUrl: './admin.html',
})
export class AdminComponent {
  blogs = inject(BlogService);
  messages = inject(MessageService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  config = SITE_CONFIG;
  limits = FORM_LIMITS;
  tab = signal('blogs');
  editing = signal<Blog | null>(null);
  editorOpen = signal(false);
  editingMessage = signal<Message | null>(null);
  messageEditorOpen = signal(false);
  pending = signal<{ type: 'blog' | 'message' | 'draft'; id: string; title: string } | null>(null);
  sourceDraft = signal<string | null>(null);
  blogForm = this.fb.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        nonBlank,
        Validators.minLength(5),
        Validators.maxLength(FORM_LIMITS.title),
      ],
    ],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    author: ['', [Validators.required, nonBlank, Validators.maxLength(FORM_LIMITS.name)]],
    excerpt: ['', [Validators.required, nonBlank, Validators.maxLength(300)]],
    content: [
      '',
      [
        Validators.required,
        nonBlank,
        Validators.minLength(FORM_LIMITS.minBlog),
        Validators.maxLength(FORM_LIMITS.blog),
      ],
    ],
    image: [''],
    category: ['Community'],
  });
  messageForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, nonBlank, Validators.maxLength(FORM_LIMITS.name)]],
    message: [
      '',
      [
        Validators.required,
        nonBlank,
        Validators.minLength(5),
        Validators.maxLength(FORM_LIMITS.message),
      ],
    ],
  });
  constructor() {
    inject(SeoService).set('Local content workspace');
  }
  edit(blog?: Blog, draftId?: string) {
    this.editing.set(blog || null);
    this.sourceDraft.set(draftId || null);
    this.blogForm.reset({
      title: blog?.title || '',
      slug: blog?.slug || '',
      author: blog?.author || '',
      excerpt: blog?.excerpt || '',
      content: blog?.content || '',
      image: blog?.image || '',
      category: blog?.category || 'Community',
    });
    this.editorOpen.set(true);
  }
  slug() {
    this.blogForm.controls.slug.setValue(this.blogs.slug(this.blogForm.controls.title.value));
  }
  saveBlog() {
    this.blogForm.markAllAsTouched();
    if (this.blogForm.invalid) return;
    const v = this.blogForm.getRawValue();
    if (!safeImageUrl(v.image.trim())) {
      this.toast.show('Use a /media/ path, an HTTPS image URL, or a local image draft.');
      return;
    }
    const blog: Blog = {
      ...v,
      title: v.title.trim(),
      author: v.author.trim(),
      content: v.content.trim(),
      excerpt: v.excerpt.trim(),
      image: v.image.trim() || undefined,
      id: this.editing()?.id || crypto.randomUUID(),
      createdAt: this.editing()?.createdAt || new Date().toISOString(),
    };
    if (this.blogs.blogs().some((b) => b.slug === blog.slug && b.id !== blog.id)) {
      this.toast.show('That story URL is already used. Choose a different slug.');
      return;
    }
    if (!this.blogs.save(blog)) return;
    if (this.sourceDraft()) this.blogs.removeSubmission(this.sourceDraft()!);
    this.editorOpen.set(false);
    this.toast.show('Story saved in this browser. Export it to update the public website.');
  }
  editMessage(message?: Message) {
    this.editingMessage.set(message || null);
    this.messageForm.reset({
      name: message?.authorOfMessage || '',
      message: message?.message || '',
    });
    this.messageEditorOpen.set(true);
  }
  saveMessage() {
    this.messageForm.markAllAsTouched();
    if (this.messageForm.invalid) return;
    const v = this.messageForm.getRawValue();
    if (
      !this.messages.save({
        id: this.editingMessage()?.id || crypto.randomUUID(),
        authorOfMessage: v.name.trim(),
        message: v.message.trim(),
        createdAt: this.editingMessage()?.createdAt || new Date().toISOString(),
      })
    )
      return;
    this.messageEditorOpen.set(false);
    this.toast.show('Message saved locally.');
  }
  review(draft: BlogSubmission) {
    this.edit(draft, draft.id);
  }
  remove() {
    const p = this.pending();
    if (!p) return;
    const ok =
      p.type === 'blog'
        ? this.blogs.remove(p.id)
        : p.type === 'message'
          ? this.messages.remove(p.id)
          : this.blogs.removeSubmission(p.id);
    if (ok) {
      this.pending.set(null);
      this.toast.show('Removed from this browser’s content.');
    }
  }
  export() {
    const data = {
      exportedAt: new Date().toISOString(),
      blogs: this.blogs.blogs(),
      messages: this.messages.messages(),
      submissions: this.blogs.submissions(),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gautiyan-tola-content.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    this.toast.show('Content exported. Keep this file as your backup.');
  }
}
