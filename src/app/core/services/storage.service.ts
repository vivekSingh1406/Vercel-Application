import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';
@Injectable({ providedIn: 'root' })
export class StorageService {
  private toast = inject(ToastService);
  read<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      const value: unknown = JSON.parse(raw);
      if (validate(value)) return value;
      this.toast.show('Saved content could not be read. The original data has been preserved.');
    } catch {
      this.toast.show(
        'Browser storage is unavailable or unreadable. Existing saved data has not been cleared.',
      );
    }
    return fallback;
  }
  write<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      this.toast.show(
        'Could not save: browser storage is unavailable or full. Please export or copy your content.',
      );
      return false;
    }
  }
}
