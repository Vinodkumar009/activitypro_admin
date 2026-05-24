import { Component } from '@angular/core';
import { NavController,PopoverController, Events } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import {IonicPage } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { ThemeService } from '../../../services/theme.service';
@IonicPage()
@Component({
  selector: 'editfamilymember-page',
  templateUrl: 'editfamilymember.html'
})

export class Type2EditFamilyMember {
  isDarkTheme: boolean = true;
  themeType:number;
  constructor(public navCtrl: NavController, public sharedservice: SharedServices,
    public popoverCtrl: PopoverController, public storage: Storage,
    public events: Events, private themeService: ThemeService) {
    this.themeType = sharedservice.getThemeType();
    this.loadTheme();
  }

  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  save(){
      this.navCtrl.push("Type2Member");
  }

  goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
      this.applyTheme();
    }).catch(() => { this.isDarkTheme = true; this.applyTheme(); });
    this.events.subscribe('theme:changed', (isDark) => { this.isDarkTheme = isDark; this.applyTheme(); });
  }

  applyTheme() {
    const el = document.querySelector('editfamilymember-page');
    if (el) {
      if (this.isDarkTheme) { el.classList.remove('light-theme'); } else { el.classList.add('light-theme'); }
    }
  }

}
 