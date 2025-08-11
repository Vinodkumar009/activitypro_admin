import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
@IonicPage()
@Component({
  selector: 'addfamilymembercoach-page',
  templateUrl: 'addfamilymembercoach.html'
})

export class CoachAddMemberFamilySession {
  themeType: number;

  //
  //variables declarations
  //
  parentClubKey: any;
  clubKey: any;
  CoachKey: any;
  SessionKey: any;
  members: any;

  memberDetailsObj = {
    ClubKey: '',
    DOB: '',
    EmailID: '',
    EmergencyContactName: '',
    EmergencyNumber: '',
    FirstName: '',
    Gender: '',
    IsChild: false,
    LastName: '',
    MedicalCondition: '',
    ParentClubKey: '',
    ParentKey: '',
    Password: '',
    PhoneNumber: '',
    Source: ''
  }
  SessionDetials: any;
  SessionName: any;
  selectedMemberKey: any;
  constructor(public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController) {
    this.themeType = sharedservice.getThemeType();
    //this.navCtrl.push(AddMembershipSession,{ParentClubKey: this.parentClubKey,ClubKey:this.selectedClub,CoachKey:this.selectedCoach,SessionKey:this.returnKey});
    this.parentClubKey = navParams.get('ParentClubKey');
    this.clubKey = navParams.get('ClubKey');
    this.CoachKey = navParams.get('CoachKey');
    this.SessionKey = navParams.get('SessionKey');
    this.SessionName = navParams.get('SessionName');
    this.SessionDetials = navParams.get('SessionDetials');
    this.getMemberList();
  }
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  getMemberList() {
    this.fb.getAll("/Member/" + this.parentClubKey + "/" + this.clubKey).subscribe((data) => {
      this.members = data;
      for (let i = 0; i < this.members.length; i++) {
        this.members[i].isSelect = false;
      }
    });
  }

  selectMember(member) {
    this.selectedMemberKey = member.$key;
    this.memberDetailsObj.ClubKey = member.ClubKey;
    this.memberDetailsObj.DOB = member.DOB;
    this.memberDetailsObj.EmailID = member.EmailID;
    this.memberDetailsObj.EmergencyContactName = member.EmergencyContactName;
    this.memberDetailsObj.EmergencyNumber = member.EmergencyNumber;
    this.memberDetailsObj.FirstName = member.FirstName;
    this.memberDetailsObj.Gender = member.Gender;
    this.memberDetailsObj.IsChild = member.IsChild;
    this.memberDetailsObj.LastName = member.LastName;
    this.memberDetailsObj.MedicalCondition = member.MedicalCondition;
    this.memberDetailsObj.ParentClubKey = member.ParentClubKey;
    this.memberDetailsObj.Password = member.Password;
    this.memberDetailsObj.PhoneNumber = member.PhoneNumber;
    this.memberDetailsObj.Source = member.Source;
  }


  addMember() {
    //keeeping member details in session folder
    this.fb.update(this.selectedMemberKey, "/Session/" + this.parentClubKey + "/" + this.clubKey + "/" + this.CoachKey + "/" + this.SessionName + "/" + this.SessionKey + "/Member/", this.memberDetailsObj);

    //keeping session details in member folder
    this.fb.update(this.SessionKey, "/Member/" + this.parentClubKey + "/" + this.clubKey + "/" + this.selectedMemberKey + "/Session/", this.SessionDetials);

    //keeping member detials in coach folder
    this.fb.update(this.selectedMemberKey, "/Coach/Type2/" + this.parentClubKey + "/" + this.CoachKey + "/Member/", this.memberDetailsObj);


    this.navCtrl.pop();
    this.navCtrl.pop();
  }


  goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
	
}
