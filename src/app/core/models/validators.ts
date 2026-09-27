import { AbstractControl, ValidationErrors } from '@angular/forms';
export function nonBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && !control.value.trim() ? { whitespace: true } : null;
}
export function safeImageUrl(value: string): boolean {
  return (
    !value ||
    /^\/(?!\/)/.test(value) ||
    /^https:\/\//.test(value) ||
    /^data:image\/(jpeg|png|webp);base64,/.test(value)
  );
}
