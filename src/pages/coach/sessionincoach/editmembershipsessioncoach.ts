import { Component } from '@angular/core';
import { AlertController, ToastController, NavController, NavParams, ActionSheetController, LoadingController } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
// import { Dashboard } from './../../dashboard/dashboard';
// import { CoachPaymentDetailsForGroup } from './updatepaymentdetailsforgroup'


import {IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
import { CallNumber } from '@ionic-native/call-number';
@IonicPage()
@Component({
  selector: 'editmembershipsessioncoach-page',
  templateUrl: 'editmembershipsessioncoach.html'
})

export class CoachEditMembershipSession {
  themeType: number;
  venue: string = "s";
  term: string = "t1";
  activitytype: string = "a1";
  coach: string = "a";
  ageGroup = {
    initialSlide: 0,
    loop: true
    //pager: true
  };
  category = {
    initialSlide: 0,
    loop: true
  };
  startTime: any = 10;
  duration: any = 2;
  musicAlertOpts: { title: string, subTitle: string };
  //
  //variables declarations
  //
  parentClubKey: any;
  clubKey: any;
  CoachKey: any;
  SessionKey: any;
  members: any;
  loading:any = "";

  sessionDetailsObj = {
    IsActive: true,
    ActivityCategoryKey: '',
    ActivityKey: '',
    ActivitySubCategoryKey: '',
    ClubKey: '',
    CoachKey: '',
    CoachName: '',
    Comments: '',
    Days: '',
    Duration: '60',
    EndDate: '',
    FinancialYearKey: '',
    GroupSize: '10',
    IsExistActivitySubCategory: false,
    IsExistActivityCategory: false,
    IsTerm: false,
    ParentClubKey: '',
    SessionFee: '7',
    SessionName: 'Session',
    SessionType: '',
    StartDate: '',
    StartTime: '',
    TermKey: '',
    TotalFeesAmount: '',
    AmountPaid: '',
    AmountDue: '',
    AmountPayStatus: '',
    OtherComments: '',
    IsVerified: false,
    PaidBy: '',
    PayByDate: ''
  };






  memberDetailsObj = {
    IsActive: true,
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
    Source: '',
    TotalFeesAmount: '',
    AmountPaid: '',
    AmountDue: '',
    AmountPayStatus: '',
    OtherComments: '',
    IsVerified: false,
    PaidBy: '',
    PayByDate: ''
  }


  allMemebers = [];

  selectedMembersForTheSession = [];
  NewSessionDetials: any;
  OldSessionDetails: any;
  SessionName: any;
  constructor(  public callNumber: CallNumber,public loadingCtrl:LoadingController,public commonService:CommonService,private alertCtrl: AlertController, private toastCtrl: ToastController, public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public popoverCtrl: PopoverController,public actionSheetCtrl: ActionSheetController) {
    this.themeType = sharedservice.getThemeType();

    this.NewSessionDetials = navParams.get('NewSessionDetials');
    this.OldSessionDetails = navParams.get('OldSessionDetails');
    console.log(this.NewSessionDetials);





    this.selectedMembersForTheSession = this.commonService.convertFbObjectToArray(this.OldSessionDetails.Member);
    for (let i = 0; i < this.selectedMembersForTheSession.length; i++) {
      let age = (new Date().getFullYear() - new Date(this.selectedMembersForTheSession[i].DOB).getFullYear());
      //this.selectedMembersForTheSession[i].Age = age;
      if (isNaN(age)) {
        this.selectedMembersForTheSession[i].Age = "N.A";
      } else {
        this.selectedMembersForTheSession[i].Age = age;
      }
    }

    //session details 

    this.sessionDetailsObj.IsActive = true,
      this.sessionDetailsObj.ActivityCategoryKey = this.NewSessionDetials.ActivityCategoryKey;
    if (this.NewSessionDetials.ActivityCategoryKey == undefined) {
      this.sessionDetailsObj.ActivityCategoryKey = "";
    }

    this.sessionDetailsObj.ActivityKey = this.NewSessionDetials.ActivityKey;
    if (this.NewSessionDetials.ActivityKey == undefined) {
      this.sessionDetailsObj.ActivityKey = "";
    }

    this.sessionDetailsObj.ActivitySubCategoryKey = this.NewSessionDetials.ActivitySubCategoryKey;
    if (this.NewSessionDetials.ActivitySubCategoryKey == undefined) {
      this.sessionDetailsObj.ActivitySubCategoryKey = "";
    }


    this.sessionDetailsObj.ActivityKey = this.NewSessionDetials.ActivityKey;
    if (this.NewSessionDetials.ActivityKey == undefined) {
      this.sessionDetailsObj.ActivityKey = "";
    }

    this.sessionDetailsObj.ClubKey = this.NewSessionDetials.ClubKey;
    if (this.NewSessionDetials.ClubKey == undefined) {
      this.sessionDetailsObj.ClubKey = "";
    }

    this.sessionDetailsObj.CoachKey = this.NewSessionDetials.CoachKey;
    if (this.NewSessionDetials.CoachKey == undefined) {
      this.sessionDetailsObj.CoachKey = "";
    }




    this.sessionDetailsObj.CoachName = this.NewSessionDetials.CoachName;
    if (this.NewSessionDetials.CoachName == undefined) {
      this.sessionDetailsObj.CoachName = "";
    }


    this.sessionDetailsObj.Comments = this.NewSessionDetials.Comments;
    if (this.NewSessionDetials.Comments == undefined) {
      this.sessionDetailsObj.Comments = "";
    }


    this.sessionDetailsObj.Days = this.NewSessionDetials.Days;
    if (this.NewSessionDetials.Days == undefined) {
      this.sessionDetailsObj.Days = "";
    }


    this.sessionDetailsObj.Duration = this.NewSessionDetials.Duration;
    if (this.NewSessionDetials.Duration == undefined) {
      this.sessionDetailsObj.Duration = "";
    }

    this.sessionDetailsObj.EndDate = this.NewSessionDetials.EndDate;
    if (this.NewSessionDetials.EndDate == undefined) {
      this.sessionDetailsObj.EndDate = "";
    }

    this.sessionDetailsObj.FinancialYearKey = this.NewSessionDetials.FinancialYearKey;
    if (this.NewSessionDetials.FinancialYearKey == undefined) {
      this.sessionDetailsObj.FinancialYearKey = "";
    }


    this.sessionDetailsObj.GroupSize = this.NewSessionDetials.GroupSize;
    if (this.NewSessionDetials.GroupSize == undefined) {
      this.sessionDetailsObj.GroupSize = "";
    }

    this.sessionDetailsObj.IsExistActivitySubCategory = this.NewSessionDetials.IsExistActivitySubCategory;
    if (this.NewSessionDetials.IsExistActivitySubCategory == undefined) {
      this.sessionDetailsObj.IsExistActivitySubCategory = false;
    }

    this.sessionDetailsObj.IsExistActivityCategory = this.NewSessionDetials.IsExistActivityCategory;
    if (this.NewSessionDetials.IsExistActivityCategory == undefined) {
      this.sessionDetailsObj.IsExistActivityCategory = false;
    }

    this.sessionDetailsObj.IsTerm = this.NewSessionDetials.IsTerm;
    if (this.NewSessionDetials.IsTerm == undefined) {
      this.sessionDetailsObj.IsTerm = false;
    }


    this.sessionDetailsObj.ParentClubKey = this.NewSessionDetials.ParentClubKey;
    if (this.NewSessionDetials.ParentClubKey == undefined) {
      this.sessionDetailsObj.ParentClubKey = "";
    }

    this.sessionDetailsObj.SessionFee = this.NewSessionDetials.SessionFee;
    if (this.NewSessionDetials.SessionFee == undefined) {
      this.sessionDetailsObj.SessionFee = "";
    }

    this.sessionDetailsObj.SessionName = this.NewSessionDetials.SessionName;
    if (this.NewSessionDetials.SessionName == undefined) {
      this.sessionDetailsObj.SessionName = "";
    }

    this.sessionDetailsObj.SessionType = this.NewSessionDetials.SessionType;
    if (this.NewSessionDetials.SessionType == undefined) {
      this.sessionDetailsObj.SessionType = "";
    }

    this.sessionDetailsObj.StartDate = this.NewSessionDetials.StartDate;
    if (this.NewSessionDetials.StartDate == undefined) {
      this.sessionDetailsObj.StartDate = "";
    }

    this.sessionDetailsObj.StartTime = this.NewSessionDetials.StartTime;
    if (this.NewSessionDetials.StartTime == undefined) {
      this.sessionDetailsObj.StartTime = "";
    }

    this.sessionDetailsObj.TermKey = this.NewSessionDetials.TermKey;
    if (this.NewSessionDetials.TermKey == undefined) {
      this.sessionDetailsObj.TermKey = "";
    }

    this.sessionDetailsObj.TotalFeesAmount = this.NewSessionDetials.SessionFee;
    if (this.NewSessionDetials.SessionFee == undefined) {
      this.sessionDetailsObj.TotalFeesAmount = "";
    }

    this.sessionDetailsObj.AmountPaid = "0.00";
    this.sessionDetailsObj.AmountDue = this.NewSessionDetials.SessionFee;
    if (this.NewSessionDetials.SessionFee == undefined) {
      this.sessionDetailsObj.AmountDue = "";
    }

    this.sessionDetailsObj.AmountPayStatus = "Due";
    this.sessionDetailsObj.OtherComments = "";
    this.sessionDetailsObj.IsVerified = false;
    this.sessionDetailsObj.PaidBy = '';
    this.sessionDetailsObj.PayByDate = this.NewSessionDetials.PayByDate;
    if (this.NewSessionDetials.PayByDate == undefined) {
      this.sessionDetailsObj.PayByDate = "";
    }

    this.getMemberListsForEdit();
  }

  remove(member) {

    if (member.AmountPayStatus == "Paid") {
      let message = "You cann't remove the member "
      this.showToast(message, 6000);
    }

    let confirm = this.alertCtrl.create({
      title: 'Remove Member',
      message: 'Are you sure you want to remove the member?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('Disagree clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {


            this.fb.update(member.Key, "/Session/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + this.NewSessionDetials.CoachKey + "/" + this.NewSessionDetials.SessionType + "/" + this.OldSessionDetails.$key + "/Member/", { IsActive: false });
            //initialize all member IsActive false initially in coach folder
            this.fb.update(member.Key, "/Coach/Type2/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.CoachKey + "/Session/" + this.OldSessionDetails.$key + "/Member/", { IsActive: false });
            //initialize all member IsActive false initially in member folder
            this.fb.update(this.OldSessionDetails.$key, "/Member/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + member.Key + "/Session/", { IsActive: false });

            //this.getMemberListsForEdit();
            let message = "selected member removed successfully.";
            this.showToast(message, 6000);
            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }




  update(member) {
    this.navCtrl.push("CoachPaymentDetailsForGroup", { SelectedMember: member, SessionDetails: this.OldSessionDetails });
  }



  getMemberListsForEdit() {
    this.fb.getAll("/Member/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey).subscribe((data) => {

      //this.members = data;
      if (data.length > 0) {
        this.members = [];

        this.members = data;

        for (let i = 0; i < data.length; i++) {
          let age = (new Date().getFullYear() - new Date(this.members[i].DOB).getFullYear());
          //this.members[i].Age = age;
          if (isNaN(age)) {
            this.members[i].Age = "N.A";
          } else {
            this.members[i].Age = age;
          }
          for (let j = 0; j < this.selectedMembersForTheSession.length; j++) {
            if (data[i].$key == this.selectedMembersForTheSession[j].Key && this.selectedMembersForTheSession[j].IsActive) {
              this.members[i].isSelect = true;
              this.members[i].isPaid = (data[i].Session[this.OldSessionDetails.$key].AmountPayStatus == "Paid");
              break;
            }
            else {
              this.members[i].isSelect = false;
              this.members[i].isPaid = false;
            }
          }
        }

        this.allMemebers = this.members;
      }
    });
  }


  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }

  showToast(m: string, howLongToShow: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongToShow,
      position: 'bottom'
    });
    toast.present();
  }





  updateMemberList() {

    let shownError = false;
    this.members = [];
    this.members = this.allMemebers;

    let newSelectedMemberArray = [];
    for (let i = 0; i < this.members.length; i++) {
      if (this.members[i].isSelect) {
        newSelectedMemberArray.push(this.members[i]);
      }
    }



    if (newSelectedMemberArray.length > 0) {
      try {


        for (let count = 0; count < this.selectedMembersForTheSession.length; count++) {
          //initialize all member IsActive false initially in session folder
          this.fb.update(this.selectedMembersForTheSession[count].Key, "/Session/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + this.NewSessionDetials.CoachKey + "/" + this.NewSessionDetials.SessionType + "/" + this.OldSessionDetails.$key + "/Member/", { IsActive: false });

          //initialize all member IsActive false initially in coach folder
          this.fb.update(this.selectedMembersForTheSession[count].Key, "/Coach/Type2/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.CoachKey + "/Session/" + this.OldSessionDetails.$key + "/Member/", { IsActive: false });

          //initialize all member IsActive false initially in member folder
          this.fb.update(this.OldSessionDetails.$key, "/Member/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + this.selectedMembersForTheSession[count].Key + "/Session/", { IsActive: false });
        }

      } catch (ex) {
        this.showToast(ex.message, 5000);
        shownError = true;
      }
      let isExcute = false
      let count = 0;


      for (count = 0; count < newSelectedMemberArray.length; count++) {
        try {
          for (let loop = 0; loop < this.selectedMembersForTheSession.length; loop++) {
            if (newSelectedMemberArray[count].$key == this.selectedMembersForTheSession[loop].Key) {

              //initialize all member IsActive false initially in session folder
              this.fb.update(newSelectedMemberArray[count].$key, "/Session/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + this.NewSessionDetials.CoachKey + "/" + this.NewSessionDetials.SessionType + "/" + this.OldSessionDetails.$key + "/Member/", { IsActive: true });

              //initialize all member IsActive false initially in coach folder
              this.fb.update(newSelectedMemberArray[count].$key, "/Coach/Type2/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.CoachKey + "/Session/" + this.OldSessionDetails.$key + "/Member/", { IsActive: true });

              //initialize all member IsActive false initially in member folder
              this.fb.update(this.OldSessionDetails.$key, "/Member/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + newSelectedMemberArray[count].$key + "/Session/", { IsActive: true });

              isExcute = true;
              break;


            }
          }
        } catch (ex) {
          this.showToast(ex.message, 5000);
          shownError = true;
        }
        if (!isExcute) {

          this.memberDetailsObj.IsActive = true;
          this.memberDetailsObj.ClubKey = this.NewSessionDetials.ClubKey;
          if (this.NewSessionDetials.ClubKey == undefined) {
            this.memberDetailsObj.ClubKey = "";
          }
          this.memberDetailsObj.DOB = newSelectedMemberArray[count].DOB;
          if (newSelectedMemberArray[count].DOB == undefined) {
            this.memberDetailsObj.DOB = "";
          }

          this.memberDetailsObj.EmailID = newSelectedMemberArray[count].EmailID;
          if (newSelectedMemberArray[count].EmailID == undefined) {
            this.memberDetailsObj.EmailID = "";
          }


          this.memberDetailsObj.EmergencyContactName = newSelectedMemberArray[count].EmergencyContactName;
          if (newSelectedMemberArray[count].EmergencyContactName == undefined) {
            this.memberDetailsObj.EmergencyContactName = "";
          }

          this.memberDetailsObj.EmergencyNumber = newSelectedMemberArray[count].EmergencyNumber;
          if (newSelectedMemberArray[count].EmergencyNumber == undefined) {
            this.memberDetailsObj.EmergencyNumber = "";
          }

          this.memberDetailsObj.FirstName = newSelectedMemberArray[count].FirstName;
          if (newSelectedMemberArray[count].FirstName == undefined) {
            this.memberDetailsObj.FirstName = "";
          }

          this.memberDetailsObj.Gender = newSelectedMemberArray[count].Gender;
          if (newSelectedMemberArray[count].Gender == undefined) {
            this.memberDetailsObj.Gender = "";
          }



          this.memberDetailsObj.IsChild = newSelectedMemberArray[count].IsChild;
          if (newSelectedMemberArray[count].IsChild == undefined) {
            this.memberDetailsObj.IsChild = false;
          }


          this.memberDetailsObj.LastName = newSelectedMemberArray[count].LastName;
          if (newSelectedMemberArray[count].LastName == undefined) {
            this.memberDetailsObj.LastName = "";
          }


          this.memberDetailsObj.MedicalCondition = newSelectedMemberArray[count].MedicalCondition;
          if (newSelectedMemberArray[count].MedicalCondition == undefined) {
            this.memberDetailsObj.MedicalCondition = "";
          }

          this.memberDetailsObj.ParentClubKey = newSelectedMemberArray[count].ParentClubKey;
          if (newSelectedMemberArray[count].ParentClubKey == undefined) {
            this.memberDetailsObj.ParentClubKey = "";
          }

          this.memberDetailsObj.ParentKey = newSelectedMemberArray[count].ParentKey;
          if (newSelectedMemberArray[count].ParentKey == undefined) {
            this.memberDetailsObj.ParentKey = "";
          }
          this.memberDetailsObj.Password = newSelectedMemberArray[count].Password;
          if (newSelectedMemberArray[count].Password == undefined) {
            this.memberDetailsObj.Password = "";
          }

          this.memberDetailsObj.PhoneNumber = newSelectedMemberArray[count].PhoneNumber;
          if (newSelectedMemberArray[count].PhoneNumber == undefined) {
            this.memberDetailsObj.PhoneNumber = "";
          }

          this.memberDetailsObj.Source = newSelectedMemberArray[count].Source;
          if (newSelectedMemberArray[count].Source == undefined) {
            this.memberDetailsObj.Source = "";
          }

          this.memberDetailsObj.TotalFeesAmount = this.NewSessionDetials.SessionFee;
          if (this.NewSessionDetials.SessionFee == undefined) {
            this.memberDetailsObj.TotalFeesAmount = "";
          }

          this.memberDetailsObj.AmountPaid = "0.00";
          this.memberDetailsObj.AmountDue = this.NewSessionDetials.SessionFee;
          if (this.NewSessionDetials.SessionFee == undefined) {
            this.memberDetailsObj.AmountDue = "";
          }

          this.memberDetailsObj.AmountPayStatus = "Due";
          this.memberDetailsObj.OtherComments = "";
          this.memberDetailsObj.IsVerified = false;
          this.memberDetailsObj.PaidBy = '';
          this.memberDetailsObj.PayByDate = this.NewSessionDetials.PayByDate;
          if (this.NewSessionDetials.PayByDate == undefined) {
            this.memberDetailsObj.PayByDate = "";
          }

          try {
            //keep new selected member details in session folder
            this.fb.update(newSelectedMemberArray[count].$key, "/Session/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + this.NewSessionDetials.CoachKey + "/" + this.NewSessionDetials.SessionType + "/" + this.OldSessionDetails.$key + "/Member/", this.memberDetailsObj);

            //keep new selected member details in coach folder
            this.fb.update(newSelectedMemberArray[count].$key, "/Coach/Type2/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.CoachKey + "/Session/" + this.OldSessionDetails.$key + "/Member/", this.memberDetailsObj);

            //keep new session in newselected  member  folder
            this.fb.update(this.OldSessionDetails.$key, "/Member/" + this.NewSessionDetials.ParentClubKey + "/" + this.NewSessionDetials.ClubKey + "/" + newSelectedMemberArray[count].$key + "/Session/", this.sessionDetailsObj);
          } catch (ex) {
            this.showToast(ex.message, 5000);
            shownError = true;
          }
        }

        isExcute = false;

      }

      //  this.navCtrl.pop();
      if (!shownError) {
        let message = "Member(s) for the session updated successfully";
        this.showToast(message, 6000);
      }
      this.navCtrl.pop();
      this.selectedMembersForTheSession = [];
      newSelectedMemberArray = [];
    }
    else {
      let message = "Please Select atleast one member for the session creation.";
      this.showToast(message, 3000);
      shownError = false;
    }






  }


  initializeItems() {
    this.members = this.allMemebers;
  }

  getFilterItems(ev: any) {
    // Reset items back to all of the items
    this.initializeItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.members = this.members.filter((item) => {
        return (item.LastName.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
  presentActionSheet(memberDetails) {
    let actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Update',
          handler: () => {
            console.log('Destructive clicked');
          }
        },
        {
          text: 'Notify',
          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Email',
          handler: () => {
            console.log('Archive clicked');
          }
        },{
          text: 'Call',
          handler: () => {
           this.call(memberDetails);
          }
        },
        {
          text: 'Performance',
          handler: () => {
            console.log('memberDetails');
            let x= this.fb.getAllWithQuery('Performance/'+this.sessionDetailsObj.ParentClubKey+"/"+this.sessionDetailsObj.CoachKey,{orderByChild:"MemberKey",equalTo:memberDetails.Key}).subscribe((data) => {
           
              this.navCtrl.push("CoachratinghistoryPage",{
                sessionDetails:this.NewSessionDetials,
                member:memberDetails
              });
              x.unsubscribe();
            });
          }
        },
        {
          text: 'Session Notes',
          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Remove',
          handler: () => {
            console.log('Archive clicked');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
 
    actionSheet.present();
  }

  goToDashboardMenuPage() {
    this.navCtrl.setRoot("Dashboard");
  }
  call(info){
    console.log(info); 
    this.loading = this.loadingCtrl.create({
        content: 'Please wait...'
      });
      this.loading.present().then(() => {
        if(info.ParentKey == "" || info.ParentKey == undefined){
            if (this.callNumber.isCallSupported()) {
                this.callNumber.callNumber(info.PhoneNumber, true)
                  .then(() => console.log())
                  .catch(() => console.log());
              } else {
                this.showToast("Your device is not supporting to lunch call dialer.", 3000);
          
              }
        }else{
            this.fb.getAllWithQuery("Member/"+info.ParentClubKey+"/"+info.ClubKey,{orderByKey:true,equalTo:info.ParentKey}).subscribe((data) =>{
                if (this.callNumber.isCallSupported()) {
                    this.callNumber.callNumber(data[0].PhoneNumber, true)
                      .then(() => console.log())
                      .catch(() => console.log());
                  } else {
                    this.showToast("Your device is not supporting to lunch call dialer.", 3000);
              
                  }
            })
        }
        this.loading.dismiss().catch(() => { });
      });
    

}
}
