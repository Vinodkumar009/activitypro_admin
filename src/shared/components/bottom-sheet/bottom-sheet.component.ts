import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges } from '@angular/core';

@Component({
  selector: 'app-bottom-sheet',
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-container *ngIf="visible">
      <div class="bs-overlay" (click)="close()"></div>
      <div class="bs-container" [style.margin-bottom.px]="bottomOffset">
        <div class="bs-handle"></div>
        <div class="bs-title" *ngIf="title">{{title}}</div>
        <div class="bs-body" (click)="$event.stopPropagation()">
          <ng-content></ng-content>
        </div>
      </div>
    </ng-container>
  `,
  styles: [`
    .bs-overlay {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 9998;
      background: rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(2px);
      -webkit-backdrop-filter: blur(2px);
    }

    .bs-container {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 9999;
      max-height: 60vh;
      background: rgba(30, 41, 59, 0.35);
      backdrop-filter: blur(20px) saturate(200%);
      -webkit-backdrop-filter: blur(20px) saturate(200%);
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.25);
      display: flex; flex-direction: column;
      animation: bsSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .bs-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: rgba(255, 255, 255, 0.2); margin: 10px auto 0;
    }

    .bs-title {
      font-size: 16px; font-weight: 700; color: #f1f5f9;
      padding: 14px 20px 10px; text-align: center; letter-spacing: -0.2px;
      border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    }

    .bs-body {
      overflow-y: auto; flex: 1;
      -webkit-overflow-scrolling: touch;
    }

    @keyframes bsSlideUp {
      0% { transform: translateY(100%); }
      60% { transform: translateY(-4px); }
      80% { transform: translateY(2px); }
      100% { transform: translateY(0); }
    }

    .light-theme .bs-container {
      background: rgba(255, 255, 255, 0.35);
      box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
    }
    .light-theme .bs-handle { background: rgba(0, 0, 0, 0.15); }
    .light-theme .bs-title { color: #1e293b; border-bottom-color: rgba(226, 232, 240, 0.6); }
  `]
})
export class BottomSheetComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() bottomOffset: number = 70;
  @Output() visibleChange = new EventEmitter<boolean>();

  ngOnChanges() {
    this.visible ? document.body.classList.add('sheet-open') : document.body.classList.remove('sheet-open');
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
    document.body.classList.remove('sheet-open');
  }
}
