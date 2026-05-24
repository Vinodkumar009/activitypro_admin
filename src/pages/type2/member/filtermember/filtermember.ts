import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, Checkbox, Events } from 'ionic-angular';
import { JsonPipe } from '@angular/common';
import { FirebaseService } from '../../../../services/firebase.service';
import { CommonService,ToastPlacement, ToastMessageType } from '../../../../services/common.service';
import { Storage } from '@ionic/storage';
import { ThemeService } from '../../../../services/theme.service';
/**
 * Generated class for the FiltermemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-filtermember',
  templateUrl: 'filtermember.html',
  providers:[FirebaseService,CommonService]
})
export class FiltermemberPage {
  isDarkTheme: boolean = true;
  filteredMember: Array<any> = [];
  unmutated_memblist: Array<any> = [];
  members: Array<any> = [];
  parentClubKey:string = "";
  selectedClub:string = "";
  constructor(public commonService: CommonService,
    public navCtrl: NavController, public navParams: NavParams,
     public viewCtrl: ViewController, public fb: FirebaseService,
     private storage: Storage, private events: Events, private themeService: ThemeService) {
    this.loadTheme();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FiltermemberPage');
    
    this.members = JSON.parse(JSON.stringify(this.navParams.get('memberList')));
    this.unmutated_memblist = JSON.parse(JSON.stringify(this.navParams.get('memberList')));
    //this.getMemberList();
  }

  //  initializeItems() {
  //     this.members = this.allMemebers;
  //   }



  selecteMembers(index:number,cbox?:Checkbox) {
    let isPresent = false;
    // console.log(cbox);
    // if (cbox.checked){
    //   console.log(`checkbox_val:${cbox.checked}`)
    // }else{
    //   console.log(`checkbox_val:${cbox.checked}`)
    // }
    // console.log(member.isSelect);
    if(this.filteredMember.length > 0){
      if(cbox.checked){
        this.filteredMember.push(this.members[index]);
      }else{
        const user_index = this.filteredMember.findIndex(existed_user => existed_user.Id == this.members[index].Id);
        this.filteredMember.splice(user_index,1);
      }
    }else{
      this.filteredMember.push(this.members[index]);
    }
    console.log(this.filteredMember);
  }

  dismiss() {
    this.viewCtrl.dismiss({ selectedMembers:this.filteredMember });
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    // this.initializeItems();
    // // set val to the value of the searchbar
    let val = ev.target.value;
    // if the value is an empty string don't filter the items
    if (val && val.trim()!= '') {
      this.members = this.unmutated_memblist.filter((item) => {
        if (item.FirstName != undefined && item.FirstName != "") {
          if (item.FirstName.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
        if (item.LastName != undefined && item.LastName != "") {
          if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1){
            return true;
          }
        }
      })
    }else{
      this.members = this.unmutated_memblist
    }
  }

  loadTheme() {
    this.storage.get('dashboardTheme').then((isDarkTheme) => {
      this.isDarkTheme = isDarkTheme !== null ? isDarkTheme : true;
      this.applyTheme();
    }).catch(() => { this.isDarkTheme = true; this.applyTheme(); });
    this.events.subscribe('theme:changed', (isDark) => { this.isDarkTheme = isDark; this.applyTheme(); });
  }

  applyTheme() {
    const el = document.querySelector('page-filtermember');
    if (el) {
      if (this.isDarkTheme) { el.classList.remove('light-theme'); } else { el.classList.add('light-theme'); }
    }
  }

}
