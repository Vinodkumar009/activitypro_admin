import { Component, Input, Output, EventEmitter, ViewEncapsulation, OnChanges, SimpleChanges } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { MapPickerModalComponent } from './map-picker-modal.component';

@Component({
  selector: 'app-map-picker',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="map-picker-field" (click)="openMap()">
      <ion-icon name="pin" class="mp-icon"></ion-icon>
      <span class="mp-text" *ngIf="!selectedAddress">Pick location on map</span>
      <span class="mp-text mp-selected" *ngIf="selectedAddress">{{ selectedAddress }}</span>
      <ion-icon name="arrow-forward" class="mp-chevron"></ion-icon>
    </div>
  `,
  styles: [`
    .map-picker-field {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; margin: 8px 0;
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(71, 85, 105, 0.4);
      border-radius: 12px; cursor: pointer;
      transition: border-color 0.2s;
    }
    .map-picker-field:active { transform: scale(0.98); }
    .mp-icon { font-size: 18px; color: #3fbcd3; flex-shrink: 0; }
    .mp-text {
      flex: 1; font-size: 14px; font-weight: 500; color: #64748b;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .mp-text.mp-selected { color: #f1f5f9; font-weight: 600; }
    .mp-chevron { font-size: 14px; color: #475569; flex-shrink: 0; }

    .light-theme .map-picker-field {
      background: rgba(255,255,255,0.55); border-color: rgba(226,232,240,0.6);
    }
    .light-theme .mp-text.mp-selected { color: #1e293b; }
    .light-theme .mp-chevron { color: #cbd5e1; }
  `]
})
export class MapPickerComponent implements OnChanges {
  @Input() address: string = '';
  @Input() lat: number = null;
  @Input() lng: number = null;
  @Output() locationSelected = new EventEmitter<any>();
  selectedAddress: string = '';

  constructor(private modalCtrl: ModalController) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.address && changes.address.currentValue) {
      this.selectedAddress = changes.address.currentValue;
    }
  }

  openMap() {
    const modal = this.modalCtrl.create(MapPickerModalComponent, {
      initialAddress: this.selectedAddress,
      initialLat: this.lat,
      initialLng: this.lng
    });
    modal.onDidDismiss((data) => {
      if (data) {
        this.selectedAddress = data.address;
        this.locationSelected.emit(data);
      }
    });
    modal.present();
  }
}
