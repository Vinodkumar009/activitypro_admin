import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-access-toggle',
  encapsulation: ViewEncapsulation.None,
  template: `
    <ion-item>
      <ion-row>
        <ion-col col-5 no-padding style="margin: auto;">
          <p class="access-label">{{label}}</p>
        </ion-col>
        <ion-col col-7 no-padding>
          <div class="access-pill">
            <div class="access-pill-slider" [class.slide-right]="!isPublic"></div>
            <button class="access-pill-btn" [class.active]="isPublic" (click)="select('public')">
              <ion-icon name="globe"></ion-icon> Public
            </button>
            <button class="access-pill-btn" [class.active]="!isPublic" (click)="select('private')">
              <ion-icon name="ios-lock-outline"></ion-icon> Private
            </button>
          </div>
        </ion-col>
      </ion-row>
    </ion-item>
  `,
  styles: [`
    app-access-toggle .access-label {
      margin: 0; font-weight: 700; font-size: 11px;
      text-transform: uppercase; letter-spacing: 0.6px; color: #94a3b8;
    }
    app-access-toggle .access-pill {
      position: relative; display: flex; background-color: #334155;
      border-radius: 10px; padding: 3px; height: 38px;
    }
    app-access-toggle .access-pill-slider {
      position: absolute; top: 3px; left: 3px;
      width: calc(50% - 3px); height: calc(100% - 6px);
      background-color: #2b92bb; border-radius: 8px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 6px rgba(43, 146, 187, 0.4);
    }
    app-access-toggle .access-pill-slider.slide-right { transform: translateX(100%); }
    app-access-toggle .access-pill-btn {
      position: relative; z-index: 1; flex: 1;
      display: flex; align-items: center; justify-content: center; gap: 5px;
      background: none; border: none;
      font-size: 12px; font-weight: 700; color: #94a3b8;
      cursor: pointer; transition: color 0.3s ease;
    }
    app-access-toggle .access-pill-btn ion-icon { font-size: 15px; }
    app-access-toggle .access-pill-btn.active { color: #ffffff; }

    .light-theme app-access-toggle .access-label { color: #64748b; }
    .light-theme app-access-toggle .access-pill { background-color: #e2e8f0; }
    .light-theme app-access-toggle .access-pill-slider { box-shadow: 0 2px 6px rgba(43, 146, 187, 0.3); }
    .light-theme app-access-toggle .access-pill-btn { color: #475569; }
    .light-theme app-access-toggle .access-pill-btn.active { color: #ffffff; }
  `]
})
export class AccessToggleComponent {
  @Input() isPublic: boolean = true;
  @Output() isPublicChange = new EventEmitter<boolean>();
  @Input() label: string = 'Status';

  select(val: string) {
    this.isPublic = val === 'public';
    this.isPublicChange.emit(this.isPublic);
  }
}
