import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-list-card',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="list-card" (click)="cardClick.emit($event)">
      <div class="list-card-accent" *ngIf="accentColor" [style.background]="accentColor"></div>
      <div class="list-card-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    app-list-card { display: block; min-width: 0; overflow: hidden; }
    app-list-card .list-card {
      display: flex;
      border-radius: 14px;
      border: 1px solid rgba(71, 85, 105, 0.4);
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
      cursor: pointer;
      overflow: hidden;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      max-width: 100%;
    }
    app-list-card .list-card:active { transform: scale(0.98); }
    app-list-card .list-card-accent { width: 5px; flex-shrink: 0; }
    app-list-card .list-card-body {
      flex: 1; min-width: 0; position: relative; overflow: hidden;
    }

    .light-theme app-list-card .list-card {
      background: rgba(255, 255, 255, 0.55);
      border: 1px solid rgba(226, 232, 240, 0.6);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
    }
  `]
})
export class ListCardComponent {
  @Input() accentColor: string = null;
  @Output() cardClick = new EventEmitter<any>();
}
