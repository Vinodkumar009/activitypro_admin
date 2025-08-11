
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import * as $ from "jquery";
import { HttpClient } from '@angular/common/http';

import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import { SharedServices } from '../../../../services/sharedservice';
import { FirebaseService } from '../../../../../services/firebase.service';
import { CommonService } from '../../../../../services/common.service';


/**
 * Generated class for the AddrecuringbookingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
 
@IonicPage()
@Component({
  selector: 'page-addrecuringbooking',
  templateUrl: 'addrecuringbooking.html',
})
export class AddrecuringbookingPage {

  selectedParentClubKey:any = "";
  selectedClubKey:any = "";
  memberKey:any;
  currencyDetails:any = "";
  slotsType:boolean = false;loading: any;
  userkey: any;
  nestUrl: any;
  roletype: any;
;
  clubs = [];
  courts = [];
  ActivityList = [];
  selectedActivity = "";
  selectedCourt = "";



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
  dayIndex:any = 0;
  recuringObj = new Recuring();

  minDate = "";
  maxDate = "";
  pastSlots:any = [];
  slots:any = [];
  upCommingSlots:any = [];
  daysDetails:Set<string> = new Set<string>();
  cancelSlots:any = [];
  purposeList = [
    'Coaching Session',
    'Member Session',
    'Special Event',  
    'Sports Day',
    'Tournament',
    'Junior Coaching',
    'Club Tennis',
    'Reserved',
    'Others',
    'Add Purpose'
  ]
  minuteValues:any = "00,";

  constructor(public navCtrl: NavController, public loadingCtrl: LoadingController, public http: HttpClient,public navParams: NavParams,public storage: Storage,public fb: FirebaseService,public commonService: CommonService,public alertCtrl: AlertController,public sharedService: SharedServices,public toastCtrl:ToastController) {
    this.minDate = (((new Date().getFullYear()))).toString();
    this.maxDate = (((new Date().getFullYear()) + 10) + "-" + 12 + "-" + 31).toString();
    
  }
 
  ionViewDidLoad() {
    let temp = "";
    for(let i = 1 ; i < 60 ; i++){
      if(i % 5 == 0){
        if(String(i).length == 1){
          temp = "0" + i;
          this.minuteValues += temp + ",";
        }else{
          this.minuteValues += i+",";
        }
       
      }
    }
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      this.userkey = val.$key;
      
      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        this.selectedClubKey = user.ClubKey;
        this.memberKey = user.MemberKey;
        this.nestUrl = this.sharedService.getnestURL()
        this.getClubDetails();
      
        break;
      }
    }).catch(error => {

    });
    this.storage.get('Currency').then((val) => {
      this.currencyDetails = JSON.parse(val);
    }).catch(error => {
    });
    this.storage.get('memberType').then((val) => {
      this.roletype = val
    }).catch(error => {
    });
    
  }

  getClubDetails() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (data.length != 0) {
        this.selectedClubKey = this.clubs[0].$key;
        this.getAllActivity();
        try {


         // this.getClubMmebers(this.selectedClubKey);
        }
        catch (ex) {

        } finally {
          //this.loading.dismiss().catch(() => { });
        }
      }
    });
  }
  getAllActivity() {
    this.fb.getAll("/Activity/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/").subscribe((data) => {
        this.ActivityList = [];
        this.selectedActivity = "";
        if (data.length > 0) {
            this.ActivityList = data;
            this.selectedActivity = this.ActivityList[0].$key;
        }
        this.getAllCourts();
    });
}
  getAllCourts(){
    this.fb.getAllWithQuery("Court/"+this.selectedParentClubKey+"/"+this.selectedClubKey+"/"+this.selectedActivity,{orderByChild:'IsActive',equalTo:true}).subscribe((data) =>{
     this.courts = [];
     this.selectedCourt = "";
     if(data.length > 0){
        this.courts = data;
        this.selectedCourt = this.courts[0].$key;
      }
    });
  }
  getTime(time){
    return moment(Number(time)).format('D-MMM');;
  }
  addRecuringBooking(){
    this.navCtrl.push("AddrecuringbookingPage");
  }
  
  selectedDayDetails(day) {

    if (this.recuringObj.BookingDays == "") {
      this.recuringObj.BookingDays += day;
    }
    else {
      this.recuringObj.BookingDays += "," + day;
    }
  }
  selectDays(day, index) {
    if(this.daysDetails.has(day)){
      this.daysDetails.delete(day);
    }else{
      this.daysDetails.add(day);
    }
  }
  save(){
    let checkAvailableFlag = true;
    //Comment START(08-09-2022):no need to chack the overlap in the firebase,it's too slow as it's checking entire history

    // for(let i = 0 ; i < this.upCommingSlots.length ;i++){
    //   let day = moment(Number(this.upCommingSlots[i].Date)).format("ddd");
    //   if(this.daysDetails.has(day)){
    //     let recuringStartHour = Number(this.recuringObj.StartTime.split(":")[0]);
    //     let recuringStartMin = Number(this.recuringObj.StartTime.split(":")[1]);
    //     let recuringEndHour = Number(this.recuringObj.EndTime.split(":")[0]);
    //     let recuringEndMin = Number(this.recuringObj.EndTime.split(":")[1]);
    //     let slotObjStartHour = Number(this.upCommingSlots[i].StartHour);
    //     let slotObjStartMin = Number(this.upCommingSlots[i].StartMin);
    //     let slotObjEndHour = Number(this.upCommingSlots[i].EndHour);
    //     let slotObjEndMin = Number(this.upCommingSlots[i].EndMin);
    //     if(recuringStartHour <= slotObjStartHour && recuringEndHour >= slotObjEndHour){
    //       checkAvailableFlag = false;
    //       break;
    //     }else if(recuringStartHour == slotObjStartHour){
    //       if(recuringStartMin < slotObjStartMin){
    //         checkAvailableFlag = false;
    //         break;
    //       }else if(recuringStartMin == slotObjStartMin ){
    //         checkAvailableFlag = false;
    //         break;
    //       }
    //     }else if(recuringEndHour == slotObjEndHour){
    //       if(recuringEndMin > recuringEndMin){
    //         checkAvailableFlag = false;
    //         break;
    //       }else if(recuringEndMin == slotObjEndMin ){
    //         checkAvailableFlag = false;
    //         break;
    //       }
    //     }else if(recuringStartHour >= slotObjStartHour  && recuringEndHour >= slotObjEndHour){
    //       checkAvailableFlag = false;
    //       break;
    //     }else if(recuringEndHour >= slotObjStartHour && recuringEndHour >slotObjEndHour){
    //       checkAvailableFlag = false;
    //       break;
    //     }else{
    //       checkAvailableFlag = true;
    //     }
        
    //   }
    // }
    //Comment END:it's too slow as it's checking entire history
    // if(!checkAvailableFlag){
    //   this.showConfirm();
    // }else{
    //   this.getOthers();
    // }
    this.showConfirm();
  }
  async getOthers(){
    if(this.selectedCourt == 'all'){
      this.recuringObj.ParentClubKey = this.selectedParentClubKey;
      this.recuringObj.ActivityKey = this.selectedActivity;
      this.recuringObj.ClubKey = this.selectedClubKey;
      for(let i = 0; i < this.ActivityList.length;i++){
        if(this.ActivityList[i].$key ==  this.recuringObj.ActivityKey){
          this.recuringObj.ActivityName = this.ActivityList[i].ActivityName;
      }
    }
      for(let i = 0; i < this.clubs.length;i++){
        if(this.clubs[i].$key == this.recuringObj.ClubKey){
          this.recuringObj.ClubName = this.clubs[i].ClubName;
        }
      }
     
      for(let i = 0 ; i < this.courts.length ; i++){
        this.recuringObj.CourtKey = this.courts[i].$key;
        for(let j = 0; j < this.courts.length;j++){
          if(this.courts[j].$key ==  this.recuringObj.CourtKey){
            this.recuringObj.CourtName = this.courts[j].CourtName;
          }
        }
        let key = this.fb.save(this.recuringObj,"CourtBooking/RecuringBooking/"+this.recuringObj.ParentClubKey+"/"+this.recuringObj.ClubKey+"/"+this.recuringObj.ActivityKey);
        await this.createslots(key)
        }
        this.saveInDB();
    }else{
      this.recuringObj.ParentClubKey = this.selectedParentClubKey;
    this.recuringObj.ActivityKey = this.selectedActivity;
    this.recuringObj.ClubKey = this.selectedClubKey;
    this.recuringObj.CourtKey = this.selectedCourt;
    for(let i = 0; i < this.ActivityList.length;i++){
      if(this.ActivityList[i].$key ==  this.recuringObj.ActivityKey){
        this.recuringObj.ActivityName = this.ActivityList[i].ActivityName;
      }
    }
    for(let i = 0; i < this.clubs.length;i++){
      if(this.clubs[i].$key == this.recuringObj.ClubKey){
        this.recuringObj.ClubName = this.clubs[i].ClubName;
      }
    }
    for(let i = 0; i < this.courts.length;i++){
      if(this.courts[i].$key ==  this.recuringObj.CourtKey){
        this.recuringObj.CourtName = this.courts[i].CourtName;
      }
    }
   
    let key = this.fb.save(this.recuringObj,"CourtBooking/RecuringBooking/"+this.recuringObj.ParentClubKey+"/"+this.recuringObj.ClubKey+"/"+this.recuringObj.ActivityKey);
    this.commonService.showLoader()
    await this.createslots(key)
    this.saveInDB();
    }
  }
  getAllCourtDetails(){
    //Comment START(08-09-2022):no need to chack the overlap in the firebase,it's too slow as it's checking entire history
    // let x = this.fb.getAllWithQuery("CourtBooking/ParentClub/"+this.selectedParentClubKey,{orderByKey:true,equalTo:this.selectedCourt}).subscribe((data) =>{
    //  this.slots = [];
    //   for(let i = 0; i < data.length ;i++){
    //     if(data[i].SlotsTime != undefined){
    //       if(data[i].SlotsTime.length == undefined){
    //         data[i].SlotsTime = this.commonService.convertFbObjectToArray(data[i].SlotsTime);
    //         for(let j = 0 ; j < data[i].SlotsTime.length ; j++){
    //           if(data[i]["SlotsTime"][j]["Slots"] != undefined){
    //             data[i]["SlotsTime"][j]["Slots"] = this.commonService.convertFbObjectToArray( data[i]["SlotsTime"][j]["Slots"]);
    //             for(let k = 0; k < data[i]["SlotsTime"][j]["Slots"].length ;k++){
    //               data[i]["SlotsTime"][j]["Slots"][k]["Member"] = this.commonService.convertFbObjectToArray(data[i]["SlotsTime"][j]["Slots"][k]["Member"]);
    //               for(let n = 0; n < data[i]["SlotsTime"][j]["Slots"][k]["Member"].length ; n++){
    //                 data[i]["SlotsTime"][j]["Slots"][k]["SlotInfo"] = this.commonService.convertFbObjectToArray( data[i]["SlotsTime"][j]["Slots"][k]["SlotInfo"]);
    //                 for(let l = 0 ; l < data[i]["SlotsTime"][j]["Slots"][k]["SlotInfo"].length ; l++){
    //                   data[i]["SlotsTime"][j]["Slots"][k]["SlotInfo"][l]["MemberName"] = data[i]["SlotsTime"][j]["Slots"][k]["Member"][0];
    //                   let tempData = JSON.parse(JSON.stringify(data[i]));
    //                   let key = data[i].$key;
    //                   delete tempData["SlotsTime"];
    //                   delete tempData["$key"];
    //                   tempData["CourtKey"] = key;
    //                   let slotObj = JSON.parse(JSON.stringify(data[i]["SlotsTime"][j]["Slots"][k]["SlotInfo"][l]));
    //                   slotObj.Price = parseFloat(slotObj.Price ).toFixed(2);
    //                   slotObj["Slotkey"] = data[i]["SlotsTime"][j]["Slots"][k]["Key"];
    //                   slotObj["SlotInfoKey"] = data[i]["SlotsTime"][j]["Slots"][k]["SlotInfo"][l]["Key"];
    //                   slotObj["CourtInfo"] = tempData;
    //                   slotObj["Date"] = data[i].SlotsTime[j].Key;
    //                   this.slots.push(slotObj);
    //               }
    //               }
    //             }
    //           }
    //         }
            
    //       }
    //     }
    //   }
     
    //   this.getSortedSlots();
    //   x.unsubscribe();
    // });
    //Comment END(08-09-2022):no need to chack the overlap in the firebase,it's too slow as it's checking entire history
    this.getSortedSlots();
  }

  createslots(key){
    return new Promise((resolve, reject) =>{
      this.http.put(`${this.nestUrl}/courtbooking/createrecurring_v3?activitykey=${this.selectedActivity}&clubkey=${this.selectedClubKey}&parentclubkey=${this.selectedParentClubKey}&recurringkey=${key}&userkey=${this.userkey}&membertype=${this.roletype}`, null).subscribe((res) => {
        resolve('success')
        this.commonService.hideLoader()
      },
        err => {
          console.log(err)
          this.commonService.hideLoader() 
          this.commonService.toastMessage("Unable to create recurring slot", 2000)
          reject('fail')
        })

    })
  }

  getSortedSlots(){
    //Comment START(08-09-2022):no need to chack the overlap in the firebase,it's too slow as it's checking entire history
    // this.pastSlots = [];
    // this.upCommingSlots = [];
    // for(let i = 0; i < this.slots.length ; i++){
    //   if(String(this.slots[i].EndMin).length < 2){
    //     this.slots[i].EndMin = 0+""+this.slots[i].EndMin;
    //   }
    //   if(String(this.slots[i].StartMin).length < 2){
    //     this.slots[i].StartMin = 0+""+this.slots[i].StartMin;
    //   }
    //   let bookDay  = moment(Number(this.slots[i].Date)).format("D");
    //   let bookMonth  = moment(Number(this.slots[i].Date)).format("MM");
    //   let bookHour = moment(Number(this.slots[i].Date)).format("h");
    //   let todayDay = moment().format("D");
    //   let todayMonth = moment().format("MM");
    //   let noWHour =  moment().format("h");
    //   if(Number(bookMonth) < Number(todayMonth)){
    //     this.pastSlots.push(this.slots[i])
    //   }else if(Number(bookMonth) == Number(todayMonth) && Number(todayDay) > Number(bookDay)){
    //     this.pastSlots.push(this.slots[i]);
    //   }else if(Number(bookMonth) == Number(todayMonth) && Number(todayDay) == Number(bookDay) && noWHour > bookHour){
    //     this.pastSlots.push(this.slots[i]);
    //   } else{
    //     this.upCommingSlots.push(this.slots[i]);
    //   }
    // }
    //Comment END(08-09-2022):no need to chack the overlap in the firebase,it's too slow as it's checking entire history
    this.save()
    console.log(this.upCommingSlots);
  }
  showConfirm() {
    const confirm = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Some of the already booked slots might be overridden.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {
            this.getOthers();
          }
        }
      ]
    });
    confirm.present();
  }
  saveInDB(){
    this.showToast('Successfully Saved...',2000);
    this.navCtrl.pop();
  }
  showToast(m: string, howLongShow: number) {
    let toast = this.toastCtrl.create({
        message: m,
        duration: howLongShow,
        position: 'bottom'
    });
    toast.present();
  }
  validate(){
    this.recuringObj.BookingDays = "";
    this.daysDetails.forEach((day) =>{
      this.recuringObj.BookingDays = this.recuringObj.BookingDays+day+","
     });
    
    if(this.recuringObj.BookingDays && this.recuringObj.EndDate && this.recuringObj.StartTime
      && this.recuringObj.StartDate && this.recuringObj.BookingFor){
        this.getAllCourtDetails();
    }else{
      this.showToast("Please enter all fields",2000);
    }
  }

  add_option(){
    if(this.recuringObj.BookingFor == 'Add Purpose'){
      let alert = this.alertCtrl.create({
        title: 'Add Purpose',
        inputs: [
          {
            name: 'Purpose',
            placeholder: 'Purpose',
            type: 'text'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Ok',
            handler: data => {
              this.purposeList.push(data.Purpose)
              this.recuringObj.BookingFor = data.Purpose
            }
          }
        ]
      });
      alert.present();
    }
  }

}



class Recuring{
  ParentClubKey:string;
  ClubKey:string;
  ClubName:string;
  ActivityName:string;
  ActivityKey:string;
  StartDate:string = moment().format("YYYY-MM-DD");
  CourtKey:string;
  CourtName:string;
  EndDate:string = moment().add(3,'M').format("YYYY-MM-DD");
  StartTime:string;
  EndTime:string ;
  BookingDays:string = "";
  BookingFor:string;
  Comments:string;
  IsEnable:boolean = true;
  IsActive:boolean = true;
  CreatedDate:number = new Date().getTime();
  Updateddate:number = new Date().getTime();

}


