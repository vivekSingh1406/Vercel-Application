import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from '../../core/services/message.service';
import { WhatsAppService } from '../../core/services/whatsapp.service';
import { FORM_LIMITS } from '../../data/site-config';
import { nonBlank } from '../../core/models/validators';
import { FormErrorComponent } from '../../shared/components/form-error';
import { IconComponent } from '../../shared/components/icon';
@Component({
  selector: 'app-message-form',
  imports: [ReactiveFormsModule, FormErrorComponent, IconComponent],
  template: `<div class="message-form-panel">
    <div>
      <p class="eyebrow">Leave a little love</p>
      <h3>Your voice belongs here.</h3>
      <p>Share a memory, send your wishes, or simply say hello.</p>
    </div>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <label for="message-name">Your name</label
      ><input
        id="message-name"
        formControlName="name"
        autocomplete="name"
        placeholder="How should we call you?"
        [maxlength]="limits.name"
        [attr.aria-invalid]="form.controls.name.touched && form.controls.name.invalid"
      /><app-form-error [control]="form.controls.name" label="Your name" /><label
        for="community-message"
        >Your message</label
      ><textarea
        id="community-message"
        rows="4"
        formControlName="message"
        placeholder="A few words from the heart…"
        [maxlength]="limits.message"
        [attr.aria-invalid]="form.controls.message.touched && form.controls.message.invalid"
      ></textarea
      ><app-form-error [control]="form.controls.message" label="Your message" /><small
        class="form-hint"
        >{{ form.controls.message.value.length }} / {{ limits.message }} · Saved on this browser.
        Use WhatsApp to share with the administrator.</small
      ><button class="button button-primary" type="submit">
        Prepare your message <app-icon name="arrow" />
      </button>
    </form>
    @if (success()) {
      <div class="success-panel" role="status">
        <app-icon name="check" />
        <div>
          <strong>Your message is saved on this device.</strong>
          @if (url()) {
            <p>One more step: open WhatsApp and press Send to share it with the administrator.</p>
            <a
              class="button button-primary"
              [href]="url()"
              target="_blank"
              rel="noopener noreferrer"
              >Continue to WhatsApp ↗</a
            >
          } @else {
            <p>
              WhatsApp is not configured yet. Your message has not been sent to the administrator.
            </p>
          }
        </div>
      </div>
    }
  </div>`,
})
export class MessageFormComponent {
  private fb = inject(FormBuilder);
  private messages = inject(MessageService);
  private whatsapp = inject(WhatsAppService);
  limits = FORM_LIMITS;
  success = signal(false);
  url = signal<string | null>(null);
  form = this.fb.nonNullable.group({
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
  submit() {
    this.success.set(false);
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { name, message } = this.form.getRawValue();
    if (
      !this.messages.save({
        id: crypto.randomUUID(),
        authorOfMessage: name.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      })
    )
      return;
    this.url.set(this.whatsapp.message(name.trim(), message.trim()));
    this.success.set(true);
    this.form.reset();
  }
}
