import { Component, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams, Events, FabContainer } from 'ionic-angular';
import { TSMap } from 'typescript-map';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
import { Storage } from '@ionic/storage';
import { ThemeService } from '../../../services/theme.service';

@IonicPage()
@Component({
  selector: 'page-bookingcontainer',
  templateUrl: 'bookingcontainer.html',
})
export class BookingcontainerPage {
  @ViewChild('fab') fab: FabContainer;
  activeIndex = 0;
  isDarkTheme: boolean = false;

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public navParams: NavParams,
    public fb: FirebaseService,
    public storage: Storage,
    public commonService: CommonService,
    private themeService: ThemeService
  ) {}

  ionViewDidLoad() {
    this.loadTheme();
  }

  ionViewWillEnter() {
    this.fab.close();
    this.loadTheme();
    this.themeService.isDarkTheme$.subscribe(isDark => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
    this.events.subscribe('theme:changed', (isDark) => {
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    });
  }

  ionViewWillLeave() {
    this.events.unsubscribe('theme:changed');
  }

  private loadTheme(): void {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      const isDark = isDarkTheme !== null ? isDarkTheme : true;
      this.isDarkTheme = isDark;
      this.applyTheme(isDark);
    }).catch(() => {
      this.isDarkTheme = true;
      this.applyTheme(true);
    });
  }

  private applyTheme(isDark: boolean): void {
    const el = document.querySelector("page-bookingcontainer");
    if (el) {
      isDark ? el.classList.remove("light-theme") : el.classList.add("light-theme");
      isDark ? document.body.classList.remove("light-theme") : document.body.classList.add("light-theme");
    }
  }

  changeType(index: number) {
    this.activeIndex = index;
  }

  GotoSlide(SlideIndex: number) {
    switch (SlideIndex) {
      case 1:
        this.navCtrl.push("RecuringbookingPage");
        break;
      case 2:
        this.navCtrl.push("BookingPage");
        break;
    }
  }
}
