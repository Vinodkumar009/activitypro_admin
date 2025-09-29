import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ThemeService {
    private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
    public isDarkTheme$ = this.isDarkThemeSubject.asObservable();

    constructor() {
        // Initialize theme from system preference or default to light
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkThemeSubject.next(prefersDark);
    }

    toggleTheme(): void {
        const currentTheme = this.isDarkThemeSubject.value;
        this.isDarkThemeSubject.next(!currentTheme);
    }

    setTheme(isDark: boolean): void {
        this.isDarkThemeSubject.next(isDark);
    }

    getCurrentTheme(): boolean {
        return this.isDarkThemeSubject.value;
    }
}