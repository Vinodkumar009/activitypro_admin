import { Component, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-form-field',
  encapsulation: ViewEncapsulation.None,
  template: `<div class="form-field" [class.light]="!isDark"><ng-content></ng-content></div>`,
  styles: [`
    .form-field {
      margin: 6px 0;

      ion-item {
        border-radius: 12px !important;
        border: 1px solid #334155 !important;
        background: #1e293b !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        padding-left: 16px;
        align-items: center;
      }
      ion-item .item-inner {
        border-bottom: none !important;
        padding: 6px 16px 6px 0;
        box-shadow: none !important;
      }
      ion-label {
        color: #94a3b8 !important;
        font-weight: 700 !important;
        font-size: 11px !important;
        text-transform: uppercase !important;
        letter-spacing: 0.6px !important;
        white-space: normal !important;
        overflow: visible !important;
        margin-right: 12px;
      }
      ion-select { max-width: 70% !important; }
      .select-text { max-width: none !important; }
      ion-select .select-icon { margin-left: 2px !important; }
      ion-input, ion-select, ion-datetime, ion-textarea {
        font-size: 16px !important;
        font-weight: 600 !important;
        color: #fff !important;
        text-align: right !important;
      }
      .text-input, .datetime-text, .select-text { color: #fff !important; }
      .text-input::placeholder { color: #475569 !important; font-weight: 500 !important; }

      // Toggle
      ion-toggle {
        .toggle-inner { background: #fff !important; }
        .toggle-icon { background: #334155 !important; }
        &[checked] .toggle-icon { background: #2b92bb !important; }
      }

      // Access toggle / expandable inside form-field
      app-access-toggle, app-expandable-section {
        display: block; margin: 0;
      }
    }

    .form-field.light {
      ion-item {
        background: #fff !important;
        border-color: #e2e8f0 !important;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05) !important;
      }
      ion-label { color: #64748b !important; }
      ion-input, ion-select, ion-datetime, ion-textarea { color: #0f172a !important; }
      .text-input, .datetime-text, .select-text { color: #0f172a !important; }
      .text-input::placeholder { color: #94a3b8 !important; }
      ion-toggle .toggle-icon { background: #cbd5e1 !important; }
      ion-toggle[checked] .toggle-icon { background: #2b92bb !important; }
    }
  `]
})
export class FormFieldComponent {
  @Input() isDark: boolean = true;
}
