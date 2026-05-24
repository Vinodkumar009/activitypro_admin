import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-fab',
  encapsulation: ViewEncapsulation.None,
  template: ``,
  styles: [`
    .custom-fab {
      position: fixed;
      bottom: 70px; right: 16px;
      width: 52px; height: 52px;
      border-radius: 50%;
      background: rgba(43, 146, 187, 0.35);
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      color: #fff; font-size: 24px;
      display: flex; align-items: center; justify-content: center;
      z-index: 9990; cursor: pointer;
      transition: transform 0.2s ease;
    }
    .custom-fab:active { transform: scale(0.9); }
    .light-theme .custom-fab {
      background: rgba(43, 146, 187, 0.3);
      border-color: rgba(255, 255, 255, 0.25);
    }
  `]
})
export class FabComponent implements OnInit, OnDestroy {
  @Input() icon: string = 'add';
  @Output() fabClick = new EventEmitter<any>();
  private btn: HTMLElement;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    this.btn = document.createElement('button');
    this.btn.className = 'custom-fab';
    this.btn.innerHTML = `<ion-icon name="${this.icon}"></ion-icon>`;
    this.btn.addEventListener('click', (e) => this.fabClick.emit(e));
    document.body.appendChild(this.btn);
  }

  ngOnDestroy() {
    if (this.btn && this.btn.parentNode) {
      this.btn.parentNode.removeChild(this.btn);
    }
  }
}
