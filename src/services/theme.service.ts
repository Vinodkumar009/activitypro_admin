import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ThemeService {
    private isDarkThemeSubject = new BehaviorSubject<boolean>(false);
    public isDarkTheme$ = this.isDarkThemeSubject.asObservable();

    constructor() {
        // Initialize theme to dark by default
        console.log('ThemeService initialized with dark theme');
        this.isDarkThemeSubject.next(true);
    }

    toggleTheme(): void {
        const currentTheme = this.isDarkThemeSubject.value;
        console.log('Toggling theme from', currentTheme, 'to', !currentTheme);
        this.isDarkThemeSubject.next(!currentTheme);
    }

    setTheme(isDark: boolean): void {
        this.isDarkThemeSubject.next(isDark);
    }

    getCurrentTheme(): boolean {
        return this.isDarkThemeSubject.value;
    }
}