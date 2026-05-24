import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-expandable-section',
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'expandable-section.component.html',
  styles: [`
    app-expandable-section { display: block; }
    app-expandable-section .expandable-body {
      max-height: 0; overflow: hidden; opacity: 0;
      margin-left: 12px; padding-left: 12px;
      border-left: 3px solid #2b92bb;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                  opacity 0.3s ease 0.1s;
    }
    app-expandable-section .expandable-body.expanded { max-height: 600px; opacity: 1; }
    app-expandable-section .expandable-body ion-item {
      margin-left: 0 !important;
      border-radius: 0 12px 12px 0 !important;
      border-left: none !important;
    }
  `]
})
export class ExpandableSectionComponent {
  @Input() label: string = 'Toggle';
  @Input() expanded: boolean = false;
  @Output() expandedChange = new EventEmitter<boolean>();

  onToggle(val: boolean) {
    this.expanded = val;
    this.expandedChange.emit(val);
  }
}
