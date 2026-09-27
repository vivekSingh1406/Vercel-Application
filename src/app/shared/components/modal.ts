import {
  Component,
  ElementRef,
  input,
  output,
  viewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { IconComponent } from './icon';
@Component({
  selector: 'app-modal',
  imports: [IconComponent],
  template: `<dialog
    #dialog
    (cancel)="cancel($event)"
    (click)="backdrop($event)"
    aria-labelledby="modal-title"
  >
    <div class="dialog-inner">
      <header class="dialog-header">
        <h2 id="modal-title">{{ title() }}</h2>
        <button class="icon-button" type="button" aria-label="Close dialog" (click)="closed.emit()">
          <app-icon name="close" />
        </button>
      </header>
      <ng-content />
    </div>
  </dialog>`,
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  title = input('');
  closed = output<void>();
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private previous = document.activeElement as HTMLElement | null;
  private overflow = '';
  ngAfterViewInit() {
    this.overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.dialog().nativeElement.showModal();
  }
  cancel(event: Event) {
    event.preventDefault();
    this.closed.emit();
  }
  backdrop(event: MouseEvent) {
    if (event.target === this.dialog().nativeElement) {
      const r = this.dialog().nativeElement.getBoundingClientRect();
      if (
        event.clientX < r.left ||
        event.clientX > r.right ||
        event.clientY < r.top ||
        event.clientY > r.bottom
      )
        this.closed.emit();
    }
  }
  ngOnDestroy() {
    this.dialog().nativeElement.close();
    document.body.style.overflow = this.overflow;
    this.previous?.focus();
  }
}
