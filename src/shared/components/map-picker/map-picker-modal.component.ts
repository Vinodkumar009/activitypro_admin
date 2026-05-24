import { Component, ViewEncapsulation, ElementRef, ViewChild, NgZone } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

declare var google: any;

@Component({
  selector: 'map-picker-modal',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="map-modal">
      <div class="map-search-bar">
        <ion-icon name="arrow-back" class="map-back" (click)="dismiss()"></ion-icon>
        <input #searchInput class="map-search-input" placeholder="Search a place..." type="text"
          (input)="onSearchInput($event)" (keydown.enter)="searchPlace()">
        <div class="map-suggestions" *ngIf="suggestions.length > 0">
          <div class="map-suggestion" *ngFor="let s of suggestions" (click)="selectSuggestion(s)">
            <ion-icon name="pin"></ion-icon> {{ s.description }}
          </div>
        </div>
      </div>
      <div #mapContainer class="map-container"></div>
      <div class="map-pin">
        <ion-icon name="pin"></ion-icon>
      </div>
      <div class="map-footer">
        <div class="map-address">{{ selectedAddress || 'Move map to select location' }}</div>
        <button class="map-confirm-btn" (click)="confirm()" [disabled]="!selectedAddress">Confirm Location</button>
      </div>
    </div>
  `,
  styles: [`
    .map-modal {
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; flex-direction: column; background: #0f172a; z-index: 10000;
    }
    .map-search-bar {
      position: absolute; top: 0; left: 0; right: 0; z-index: 2;
      display: flex; align-items: center; gap: 8px;
      padding: 12px; padding-top: calc(env(safe-area-inset-top, 20px) + 12px);
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    }
    .map-back { font-size: 24px; color: #fff; cursor: pointer; flex-shrink: 0; }
    .map-search-input {
      flex: 1; height: 40px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.1); color: #fff; padding: 0 12px;
      font-size: 14px; outline: none;
    }
    .map-search-input::placeholder { color: rgba(255,255,255,0.5); }
    .map-suggestions {
      position: absolute; top: 100%; left: 0; right: 0;
      background: rgba(15,23,42,0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      max-height: 200px; overflow-y: auto; z-index: 3;
    }
    .map-suggestion {
      padding: 12px 16px; color: #f1f5f9; font-size: 13px;
      display: flex; align-items: center; gap: 8px; cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .map-suggestion:active { background: rgba(255,255,255,0.1); }
    .map-suggestion ion-icon { color: #3fbcd3; font-size: 14px; flex-shrink: 0; }
    .map-search-bar { position: relative; }
    .map-container { flex: 1; }
    .map-pin {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -100%);
      z-index: 1; pointer-events: none;
      ion-icon { font-size: 36px; color: #ef4444; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
    }
    .map-footer {
      position: absolute; bottom: 0; left: 0; right: 0; z-index: 2;
      padding: 16px; padding-bottom: calc(env(safe-area-inset-bottom, 16px) + 16px);
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    }
    .map-address {
      font-size: 13px; color: #f1f5f9; margin-bottom: 10px;
      line-height: 1.4; min-height: 18px;
      overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .map-confirm-btn {
      width: 100%; height: 44px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, rgba(43,146,187,0.85), rgba(53,173,255,0.75));
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff; font-size: 15px; font-weight: 700; letter-spacing: 0.3px; cursor: pointer;
    }
    .map-confirm-btn:disabled { opacity: 0.4; }

    .light-theme .map-search-bar, .light-theme .map-footer {
      background: rgba(248,250,252,0.7);
    }
    .light-theme .map-back { color: #1e293b; }
    .light-theme .map-search-input {
      background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.1); color: #1e293b;
    }
    .light-theme .map-search-input::placeholder { color: rgba(0,0,0,0.4); }
    .light-theme .map-address { color: #1e293b; }
  `]
})
export class MapPickerModalComponent {
  @ViewChild('mapContainer') mapEl: ElementRef;
  @ViewChild('searchInput') searchInputEl: ElementRef;

  map: any;
  geocoder: any;
  autocompleteService: any;
  placesService: any;
  selectedAddress: string = '';
  selectedLat: number = 0;
  selectedLng: number = 0;
  suggestions: any[] = [];
  searchTimeout: any;

  constructor(private viewCtrl: ViewController, private navParams: NavParams, private zone: NgZone) {}

  ionViewDidLoad() {
    this.initMap();
  }

  initMap() {
    const center = { lat: 51.5074, lng: -0.1278 };

    this.map = new google.maps.Map(this.mapEl.nativeElement, {
      center, zoom: 14,
      disableDefaultUI: true, zoomControl: true,
      styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }]
    });

    this.geocoder = new google.maps.Geocoder();

    // Reverse geocode on map idle
    this.map.addListener('idle', () => {
      const c = this.map.getCenter();
      this.selectedLat = c.lat();
      this.selectedLng = c.lng();
      this.geocoder.geocode({ location: { lat: this.selectedLat, lng: this.selectedLng } }, (results, status) => {
        this.zone.run(() => {
          if (status === 'OK' && results[0]) {
            this.selectedAddress = results[0].formatted_address;
          } else {
            this.selectedAddress = this.selectedLat.toFixed(5) + ', ' + this.selectedLng.toFixed(5);
          }
        });
      });
    });

    // Center on initial lat/lng if provided, else address, else geolocation
    const initialLat = this.navParams.get('initialLat');
    const initialLng = this.navParams.get('initialLng');
    const initialAddress = this.navParams.get('initialAddress');
    if (initialLat && initialLng) {
      this.map.panTo({ lat: initialLat, lng: initialLng });
      this.map.setZoom(16);
    } else if (initialAddress) {
      this.geocoder.geocode({ address: initialAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
          this.map.panTo(results[0].geometry.location);
          this.map.setZoom(16);
        }
      });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.map.panTo({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }

  onSearchInput(event: any) {
    const query = event.target.value;
    if (this.searchTimeout) clearTimeout(this.searchTimeout);
    if (!query || query.length < 3) { this.suggestions = []; return; }

    this.searchTimeout = setTimeout(() => {
      const url = `https://places.googleapis.com/v1/places:autocomplete`;
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': 'AIzaSyDpcFMCrpkNA_WXypfOPcBqEgqAr6_DRbE'
        },
        body: JSON.stringify({ input: query })
      })
      .then(res => res.json())
      .then(data => {
        this.zone.run(() => {
          this.suggestions = (data.suggestions || []).map(s => ({
            description: (s.placePrediction && s.placePrediction.text && s.placePrediction.text.text) ? s.placePrediction.text.text : '',
            place_id: (s.placePrediction && s.placePrediction.placeId) ? s.placePrediction.placeId : ''
          }));
        });
      })
      .catch(() => { this.zone.run(() => { this.suggestions = []; }); });
    }, 300);
  }

  selectSuggestion(suggestion: any) {
    this.suggestions = [];
    this.searchInputEl.nativeElement.value = suggestion.description;
    // Get place details via new API
    fetch(`https://places.googleapis.com/v1/places/${suggestion.place_id}`, {
      headers: {
        'X-Goog-Api-Key': 'AIzaSyDpcFMCrpkNA_WXypfOPcBqEgqAr6_DRbE',
        'X-Goog-FieldMask': 'location'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.location) {
        this.map.panTo({ lat: data.location.latitude, lng: data.location.longitude });
        this.map.setZoom(16);
      }
    })
    .catch(() => {});
  }

  searchPlace() {
    this.suggestions = [];
  }

  confirm() {
    this.viewCtrl.dismiss({
      address: this.selectedAddress,
      lat: this.selectedLat,
      lng: this.selectedLng
    });
  }

  dismiss() {
    this.viewCtrl.dismiss(null);
  }
}
