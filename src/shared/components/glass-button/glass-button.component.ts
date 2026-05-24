import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-glass-button',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="glass-btn-wrap">
      <button class="glass-btn" (click)="btnClick.emit($event)">{{label}}</button>
    </div>
  `,
  styles: [`
    .glass-btn-wrap {
      position: sticky; bottom: 0; padding: 12px; padding-bottom: calc(12px + env(safe-area-inset-bottom, 16px)); z-index: 10;
    }
    .glass-btn {
      width: 100%; height: 48px; border: none; border-radius: 8px;
      font-weight: 700; font-size: 16px; letter-spacing: 0.5px;
      color: #fff; cursor: pointer;
      position: relative; overflow: hidden;
      background: linear-gradient(135deg, rgba(43,146,187,0.85), rgba(53,173,255,0.75));
      backdrop-filter: blur(20px) saturate(200%);
      -webkit-backdrop-filter: blur(20px) saturate(200%);
      border: 1px solid rgba(255,255,255,0.25);
      box-shadow: 0 4px 20px rgba(43,146,187,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
    }
    .glass-btn::after {
      content: '';
      position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: glassBtnShimmer 3s ease-in-out infinite;
    }
    .glass-btn:active { transform: scale(0.98); }
    @keyframes glassBtnShimmer {
      0% { left: -100%; }
      50% { left: 150%; }
      100% { left: 150%; }
    }
    .light-theme .glass-btn {
      background: linear-gradient(135deg, rgba(43,146,187,0.8), rgba(53,173,255,0.7));
    }
  `]
})
export class GlassButtonComponent {
  @Input() label: string = 'Create';
  @Output() btnClick = new EventEmitter<any>();
}
