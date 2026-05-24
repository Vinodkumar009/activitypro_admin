import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-pill-tabs',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="pill-tabs">
      <div class="pill-tabs-slider"
        [ngStyle]="{ 'width': sliderWidth, 'transform': sliderTransform }"></div>
      <button class="pill-tabs-btn" [class.active]="activeIndex===0" (click)="select(0)">
        <ion-icon *ngIf="leftIcon" [name]="leftIcon"></ion-icon>
        {{leftLabel}}
        <span class="pill-badge" *ngIf="leftBadge">{{leftBadge}}</span>
        <span class="pill-count" *ngIf="leftCount !== null && leftCount !== undefined">{{leftCount}}</span>
        <span class="pill-action" *ngIf="leftActionIcon" (click)="onAction($event, 'left')">
          <ion-icon [name]="leftActionIcon"></ion-icon>
        </span>
      </button>
      <button *ngIf="centerLabel" class="pill-tabs-btn" [class.active]="activeIndex===1" (click)="select(1)">
        <ion-icon *ngIf="centerIcon" [name]="centerIcon"></ion-icon>
        {{centerLabel}}
        <span class="pill-count" *ngIf="centerCount !== null && centerCount !== undefined">{{centerCount}}</span>
      </button>
      <button class="pill-tabs-btn" [class.active]="centerLabel ? activeIndex===2 : activeIndex===1"
        (click)="select(centerLabel ? 2 : 1)">
        <ion-icon *ngIf="rightIcon" [name]="rightIcon"></ion-icon>
        {{rightLabel}}
        <span class="pill-badge" *ngIf="rightBadge">{{rightBadge}}</span>
        <span class="pill-count" *ngIf="rightCount !== null && rightCount !== undefined">{{rightCount}}</span>
        <span class="pill-action" *ngIf="rightActionIcon" (click)="onAction($event, 'right')">
          <ion-icon [name]="rightActionIcon"></ion-icon>
        </span>
      </button>
    </div>
  `,
  styles: [`
    app-pill-tabs { display: block; }
    app-pill-tabs .pill-tabs {
      display: flex; position: relative;
      margin: 0 4px 4px; padding: 3px;
      background: #1e293b; border-radius: 12px;
    }
    app-pill-tabs .pill-tabs-slider {
      position: absolute; top: 3px; left: 3px;
      height: calc(100% - 6px);
      background: #2b92bb; border-radius: 10px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(43, 146, 187, 0.35);
    }
    app-pill-tabs .pill-tabs-btn {
      position: relative; z-index: 1; flex: 1;
      display: flex; align-items: center; justify-content: center; gap: 4px;
      padding: 10px 4px; background: none; border: none;
      font-size: 13px; font-weight: 700; letter-spacing: 0.3px; line-height: 1;
      color: #64748b; cursor: pointer; transition: color 0.3s ease;
      min-width: 0; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
    }

    @media (max-width: 359px) {
      app-pill-tabs .pill-tabs-btn { font-size: 11px; padding: 8px 2px; gap: 2px; }
      app-pill-tabs .pill-tabs-btn ion-icon { font-size: 14px; }
      app-pill-tabs .pill-action { width: 18px; height: 18px; margin-left: 2px; }
      app-pill-tabs .pill-action ion-icon { font-size: 12px; }
      app-pill-tabs .pill-badge { font-size: 7px; }
      app-pill-tabs .pill-count { font-size: 8px; padding: 1px 4px; }
    }
    @media (min-width: 360px) and (max-width: 399px) {
      app-pill-tabs .pill-tabs-btn { font-size: 12px; gap: 3px; }
    }
    @media (min-width: 768px) {
      app-pill-tabs .pill-tabs-btn { font-size: 15px; padding: 12px 8px; gap: 8px; }
      app-pill-tabs .pill-action { width: 26px; height: 26px; }
    }
    app-pill-tabs .pill-tabs-btn ion-icon { font-size: 16px; }
    app-pill-tabs .pill-tabs-btn.active { color: #ffffff; }
    app-pill-tabs .pill-count {
      font-size: 10px; font-weight: 700;
      background: rgba(255, 255, 255, 0.2);
      padding: 1px 6px; border-radius: 8px; margin-left: 2px;
    }
    app-pill-tabs .pill-tabs-btn.active .pill-count {
      background: rgba(255, 255, 255, 0.25);
    }
    app-pill-tabs .pill-badge {
      font-size: 9px; font-weight: 500; font-style: italic; text-transform: lowercase;
      color: rgba(247,110,4,0.7); margin-left: 3px;
    }
    app-pill-tabs .pill-tabs-btn:not(.active) .pill-badge {
      color: #f76e04;
    }
    app-pill-tabs .pill-action {
      display: flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: 50%; margin-left: 4px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
      cursor: pointer; transition: transform 0.3s ease, background 0.2s ease;
    }
    app-pill-tabs .pill-action ion-icon { font-size: 14px; color: #64748b; transition: color 0.3s ease; }
    app-pill-tabs .pill-action:active { transform: scale(0.9); }
    app-pill-tabs .pill-tabs-btn.active .pill-action { background: rgba(255, 255, 255, 0.15); animation: pillActionPop 0.3s ease; }
    app-pill-tabs .pill-tabs-btn.active .pill-action ion-icon { color: rgba(255, 255, 255, 0.85); }
    @keyframes pillActionPop { 0% { transform: scale(1); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }

    .light-theme app-pill-tabs .pill-action { background: rgba(0, 0, 0, 0.05); }
    .light-theme app-pill-tabs .pill-action ion-icon { color: #94a3b8; }
    .light-theme app-pill-tabs .pill-tabs-btn.active .pill-action { background: rgba(255, 255, 255, 0.2); }
    .light-theme app-pill-tabs .pill-tabs-btn.active .pill-action ion-icon { color: rgba(255, 255, 255, 0.9); }

    .light-theme app-pill-tabs .pill-tabs { background: #e2e8f0; }
    .light-theme app-pill-tabs .pill-tabs-slider { box-shadow: 0 2px 8px rgba(43, 146, 187, 0.3); }
    .light-theme app-pill-tabs .pill-tabs-btn { color: #64748b; }
    .light-theme app-pill-tabs .pill-tabs-btn.active { color: #ffffff; }
    .light-theme app-pill-tabs .pill-count { background: rgba(0, 0, 0, 0.1); }
    .light-theme app-pill-tabs .pill-tabs-btn.active .pill-count { background: rgba(255, 255, 255, 0.25); }
  `]
})
export class PillTabsComponent {
  @Input() leftLabel: string = 'Tab 1';
  @Input() rightLabel: string = 'Tab 2';
  @Input() centerLabel: string = '';
  @Input() leftIcon: string;
  @Input() rightIcon: string;
  @Input() centerIcon: string;
  @Input() leftCount: number = null;
  @Input() rightCount: number = null;
  @Input() centerCount: number = null;
  @Input() activeIndex: number = 0;
  @Input() leftActionIcon: string;
  @Input() rightActionIcon: string;
  @Input() leftBadge: string;
  @Input() rightBadge: string;
  @Output() activeIndexChange = new EventEmitter<number>();
  @Output() leftActionClick = new EventEmitter<void>();
  @Output() rightActionClick = new EventEmitter<void>();

  get hasCenter(): boolean { return !!this.centerLabel; }

  get sliderWidth(): string {
    return this.hasCenter ? 'calc(33.333% - 2px)' : 'calc(50% - 3px)';
  }

  get sliderTransform(): string {
    return `translateX(${this.activeIndex * 100}%)`;
  }

  select(index: number) {
    this.activeIndex = index;
    this.activeIndexChange.emit(index);
  }

  onAction(event: Event, side: string) {
    event.stopPropagation();
    if (side === 'left') this.leftActionClick.emit();
    else this.rightActionClick.emit();
  }
}
