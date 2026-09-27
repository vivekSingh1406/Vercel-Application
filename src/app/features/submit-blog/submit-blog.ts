import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { VILLAGE_INFO } from '../../data/village-info';
import { SeoService } from '../../core/services/seo.service';
import { FORM_LIMITS, SITE_CONFIG } from '../../data/site-config';
import { nonBlank } from '../../core/models/validators';
import { FormErrorComponent } from '../../shared/components/form-error';
import { IconComponent } from '../../shared/components/icon';
@Component({
  selector: 'app-submit-blog',
  imports: [ReactiveFormsModule, FormErrorComponent, IconComponent],
  templateUrl: './submit-blog.html',
})
export class SubmitBlog {
  copy = VILLAGE_INFO.pages.submission;
  private fb = inject(FormBuilder);
  private blogs = inject(BlogService);
  whatsapp = inject(WhatsAppService);
  limits = FORM_LIMITS;
  success = signal(false);
  url = signal<string | null>(null);
  imageError = signal('');
  image = signal('');
  imageName = signal('');
  reading = signal(false);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, nonBlank, Validators.maxLength(FORM_LIMITS.name)]],
    title: [
      '',
      [
        Validators.required,
        nonBlank,
        Validators.minLength(5),
        Validators.maxLength(FORM_LIMITS.title),
      ],
    ],
    content: [
      '',
      [
        Validators.required,
        nonBlank,
        Validators.minLength(FORM_LIMITS.minBlog),
        Validators.maxLength(FORM_LIMITS.blog),
      ],
    ],
  });
  constructor() {
    inject(SeoService).set('Share your village story');
  }
  async selectImage(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.image.set('');
    this.imageName.set('');
    this.imageError.set('');
    if (!file) return;
    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
      file.size > SITE_CONFIG.maxImageBytes
    ) {
      this.imageError.set('Choose a JPG, PNG, or WebP image smaller than 1.5 MB.');
      input.value = '';
      return;
    }
    this.reading.set(true);
    try {
      const value = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      this.image.set(value);
      this.imageName.set(file.name);
    } catch {
      this.imageError.set('This image could not be read. Please choose another.');
    } finally {
      this.reading.set(false);
    }
  }
  submit(fileInput: HTMLInputElement) {
    this.success.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.imageError() || this.reading()) return;
    const value = this.form.getRawValue();
    const id = crypto.randomUUID();
    const name = value.name.trim(),
      title = value.title.trim(),
      content = value.content.trim();
    if (
      !this.blogs.submit({
        id,
        author: name,
        title,
        content,
        slug: this.blogs.slug(title) + '-' + id.slice(0, 8),
        excerpt: content.slice(0, 150),
        image: this.image() || undefined,
        imageName: this.imageName() || undefined,
        createdAt: new Date().toISOString(),
      })
    )
      return;
    this.url.set(this.whatsapp.blog(name, title, content, this.imageName()));
    this.success.set(true);
    this.form.reset();
    this.image.set('');
    this.imageName.set('');
    fileInput.value = '';
  }
}
