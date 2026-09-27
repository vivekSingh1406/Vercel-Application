import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StorageService } from './storage.service';
import { STORAGE_KEYS } from '../../data/site-config';
import { THEMES } from '../../data/themes';
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storage = inject(StorageService);
  private document = inject(DOCUMENT);
  readonly selected = signal(
    this.storage.read(
      STORAGE_KEYS.theme,
      'default',
      (v): v is string => typeof v === 'string' && THEMES.some((t) => t.id === v),
    ),
  );
  constructor() {
    this.apply();
  }
  set(id: string) {
    if (!THEMES.some((t) => t.id === id)) return;
    this.selected.set(id);
    this.apply();
    this.storage.write(STORAGE_KEYS.theme, id);
  }
  private apply() {
    this.document.documentElement.dataset['theme'] = this.selected();
  }
}
