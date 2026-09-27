import { AfterViewInit, Directive, ElementRef, inject, OnDestroy } from '@angular/core';
@Directive({ selector: '[appReveal]' })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;
  ngAfterViewInit() {
    if (
      matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    )
      return;
    this.el.nativeElement.classList.add('reveal-ready');
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.el.nativeElement.classList.add('is-visible');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.07 },
    );
    this.observer.observe(this.el.nativeElement);
  }
  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
