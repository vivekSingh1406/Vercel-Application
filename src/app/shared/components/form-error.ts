import { Component, input, computed } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
@Component({
  selector: 'app-form-error',
  template: `@if (validation().show) {
    <small class="field-error" role="alert"
      >{{ label() }}
      @if (control().hasError('required') || control().hasError('whitespace')) {
        is required.
      } @else if (control().hasError('minlength')) {
        needs at least {{ control().errors?.['minlength'].requiredLength }} characters.
      } @else if (control().hasError('maxlength')) {
        is too long.
      } @else {
        is not valid.
      }
    </small>
  }`,
})
export class FormErrorComponent {
  control = input.required<AbstractControl>();
  label = input('This field');
  private events = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events)),
  );
  readonly validation = computed(() => {
    this.events();
    return { show: this.control().touched && this.control().invalid };
  });
}
