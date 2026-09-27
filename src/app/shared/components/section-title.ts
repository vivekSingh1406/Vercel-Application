import { Component, input } from '@angular/core';
@Component({
  selector: 'app-section-title',
  template: `<p class="eyebrow"><span></span>{{ eyebrow() }}</p>
    <h2>{{ title() }}</h2>
    @if (description()) {
      <p class="section-description">{{ description() }}</p>
    }`,
})
export class SectionTitleComponent {
  eyebrow = input('');
  title = input('');
  description = input('');
}
