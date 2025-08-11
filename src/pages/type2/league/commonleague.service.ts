import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable()
export class CommonLeagueService {
  private _currentType: number = 0;
  public activeTypeSubject = new BehaviorSubject<number>(this._currentType);

  constructor() {
    this.activeTypeSubject.subscribe(type => {
      this._currentType = type;
      console.log('Service updated current type to:', this._currentType);
    });
  }

  setActiveLeagueType(type: number) {
    console.log('Service setting type to:', type);
    this._currentType = type;
    this.activeTypeSubject.next(this._currentType);
  }

  getActiveLeagueType(): number {
    console.log('Service getting current type:', this._currentType);
    return this._currentType;
  }
}
