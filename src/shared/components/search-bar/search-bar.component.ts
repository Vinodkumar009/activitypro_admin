import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="search-bar-wrapper">
      <ion-icon name="search" class="search-bar-icon"></ion-icon>
      <input type="text" class="search-bar-input"
        [placeholder]="placeholder"
        [ngModel]="value"
        (ngModelChange)="onInput($event)"
        (input)="onSearch($event)">
      <span class="search-bar-count" *ngIf="count !== null">{{count}}</span>
    </div>
  `,
  styles: [`
    app-search-bar { display: block; }
    app-search-bar .search-bar-wrapper {
      display: flex; align-items: center; gap: 8px;
      margin: 8px 4px 12px; padding: 0 10px; height: 44px;
      background: #1e293b; border: 1.5px solid #334155;
      border-radius: 22px; transition: border-color 0.2s ease;
    }
    app-search-bar .search-bar-wrapper:focus-within { border-color: #2b92bb; }
    app-search-bar .search-bar-icon { font-size: 18px; color: #64748b; flex-shrink: 0; }
    app-search-bar .search-bar-input {
      flex: 1; background: none; border: none; outline: none;
      font-size: 14px; font-weight: 500; line-height: 1.2;
      letter-spacing: 0.1px; color: #f1f5f9; min-width: 0;
    }
    app-search-bar .search-bar-input::placeholder { color: #64748b; }
    app-search-bar .search-bar-count {
      background: #2b92bb; color: #fff;
      font-size: 11px; font-weight: 700;
      padding: 2px 9px; border-radius: 10px;
      flex-shrink: 0; min-width: 20px; text-align: center;
    }

    .light-theme app-search-bar .search-bar-wrapper {
      background: #ffffff; border-color: #e2e8f0;
    }
    .light-theme app-search-bar .search-bar-icon { color: #94a3b8; }
    .light-theme app-search-bar .search-bar-input { color: #1e293b; }
    .light-theme app-search-bar .search-bar-input::placeholder { color: #94a3b8; }
  `]
})
export class SearchBarComponent {
  @Input() placeholder: string = 'Search...';
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Input() count: number = null;
  @Output() search = new EventEmitter<any>();

  onInput(val: string) {
    this.value = val;
    this.valueChange.emit(val);
  }

  onSearch(event: any) {
    this.search.emit(event);
  }
}
