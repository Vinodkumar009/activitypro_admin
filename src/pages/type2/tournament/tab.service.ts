import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TabService {
  private selectedTabIndex = new BehaviorSubject<number>(0); // Default to 0
  selectedTabIndex$ = this.selectedTabIndex.asObservable(); // Observable for subscriptions

  constructor() {}

  setSelectedTab(index: number) {
    this.selectedTabIndex.next(index);
  }
}
