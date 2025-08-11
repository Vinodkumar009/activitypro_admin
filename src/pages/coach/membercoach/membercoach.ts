import { Component } from '@angular/core';
import { NavController, PopoverController, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';

import { CallNumber } from '@ionic-native/call-number';
import { IonicPage, ActionSheetController } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
  selector: 'membercoach-page',
  templateUrl: 'membercoach.html'
})

export class CoachMember {
  themeType: number;
  show: boolean;
  selectedParentClubKey: string;
  selectedClubKey: string;
  members = [];
  allMemebers = [];
  selectedIndex: number;
  clubs: any;
  coachType: any;
  isShowMessage1 = false;
  selectedCoach: any;
  isShow = false;
  parentMember = 0;
  memberschild = 0;
  constructor(private callNumber: CallNumber,private toastCtrl: ToastController,public actionSheetCtrl: ActionSheetController, public commonService: CommonService, storage: Storage, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    this.selectedIndex = -1;
   
    

    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      // if (val.$key != "") {
      //   this.parentClubKey = val.UserInfo[0].ParentClubKey;
      //   this.selectedCoach = 
      //   this.getClubList();
      // }
      if (val.$key != "") {
        this.selectedCoach = val.UserInfo[0].CoachKey;
        this.selectedParentClubKey = val.UserInfo[0].ParentClubKey;
        this.coachType = val.Type;
        this.getClubList();
      }
    })
  }

  getClubList() {
    this.fb.getAll("/Coach/Type" + this.coachType + "/" + this.selectedParentClubKey + "/" + this.selectedCoach + "/Club/").subscribe((data) => {
      if (data.length > 0) {
        this.clubs = data;
        if (this.clubs.length != 0) {
          this.selectedClubKey = this.clubs[0].$key;
          this.venueSelected(this.selectedClubKey)
        }
      }
    });
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  // addMember() {
  //   this.navCtrl.push(Type2AddMember);
  // }
  // editMember() {
  //   this.navCtrl.push(Type2EditMember);
  // }

  toggoleMethod() {
    this.show = !this.show;
  }
  // gotoAddFamilyMember(memberObj) {
  //   this.navCtrl.push(Type2AddFamilyMember, { clubkey: this.selectedClubKey, memberInfo: memberObj });
  // }
  // gotoEditFamilyMember() {
  //   this.navCtrl.push(Type2EditFamilyMember);
  // }
  venueSelected(venueKey) {
    this.members = [];
    this.isShow = true;
    this.allMemebers = [];
    this.fb.getAll("/Member/" + this.selectedParentClubKey + "/" + venueKey).subscribe((data) => {

      // if (data.length > 0) {
      //   this.isShow = false;
      //   this.members = data;

      //   for (let i = 0; i < this.members.length; i++) {
      //     this.members[i].ChildMember = [];
      //     if (this.members[i].IsChild == false) {
      //       let x = this.commonService.convertFbObjectToArray(this.members[i].FamilyMember);
      //       this.members[i].ChildMember = x;
      //     }
      //   }
      //   this.allMemebers = this.members;
      // }
      this.members = [];
        this.allMemebers = [];
        if (data.length > 0) {
          this.members = data;
          for (let i = 0; i < this.members.length; i++) {
            this.members[i]["FullName"] = this.members[i].FirstName + " " + this.members[i].LastName;
            this.members[i].ChildMember = [];
            if (this.members[i].IsChild == false) {
              let x = this.commonService.convertFbObjectToArray(this.members[i].FamilyMember);
              for (let childmemberIndex = 0; childmemberIndex < x.length; childmemberIndex++) {
                x[childmemberIndex]["FullName"] = x[childmemberIndex].FirstName + " " + x[childmemberIndex].LastName;
              }
              this.members[i].ChildMember = x;
              this.parentMember++;
              if (this.members[i].FamilyMember != undefined) {
                let x = this.commonService.convertFbObjectToArray(this.members[i].FamilyMember);
                this.memberschild = this.memberschild + x.length;
              }
            }
          }


          this.allMemebers = this.members;
        }
    });
  }


  memberDetailsForGroup(index) {
    this.selectedIndex = (index == this.selectedIndex) ? -1 : index;
  }


  initializeItems() {
    this.members = this.allMemebers;
  }
  getFilterItems(ev: any) {


    try {
      // Reset items back to all of the items
      this.initializeItems();

      // set val to the value of the searchbar
      let val = ev.target.value;

      // if the value is an empty string don't filter the items
      if (val && val.trim() != '') {
        this.members = this.members.filter((item) => {
          if (item.FullName != undefined) {
            if (item.FullName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
              return true;
            }
            else {
              if (item.ChildMember != undefined) {
                for (let i = 0; i < item.ChildMember.length; i++) {
                  if (item.ChildMember[i].FullName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
                    return true;
                  }
                }
              }
            }

          }
        })

      }
      this.parentMember = 0;
      this.memberschild = 0;
      for (let i = 0; i < this.members.length; i++) {
        if (this.members[i].IsChild == false) {
          this.parentMember++;
          if (this.members[i].FamilyMember != undefined) {
            let x = this.commonService.convertFbObjectToArray(this.members[i].FamilyMember);
            this.memberschild = this.memberschild + x.length;
          }
        }

      }

    }
    catch (ex) {
     
    }

    // this.loading.dismiss().catch(() => { });

  }
  // getFilterItems(ev: any) {
  //   // Reset items back to all of the items
  //   this.initializeItems();

  //   // set val to the value of the searchbar
  //   let val = ev.target.value;

  //   // if the value is an empty string don't filter the items
  //   if (val && val.trim() != '') {
  //     this.members = this.members.filter((item) => {
  //       return (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1);
  //       //return item;
  //     })
  //   }
  // }

  // getFilterItems(ev: any) {
  //   // Reset items back to all of the items
  //   this.initializeItems();

  //   // set val to the value of the searchbar
  //   let val = ev.target.value;

  //   // if the value is an empty string don't filter the items
  //   if (val && val.trim() != '') {
  //     this.members = this.members.filter((item) => {
  //       if (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
  //         return true;
  //       }
  //       else {
  //         if (item.ChildMember != undefined) {
  //           for (let i = 0; i < item.ChildMember.length; i++) {
  //             if (item.ChildMember[i].LastName.toLowerCase().indexOf(val.toLowerCase()) > -1) {
  //               return true;
  //             }
  //           }
  //         }
  //       }
  //     })
  //   }
  // }


  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }

 
  presentActionSheet(member, index) {
    // this.myIndex = -1;
    let actionSheet
    // if (this.platform.is('android')) {
    actionSheet = this.actionSheetCtrl.create({
      buttons: [{
        text: 'Family Member',
        icon: 'person',
        handler: () => {
          this.memberDetailsForGroup(index);

        }
      },
      {
        text: 'Notify',
        icon: 'md-notifications',
        handler: () => {
          this.notifyToMember(member);

        }
      },
      {
        text: 'Email',
        icon: 'mail',
        handler: () => {
          this.sentAnEmailToMember(member);

        }
      },
      {
        text: 'Call',
        icon: 'call',
        handler: () => {
          this.callToMember(member);

        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {

        }
      }
      ]
    });

    actionSheet.present();

  }





  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      position: 'bottom'
    });
    toast.present();
  }


  sentAnEmailToMember(member) {
    let mlist = [];
    mlist.push(member);
    this.navCtrl.push("MailToMemberByAdminPage", { MemberList: mlist, NavigateFrom: "Member" });
  }
  callToMember(member) {
    if (this.callNumber.isCallSupported()) {
      this.callNumber.callNumber(member.PhoneNumber, true)
        .then(() => console.log())
        .catch(() => console.log());
    } else {
      this.showToast("Your device is not supporting to lunch call dialer.", 3000);
    }
  }
  notifyToMember(member) {
    this.navCtrl.push("Type2NotificationToIndividualMember", { MemberDetails: member });
  }
}
