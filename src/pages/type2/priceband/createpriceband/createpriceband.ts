import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController, PopoverController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as $ from 'jquery';
import { AlertController } from 'ionic-angular';
/**
 * Generated class for the CreatepricebandPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createpriceband',
  templateUrl: 'createpriceband.html',
})
export class CreatepricebandPage {

  themeType: number;
  parentClubKey: string;
  menus: Array<{ DisplayTitle: string; 
    OriginalTitle:string;
    MobComponent: string;
    WebComponent: string; 
    MobIcon:string;
    MobLocalImage: string;
    MobCloudImage: string; 
    WebLocalImage: string;
    WebCloudImage:string;
    WebIcon:string;
    MobileAccess:boolean;
    WebAccess:boolean;
    Role: number;
    Type: number;
    Level: number }>;
  responseDetails: any;
  responseDetails1: any;
  selectedClub: any = "";
  allClub: any;
  allActivityArr = [];
  PriceBand = {
      ActivityDuration:'',
      ActivityKey:'',
      ActivityName:'',
      PriceBandName: '',
      ClubKey:'',
      ClubName:'',
      CourtType: 'Outdoor',
      Status:true,
      Comments: '',
      Days:'',
      IsActive:'True',
      IsEnable:'True',
      CreatedDate:'',
      UpdatedDate:'',
      DurationForMember:'',
      CostForMemberBetweenDuration:'',
      CostForMemberAfterDuration:'',
      DurationForNonMember:'',
      CostForNonMemberBetweenDuration:'',
      CostForNonMemberAfterDuration:'',
      CostForGuestBetweenDuration:'',
      CostForGuestAfterDuration:'',
  }
  selectedActivity:any = "";




  isActivityCategoryExist = false;
  isSelectMon = false;
  isSelectTue = false;
  isSelectWed = false;
  isSelectThu = false;
  isSelectFri = false;
  isSelectSat = false;
  isSelectSun = false;
  isExistActivitySubCategory: boolean;
  activitySubCategoryList = [];
  acType: any;
  days = [];
  showTime = false;
  selday = "";
  startTime = ['06:00','06:00','06:00','06:00','06:00','06:00','06:00'];
  endTime = ['21:00','21:00','21:00','21:00','21:00','21:00','21:00'];
  alldays=['Mon','Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  isShowTime = [false,false,false,false,false,false,false];
  dayIndex:number = 0;



  currencyDetails:any = "";
  Isupdatecome: boolean = false;
  constructor(private alertCtrl: AlertController,public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
      public navCtrl: NavController, public sharedservice: SharedServices,
      public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

      this.themeType = sharedservice.getThemeType();
      this.menus = sharedservice.getMenuList();
      this.PriceBand = this.navParams.get('pricebandDetails')
      
       if(this.PriceBand != undefined){
        let startTime = this.PriceBand['StartTime'].split(',')
        let endTime = this.PriceBand['EndTime'].split(',')
        console.log( this.PriceBand)
        this.Isupdatecome = true; 
        let dayList = this.PriceBand.Days.split(',')
        for(var i=0; i<dayList.length ; i++){
          //this.selectDays(dayList[i],i+1)
          this.alldays.forEach((day, index) =>{
            if(day == dayList[i]){
              this.isShowTime[index] = true
              this.startTime[index] = startTime[i]
              this.endTime[index] = endTime[i]
            }
          })
        }
      }else{
        this.PriceBand = {
          ActivityDuration:'', ActivityKey:'',ActivityName:'',PriceBandName: '',ClubKey:'',ClubName:'',CourtType: 'Outdoor',Status:true,
          Comments: '',Days:'',IsActive:'True',IsEnable:'True',CreatedDate:'', UpdatedDate:'', DurationForMember:'',
          CostForMemberBetweenDuration:'', CostForMemberAfterDuration:'', CostForGuestBetweenDuration:'', CostForGuestAfterDuration:'',DurationForNonMember:'', CostForNonMemberBetweenDuration:'',CostForNonMemberAfterDuration:'',
      }
      }  
      
     storage.get('Currency').then((val) => {
        this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
      storage.get('userObj').then((val) => {
          val = JSON.parse(val);
          for (let club of val.UserInfo)
              if (val.$key != "") {
                  this.parentClubKey = club.ParentClubKey;
                  this.getClubList();

              }
      })
  }



  presentPopover(myEvent) {
      let popover = this.popoverCtrl.create("PopoverPage");
      popover.present({
          ev: myEvent
      });
  }

  goToDashboardMenuPage() {
      this.navCtrl.setRoot("Dashboard");
  }
  getClubList() {  
      this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
          //alert();
          if (data.length > 0) {
              this.allClub = data;
              let key = data[0].$key;
              if(this.Isupdatecome){
                this.selectedClub = this.PriceBand.ClubKey
              }else{
                this.selectedClub = key;
              }
              
               //this.getAllMemberCategory();
               this.getAllActivity();
          }
        
      })
  }
  getAllActivity() {
      this.fb.getAll("/Activity/" + this.parentClubKey + "/" + this.selectedClub + "/").subscribe((data) => {
          this.allActivityArr = [];
          this.PriceBand.ActivityDuration = "";
          if (data.length > 0) {
              this.allActivityArr = data;
              this.selectedActivity = this.PriceBand.ActivityKey;
              this.checkAvailability();
             
           }
         
      });
  }
  checkAvailability(){
    this.fb.getAllWithQuery("StandardCode/BookingSetup/"+this.parentClubKey+"/"+this.selectedActivity,{orderByChild:'ClubKey',equalTo:this.selectedClub}).subscribe((data2) =>{
      this.PriceBand.ActivityDuration = "";
      for(let j = 0 ; j < data2.length ;j++){
        if(data2[j].IsActive != false){
         this.PriceBand.ActivityDuration = data2[0].CourtDuration; 
        }
      }
     })
  }
  // saveCourtSetup() {
  //     console.log(this.courtDetails);
  //     this.responseDetails = this.fb.saveReturningKey("/Court/" + this.parentClubKey + "/" + this.selectedClub + "/" + this.selectedActivity +"/", this.courtDetails);
  //     if (this.responseDetails != undefined) {
  //         let message = "Successfully Saved";
  //         this.showToast(message, 3000);
  //         this.navCtrl.pop();
  //     }
  // }

  cancelCourtSetup() {
      this.navCtrl.pop();
  }

  savePriceBand(){
    this.PriceBand.Days = "";
    //this.days.sort();
    // for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) { 
    //   switch (this.days[daysIndex]) {
    //     case 1:
    //       this.selectedDayDetails("Mon");
    //       break;
    //     case 2:
    //       this.selectedDayDetails("Tue");
    //       break;
    //     case 3:
    //       this.selectedDayDetails("Wed");
    //       break;
    //     case 4:
    //       this.selectedDayDetails("Thu");
    //       break;
    //     case 5:
    //       this.selectedDayDetails("Fri");
    //       break;
    //     case 6:
    //       this.selectedDayDetails("Sat");
    //       break;
    //     case 7:
    //       this.selectedDayDetails("Sun");
    //       break;
    //   }
    // }
    let startDays = "";
    let endDays = "";
    for(let i = 0 ; i < this.startTime.length;i++){
      if(this.isShowTime[i]== true){
        this.PriceBand.Days += this.alldays[i]+",";
        startDays = startDays+this.startTime[i]+",";
        endDays = endDays+this.endTime[i]+",";
      }
    }
    this.PriceBand.Days = this.PriceBand.Days.substr(0, this.PriceBand.Days.length - 1)
    this.PriceBand["StartTime"] = startDays;
    this.PriceBand["EndTime"] = endDays;
    this.PriceBand.ActivityKey = this.selectedActivity; 
    this.PriceBand.ClubKey = this.selectedClub;
    for(let i = 0; i < this.allActivityArr.length;i++){
      if(this.allActivityArr[i].$key == this.PriceBand.ActivityKey){
        this.PriceBand.ActivityName = this.allActivityArr[i].ActivityName;
      }
    }
    for(let i = 0; i < this.allClub.length;i++){
      if(this.allClub[i].$key == this.PriceBand.ClubKey){
        this.PriceBand.ClubName = this.allClub[i].ClubName;
      }
    }
    this.PriceBand.CreatedDate = <string>new Date().getTime().toString();
    this.PriceBand.UpdatedDate = <string>new Date().getTime().toString();
    console.log(this.PriceBand);
   if(this.PriceBand.PriceBandName !="" && this.PriceBand.CostForMemberAfterDuration != "" && this.PriceBand.CostForMemberBetweenDuration != "" && this.PriceBand.CostForNonMemberAfterDuration != "" && this.PriceBand.CostForNonMemberBetweenDuration != ""){
    this.fb.save(this.PriceBand,"StandardCode/PriceBand/"+this.parentClubKey+"/"+this.PriceBand.ActivityKey);
    this.navCtrl.pop()
   }else{
     this.showToast("Enter Valid Details",3000);
   }
    
  }

  selectedDayDetails(day) {

    if (this.PriceBand.Days == "") {
      this.PriceBand.Days += day;
    }
    else {
      this.PriceBand.Days += "," + day;
    }
  }
  
  presentConfirm() {
    let alert = this.alertCtrl.create({
      title: 'Are you sure',
      message: 'Do you want to save?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
           
          }
        },
        {
          text: 'Continue',
          handler: () => {
            this.savePriceBand()
          }
        }
      ]
    });
    alert.present();
  }
  
  selectDays(day, index) {
    let isPresent = false;
    this.dayIndex = index-1;
        this.selday = day;
        if(this.isShowTime[index-1] == true){
            this.showTime = false;
            this.isShowTime[index-1] = false;

        }else if(this.isShowTime[index-1] == false){
            this.showTime = true;
            this.isShowTime[index-1] = true;
            
        }
    switch (day) {
      case "Mon":
        this.isSelectMon = !this.isSelectMon;
        break;
      case "Tue":
        this.isSelectTue = !this.isSelectTue;
        break;
      case "Wed":
        this.isSelectWed = !this.isSelectWed;
        break;
      case "Thu":
        this.isSelectThu = !this.isSelectThu;
        break;
      case "Fri":
        this.isSelectFri = !this.isSelectFri;
        break;
      case "Sat":
        this.isSelectSat = !this.isSelectSat;
        break;
      case "Sun":
        this.isSelectSun = !this.isSelectSun;
        break;
    }

    for (let i = 0; i < this.days.length; i++) {
      if (this.days[i] == index) {
        this.days.splice(i, 1);
        isPresent = true;
      }
    }
    if (!isPresent) {
      this.days.push(index);
    }

  }

  updatePriceBand(){
    console.log(this.PriceBand)
    this.PriceBand.Days = "";
    // this.days.sort();
    // for (let daysIndex = 0; daysIndex < this.days.length; daysIndex++) { 

    //   switch (this.days[daysIndex]) {
    //     case 1:
    //       this.selectedDayDetails("Mon");
    //       break;
    //     case 2:
    //       this.selectedDayDetails("Tue");
    //       break;
    //     case 3:
    //       this.selectedDayDetails("Wed");
    //       break;
    //     case 4:
    //       this.selectedDayDetails("Thu");
    //       break;
    //     case 5:
    //       this.selectedDayDetails("Fri");
    //       break;
    //     case 6:
    //       this.selectedDayDetails("Sat");
    //       break;
    //     case 7:
    //       this.selectedDayDetails("Sun");
    //       break;
    //   }
    // }
    let startDays = "";
    let endDays = "";
    for(let i = 0 ; i < this.startTime.length;i++){
      if(this.isShowTime[i]== true){
        this.PriceBand.Days += this.alldays[i]+",";
        startDays = startDays+this.startTime[i]+",";
        endDays = endDays+this.endTime[i]+",";
      }
    }
    this.PriceBand.Days = this.PriceBand.Days.substr(0, this.PriceBand.Days.length - 1)
    this.PriceBand["StartTime"] = startDays;
    this.PriceBand["EndTime"] = endDays;
    this.PriceBand.ActivityKey = this.selectedActivity; 
    this.PriceBand.ClubKey = this.selectedClub;
    for(let i = 0; i < this.allActivityArr.length;i++){
      if(this.allActivityArr[i].$key == this.PriceBand.ActivityKey){
        this.PriceBand.ActivityName = this.allActivityArr[i].ActivityName;
      }
    }
    for(let i = 0; i < this.allClub.length;i++){
      if(this.allClub[i].$key == this.PriceBand.ClubKey){
        this.PriceBand.ClubName = this.allClub[i].ClubName;  
      }
    }
    this.PriceBand.UpdatedDate = <string>new Date().getTime().toString();
    if(this.PriceBand.PriceBandName !="" && this.PriceBand.CostForMemberAfterDuration != "" && this.PriceBand.CostForMemberBetweenDuration != "" && this.PriceBand.CostForNonMemberAfterDuration != "" && this.PriceBand.CostForNonMemberBetweenDuration != ""){
      let key = this.PriceBand['$key']
      delete this.PriceBand['$key']
      this.fb.update(key,"StandardCode/PriceBand/"+this.parentClubKey+"/"+this.PriceBand.ActivityKey, this.PriceBand);
      this.navCtrl.pop()
     }else{
       this.showToast("Enter Valid Details",3000);
     }
  }

  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
        message: m,
        duration: howLongShow,
        position: 'bottom'
    });
    toast.present();
}
}
