import { Component, Input, ViewEncapsulation, ElementRef, OnChanges, SimpleChanges } from '@angular/core';

export interface DetailHeaderRow {
  icon: string;
  text: string;
}

@Component({
  selector: 'app-detail-header',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="detail-header">
      <div class="detail-header-glow"></div>
      <h2 class="detail-header-title">
        <ion-icon *ngIf="visibilityIcon" [name]="visibilityIcon" class="detail-header-visibility" [class.private]="visibilityIcon==='lock'"></ion-icon>
        {{title}}
      </h2>
      <span class="detail-header-subtitle" *ngIf="subtitle">{{subtitle}}</span>
      <div class="detail-header-rows">
        <div class="detail-header-row" *ngFor="let row of detailRows">
          <ion-icon [name]="row.icon" class="detail-header-row-icon"></ion-icon>
          <span class="detail-header-row-text">{{row.text}}</span>
        </div>
      </div>
      <div class="detail-header-actions">
        <ng-content select="[header-actions]"></ng-content>
      </div>
      <div class="detail-header-line"></div>
    </div>
  `,
  styles: [`
    app-detail-header { display: block; }

    app-detail-header .detail-header {
      --accent: #2b92bb;
      position: relative; padding: 22px 50px 16px 22px; overflow: visible;
      background: linear-gradient(135deg, #1e293b 70%, var(--accent));
      min-height: 100px;
    }

    /* Left accent strip */
    app-detail-header .detail-header::before {
      content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 4px; z-index: 1;
      background: linear-gradient(180deg, #fff, var(--accent));
      opacity: 0.4;
    }

    /* Ambient glow */
    app-detail-header .detail-header-glow {
      position: absolute; top: -30px; right: -30px; width: 120px; height: 120px;
      background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
      opacity: 0.12; pointer-events: none;
    }

    /* Title */
    app-detail-header .detail-header-title {
      position: relative; z-index: 1;
      font-size: 22px; font-weight: 800; margin: 0 0 6px; line-height: 1.2; letter-spacing: -0.5px;
      word-break: break-word; color: #fff;
      display: flex; align-items: center; gap: 8px;
    }

    /* Visibility icon next to title */
    app-detail-header .detail-header-visibility {
      font-size: 18px; color: #10b981; flex-shrink: 0;
    }
    app-detail-header .detail-header-visibility.private {
      color: #ef4444;
    }

    /* Subtitle pill */
    app-detail-header .detail-header-subtitle {
      position: relative; z-index: 1;
      display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
      text-transform: uppercase; color: #fff;
      background: rgba(255, 255, 255, 0.15); padding: 3px 10px; border-radius: 20px;
      margin-bottom: 12px;
    }

    /* Rows container */
    app-detail-header .detail-header-rows { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 6px; }

    /* Row */
    app-detail-header .detail-header-row { display: flex; align-items: center; gap: 8px; }
    app-detail-header .detail-header-row-icon { font-size: 14px; color: var(--accent); flex-shrink: 0; }
    app-detail-header .detail-header-row-text { font-size: 13px; font-weight: 500; color: rgba(255, 255, 255, 0.75); }

    /* Actions */
    app-detail-header .detail-header-actions { position: absolute; top: 14px; right: 10px; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; justify-content: flex-start; }
    app-detail-header .detail-header-actions > [header-actions] { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    app-detail-header .detail-header-actions .header-badge,
    app-detail-header .detail-header-actions .action-btn {
      margin: 0; background: rgba(255, 255, 255, 0.25) !important; color: #fff !important;
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      width: 28px; height: 28px; min-height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; padding: 0;
      flex-shrink: 0;
    }
    app-detail-header .detail-header-actions .header-badge ion-icon,
    app-detail-header .detail-header-actions .action-btn ion-icon { font-size: 14px; }
    app-detail-header .detail-header-actions .header-badge { color: #10b981 !important; }
    app-detail-header .detail-header-actions .header-badge.private { color: #f76e04 !important; }
    app-detail-header .detail-header-actions .action-btn.danger { color: #fca5a5 !important; }

    /* Bottom line */
    app-detail-header .detail-header-line {
      position: absolute; bottom: 0; left: 0; right: 0; height: 2px; overflow: hidden;
      background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent 80%);
    }
    app-detail-header .detail-header-line::after {
      content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: headerLineShimmer 3s ease-in-out infinite;
    }

    @keyframes headerLineShimmer {
      0% { left: -60%; }
      100% { left: 100%; }
    }

    /* ── Light theme ── */
    .light-theme app-detail-header .detail-header {
      background: linear-gradient(135deg, #f8fafc 70%, var(--accent));
    }
    .light-theme app-detail-header .detail-header-title { color: #0f172a; }
    .light-theme app-detail-header .detail-header-visibility { color: #10b981; }
    .light-theme app-detail-header .detail-header-visibility.private { color: #ef4444; }
    .light-theme app-detail-header .detail-header-subtitle { color: #1e293b; background: rgba(0, 0, 0, 0.08); }
    .light-theme app-detail-header .detail-header-row-icon { color: var(--accent); }
    .light-theme app-detail-header .detail-header-row-text { color: #475569; }
    .light-theme app-detail-header .detail-header-actions .header-badge,
    .light-theme app-detail-header .detail-header-actions .action-btn {
      background: rgba(255, 255, 255, 0.5) !important; color: #334155 !important;
      border-color: rgba(255, 255, 255, 0.3);
    }
    .light-theme app-detail-header .detail-header-actions .header-badge { color: #10b981 !important; }
    .light-theme app-detail-header .detail-header-actions .header-badge.private { color: #f76e04 !important; }
    .light-theme app-detail-header .detail-header-actions .action-btn.danger { color: #ef4444 !important; }
    .light-theme app-detail-header .detail-header-glow { opacity: 0.12; }
    .light-theme app-detail-header .detail-header-line { background: linear-gradient(90deg, rgba(0,0,0,0.1), transparent 80%); }
    .light-theme app-detail-header .detail-header::before { background: linear-gradient(180deg, #fff, var(--accent)); opacity: 0.3; }

    /* ── Responsive ── */
    @media (max-width: 359px) {
      app-detail-header .detail-header { padding: 16px 44px 12px 18px; }
      app-detail-header .detail-header-title { font-size: 19px; }
      app-detail-header .detail-header-subtitle { font-size: 9px; }
      app-detail-header .detail-header-actions { top: 10px; right: 8px; }
      app-detail-header .detail-header-actions .header-badge,
      app-detail-header .detail-header-actions .action-btn { width: 24px; height: 24px; min-height: 24px; border-radius: 6px; }
      app-detail-header .detail-header-actions .header-badge ion-icon,
      app-detail-header .detail-header-actions .action-btn ion-icon { font-size: 12px; }
    }
    @media (min-width: 768px) {
      app-detail-header .detail-header { padding: 26px 24px 18px 26px; }
      app-detail-header .detail-header-title { font-size: 26px; }
      app-detail-header .detail-header-subtitle { font-size: 11px; }
      app-detail-header .detail-header-row-text { font-size: 14px; }
      app-detail-header .detail-header-actions .header-badge,
      app-detail-header .detail-header-actions .action-btn { width: 34px; height: 34px; min-height: 34px; border-radius: 10px; }
      app-detail-header .detail-header-actions .header-badge ion-icon,
      app-detail-header .detail-header-actions .action-btn ion-icon { font-size: 17px; }
    }
  `]
})
export class DetailHeaderComponent implements OnChanges {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() detailRows: DetailHeaderRow[] = [];
  @Input() accentColor: string = '#2b92bb';
  @Input() visibilityIcon: string = '';

  constructor(private el: ElementRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.accentColor) {
      const el = this.el.nativeElement.querySelector('.detail-header');
      if (el) { el.style.setProperty('--accent', this.accentColor); }
    }
  }
}
