import { Component, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, ToastController, ActionSheetController, Alert, AlertController } from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { TSMap } from 'typescript-map';
import { CommonService,ToastPlacement, ToastMessageType } from '../../../../../services/common.service';
import { FirebaseService } from '../../../../../services/firebase.service';
import { ViewChild } from '@angular/core';
import { Content } from 'ionic-angular';
import { RequestOptions } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { SharedServices } from '../../../../services/sharedservice';
import * as $ from 'jquery';
import { dateValueRange } from 'ionic-angular/umd/util/datetime-util';
/**
 * Generated class for the ViewcourtPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-viewcourt',
  templateUrl: 'viewcourt.html',
})
export class ViewcourtPage {
  @ViewChild(Content) content: Content;
  emil = "";
  NoSlotsAvailable = "No Slots Available"
  memberName = "";
  selectedParentClubKey = "";
  selectedClubKey = "";
  memberKey = "";
  
  isMember = true;
  memberType = "";
  currencyDetails: any = {};
  imgURL = "";
 
  courtDetailsTemp = [];
  todaysSlot = [];
  tommorowSlot = [];
  dayAfterTomorrowSlot = [];
  customLists = [];
  dayAfterTomorrowdate = "";
  todayDay = "";
  tomorrowday = "";
  dayAfterTomorrowday = "";
  courtObj:any = {};
 
  selectedCourts = "";
  freeImageURl = "";
  amount:TSMap<string,string>;
  selectedCourt:TSMap<any,any> = new TSMap<any,any>(); 
  //booking info
  time:any = [];
  bookingConfig = {
    ActivityDuration:0,
    AdvanceBookingAllowed:0,//ina day
    MaxBookingLimit:0,
    MaxBookingForTotaldays:0,
    IsAllowNonMember:false
  }
  loading:any = "";
  days:any = [];
  dates:any = [];
  fomatedDate:any = [];
  slotsTimeByCourts:TSMap<string,Time> = new TSMap<string,Time>();
  allSlots = [];
  noOfSlootBook:number = 0;
  bookedTime:TSMap<any,any>;
  timeConstraint:TSMap<any,any> = new TSMap<any,any>();


  CourtFilter = [
    {court:'All Court', key:'all'},
    {court:'Artificial Grass', key:'0' },
    {court:'Clay',key:'1' },
    {court:'Grass', key:'2'},
    {court:'Hardcourt', key:'3'},
    {court:'Astroturf', key:'4'},
    {court:'Polymeric', key:'5'},
    {court:'SyntheticTurf',key:'6'},
    {court:'Carpet', key:'7'},
  ]

  recuringBookDetails:any = [];
  recuringBookingAvailabledays:any = [];

  recurringSubjectSet:Set<String> = new Set<String>();
  recurringSubjectArray:Array<String> = ["Coaching Session","Member Session","Special Event","Sports Day","Tournament","Others"];
  nestUrl: string;
  courtSelected = '';
  slotofAllCourt=[]
  showCalender=false;
  selectedDate: string;
  showDate: string;
  
  allCourts=[];
  courtInfo: any;
  indexOfSelectedCourt: any;
  parentClubKey: any;
  selectedClub: any;
  clubs=[];
  
  ActivityList=[];
  selectedActivity: string;
  courts=[];

  courtsList = [];
  constructor(public sharedService:SharedServices,public alertCtrl:AlertController,public actionSheetCtrl:ActionSheetController,public toastCtrl:ToastController,public navCtrl: NavController, public navParams: NavParams,public fb: FirebaseService,public storage: Storage, public commonService: CommonService,public http: HttpClient,public loadingCtrl: LoadingController) {
   
   this.recurringSubjectArray.forEach((element:String)=>{
     this.recurringSubjectSet.add(element);
    
   });
   this.storage.get('userObj').then((val) => {
    val = JSON.parse(val);
    for (let user of val.UserInfo) {
      if (val.IsHolidayCampMember) {
        this.isMember = false;
        this.memberType = "HolidayCampMember";
      }
      else if (val.IsSchoolMember) {
        this.isMember = false;
        this.memberType = "SchoolMember";
      }
      break;
    }
  }).catch(error => {
  });
  this.storage.get('Currency').then((val) => {
    this.currencyDetails = JSON.parse(val);
  }).catch(error => {
  });
  this.storage.get('userObj').then((val) => {
    val = JSON.parse(val);
    for (let user of val.UserInfo) {
      this.selectedParentClubKey = user.ParentClubKey;
      this.selectedClubKey = user.ClubKey;
      this.memberKey = user.MemberKey;
      this.memberName = val.Name;
      this.emil = val.EmailID;
      this.getClubDetails()
      break;
    }
  }).catch(error => {
  });
  }
     
  ionViewDidEnter(){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.freeImageURl = "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FBookingPhotos%2FCourt_Booking_Free_Slot.jpeg?alt=media&token=9cac1375-2177-41d7-8d51-26a67857f709";
      this.timeConstraint.clear();
      this.noOfSlootBook = 0;
      this.selectedCourt.clear();
      this.getBookingInf0();
      this.loading.dismiss().catch(() => { });
    });
  }

  ionViewDidLoad() {
    
  }
  getClubDetails() {

    this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
      this.clubs = data;
      if (data.length != 0) {
        this.selectedClubKey = this.clubs[0].$key;
        this.getAllActivity();
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
  getAllCourts() {
    this.fb.getAllWithQuery("Court/" + this.selectedParentClubKey + "/" + this.selectedClubKey + "/" + this.selectedActivity, { orderByChild: 'IsActive', equalTo: true }).subscribe((data) => {
      
      if (data.length > 0) {
        this.allCourts = data;
        this.courtSelected = this.allCourts[0].$key
        //this.courtInfo =  this.allCourts[0]
       
      }
    });
  }

  changeCourt(){
    this.courtInfo =  this.allCourts.filter(court => court.$key == this.courtSelected)[0]
    this. getLoadedwithRequireddata()
  }

  getLoadedwithRequireddata(){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.todayDay = moment().format('ddd');
      this.tomorrowday = moment().add(1, 'days').format('ddd');
      this.dayAfterTomorrowday = moment().add(2, 'days').format('ddd');
      this.dayAfterTomorrowdate =  moment().add(2, 'days').format('Do MMM');

      this.indexOfSelectedCourt = this.allSlots.indexOf(this.courtInfo)
        // this.courtInfo = this.navParams.get('courtInfo');
        // this.allCourts = this.navParams.get('allCourts');
        // this.indexOfSelectedCourt = this.navParams.get('index');
        // this.courtInfo = this.allinfo.courtInfo,
        // this.indexOfSelectedCourt = this.allinfo.courtSelected,
        // this.allCourts = this.allinfo.courts
        this.selectedCourts = this.courtInfo;
         for(let i = 0 ; i < this.allCourts.length ; i++){
           this.courtObj = {};
           this.courtObj["$key"] = this.allCourts[i].$key;
           this.courtObj["ActivityKey"]= this.allCourts[i].ActivityKey;
           this.courtObj["ActivityName"] = this.allCourts[i].ActivityName;
           this.courtObj["ClubKey"] = this.allCourts[i].ClubKey;
           this.courtObj["ClubName"] = this.allCourts[i].ClubName;
           this.courtObj["Comments"] = this.allCourts[i].Comments;
           this.courtObj["CourtName"] = this.allCourts[i].CourtName;
           this.courtObj["CourtType"] = this.allCourts[i].CourtType;
           this.courtObj["CreatedDate"] = this.allCourts[i].CreatedDate;
           this.courtObj["Days"] = this.allCourts[i].Days;
           this.courtObj["EndTime"] = this.allCourts[i].EndTime;
           this.courtObj["FloodLight"] = this.allCourts[i].FloodLight;
           this.courtObj["FloodLightCostForMember"] = this.allCourts[i].FloodLightCostForMember;
           this.courtObj["FloodLightCostForNonMember"] = this.allCourts[i].FloodLightCostForNonMember;
           this.courtObj["IsActive"] = this.allCourts[i].IsActive;
           this.courtObj["IsEnable"] = this.allCourts[i].IsEnable;
           this.courtObj["ParentClubkey"] = this.allCourts[i].ParentClubkey;
           this.courtObj["PaymentOptionForFloodLight"]  = this.allCourts[i].PaymentOptionForFloodLight;
           this.courtObj["Shared"] = this.allCourts[i].Shared;
           this.courtObj["StartTime"] = this.allCourts[i].StartTime;
           this.courtObj["Status"] = this.allCourts[i].Status;
           this.courtObj["Surface"] = this.allCourts[i].Surface;
           this.courtObj["UpdatedDate"] = this.allCourts[i].UpdatedDate;

           this.courtDetailsTemp.push(this.courtObj);

           this.CourtFilter.push({
             court:this.allCourts[i]['CourtName'],
             key:this.allCourts[i].$key
            })
         }
         if( this.courtObj["ActivityName"] == 'Badminton'){
           this.imgURL =  "https://img.aws.livestrongcdn.com/ls-article-image-673/ds-photo/getty/article/154/245/200443178-001.jpg";
         }else if( this.courtObj["ActivityName"] == 'Tennis'){
           this.imgURL =  "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FBookingPhotos%2Fcourtbooking_tennis.jpg?alt=media&token=4e8c4fe1-8023-4765-930e-7ea061005861";
         }
         else{
           this.imgURL="https://d2gg9evh47fn9z.cloudfront.net/800px_COLOURBOX7031670.jpg";
         }
         this.courtDetailsTemp.splice(this.indexOfSelectedCourt,1);
         this.getBookingInf0();

      this.loading.dismiss().catch(() => { });
    });
  
  }
  //.....................getting Booking releted information........................
  getBookingInf0(){
    this.fb.getAllWithQuery("StandardCode/BookingSetup/"+this.courtInfo.ParentClubkey+"/"+this.courtObj.ActivityKey,{orderByChild:'ClubKey',equalTo:this.courtObj.ClubKey}).subscribe((data) =>{
      for(let j = 0 ; j < data.length ;j++){
        if(data[j].IsActive != false){
         this.bookingConfig.ActivityDuration = data[0].CourtDuration;
         this.bookingConfig['FreeCourtText'] = data[0]['FreeCourtText']
        //  this.bookingConfig.AdvanceBookingAllowed = data[0].AdvanceBookingAllowed;
        this.bookingConfig.AdvanceBookingAllowed = 30;
         this.bookingConfig.MaxBookingLimit = data[0].MaxBookinginaDay;
         this.bookingConfig.MaxBookingForTotaldays = data[0].MaximumNumberofHoursInAdvance;
         this.bookingConfig.IsAllowNonMember = data[0].IsAllowNonMember;
          break;
        }
      }
      this.getrecuringBookDetrails();
     });
   
  }
  changeType(){
   
  }
  //..........................After select a Court callad method........................
  select(courts){
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    this.loading.present().then(() => {
      this.selectedCourt.clear();
    this.todaysSlot = [];
    this.tommorowSlot = [];
    this.dayAfterTomorrowSlot = [];
    this.selectedCourts = courts;
    this.getrecuringBookDetrails();
      this.loading.dismiss().catch(() => { });
    });
   
  }

  //...........get which time selected court is available with its corrosponding time........
  getTimeByDays(){
    this.slotsTimeByCourts = new TSMap<string,Time>();
    let startHour = 0;
    let startMin = 0;
    let endHour = 0;
    let endMin = 0;
    let presentDays = this.selectedCourts["Days"].split(",");
    let allStatrtime = this.selectedCourts["StartTime"].split(",");
    let allEndTime = this.selectedCourts["EndTime"].split(",");
    for(let i = 0 ; i < presentDays.length; i++){
      startHour = Number(allStatrtime[i].split(":")[0]);
      startMin = Number(allStatrtime[i].split(":")[1]);
      endHour = Number(allEndTime[i].split(":")[0]);
      endMin = Number(allEndTime[i].split(":")[1]);
      let timeObj:Time = new Time(startHour,startMin,endHour,endMin);
      this.slotsTimeByCourts.set(presentDays[i],timeObj);
    }
    this.getAllSlotsAndprepareObject();
  }





  //..............getting price of each slot by coorosponding days from priceband table........
  getprice(){
    this.fb.getAllWithQuery("StandardCode/PriceBand/"+this.courtInfo.ParentClubkey+"/"+this.courtObj.ActivityKey,{orderByChild:'ClubKey',equalTo:this.courtObj.ClubKey}).subscribe((data) =>{
    
      this.amount = new TSMap<string,string>();
        if(data.length > 0){
          for(let i = 0 ; i < data.length ;i++){
            if(data[i].Days != undefined && data[i].Days != "" && data[i].IsActive == 'True'){
              let allDay = data[i].Days.split(",");
              for(let j = 0 ; j < allDay.length ;j++){
                if(this.isMember){
                  this.amount.set(allDay[j],data[i].CostForMemberBetweenDuration);
                }else{
                  this.amount.set(allDay[j],data[i].CostForNonMemberBetweenDuration);
                }
              }
            }
          }
        }else{

        }
        this.getDays();
     })
  }
//.................get the all the days,so we have to show the slots according to date........
  getDays(){
    for(let i = 0 ; i < this.bookingConfig.AdvanceBookingAllowed ;i++){
      this.days[i] = moment().add(i, 'days').format('ddd');
      this.dates[i] =  moment().add(i, 'days').format('D MMM');
      this.fomatedDate[i] =  moment().add(i, 'days').format('D-MMM-YYYY');
    }
    this.getAllSlotsAndprepareObject();
    // this.loading = this.loadingCtrl.create({
    //   content: 'Please wait...'
    // });
    // this.loading.present().then(() => {
      
    //   this.loading.dismiss().catch(() => { });
    // });
   
    
  }
  //.......................get all the slots according to the times a....................
  getAllSlotsAndprepareObject(){
    this.allSlots = [];
    let tempStartTime = 0;

    for(let i = 0 ; i < this.days.length ;i++){
      let tempLevel = "";
      let obj = {
        Day:"",
        Date:"",
        label:"",
        Slots:[],
        CourtInfo:{},
        CreatedDate:0
      };
      obj.Day = this.days[i];
      obj.Date = this.dates[i];

      obj.CourtInfo = this.selectedCourts;
      obj.CreatedDate = new Date(this.fomatedDate[i]).getTime();
      tempLevel = this.dates[i];
      let tempObj = this.slotsTimeByCourts.get(this.days[i]);
      if(i == 0){
        obj.label = "Today";
      }else if(i == 1){
        obj.label = "Tomorrow";
      }else{
        obj.label = this.dates[i];
      }
      if(tempObj != undefined){
        if(i == 0){
          tempStartTime = new Date().getHours();
        }else if(i == 1){
          tempStartTime = tempObj.StartHour;
        }else{
          tempStartTime = tempObj.StartHour;
        }
        obj.Slots = this.getAllSlotsByTime(tempObj.StartHour,tempObj.StartMin,tempObj.EndHour,tempObj.EndMin,this.days[i],tempStartTime,this.bookingConfig.ActivityDuration,obj);
      }
      this.allSlots.push(obj);
      console.log(obj)
    }
  }
  //....................... returning all the slots based on inputs ..................... 
  // it is indepedent method, only returning slots
  // from startHour to endHour besed on timeDuration.

   getAllSlotsByTime(startHour,startMin,endHour,endMin,day,todayStartTime,timeDuration,dateInfo):any[]{
    let allSlots = []
    let timeSlotObj = new TimeSlot();
    if(startHour != 0 && endHour != 0){
      //let totalMins = (Number(endHour) - Number(startHour)) * 60;
      const startTime = moment(`${startHour}:${startMin}`,"h:m")
      const endtim = moment(`${endHour}:${endMin}`,"h:m")
    //  let totalMins = (Number(endHour) - Number(startHour)) * 60;
    let totalMins = endtim.diff(startTime,"minutes")
      let totalNumberofSlot = totalMins / Number(timeDuration) ;
      for(let i = 0; i < totalNumberofSlot; i++){
        timeSlotObj = new TimeSlot();     
        timeSlotObj.StartHour = Number(startHour);
        timeSlotObj.StartMin = Number(startMin);
        startMin += Number(this.bookingConfig.ActivityDuration);
        while(startMin >= 60){
          startHour++;
          startMin = startMin - 60;
        }
        timeSlotObj.EndHour = Number(startHour);
        timeSlotObj.EndMin = Number(startMin);
    
        timeSlotObj.Price = Number(this.amount.get(day));
        if(this.bookedTime.get(dateInfo.Date) != undefined && this.bookedTime.get(dateInfo.Date).Member.length > 0){
          let obj = this.bookedTime.get(dateInfo.Date).Slots; 
          let cancelInfoObj = this.bookedTime.get(dateInfo.Date).OtherBookingInfo;    
          let memberObj = this.bookedTime.get(dateInfo.Date).Member; 
          for(let k = 0; k < obj.length ; k++){
            let startHourOfSlot = Number(obj[k].StartHour);
            let startMinOfSlot = Number(obj[k].StartMin);
            let endHourOfSlot = Number(obj[k].EndHour);
            let endMinOfSlot = Number(obj[k].EndMin);
          if(startHourOfSlot == timeSlotObj.StartHour && startMinOfSlot == timeSlotObj.StartMin && endHourOfSlot == timeSlotObj.EndHour && endMinOfSlot == timeSlotObj.EndMin){
            timeSlotObj.IsEnable = obj[k].IsEnable;
            timeSlotObj["MemberName"] = obj[k]["MemberName"];
            timeSlotObj["CancelInfo"] = cancelInfoObj;
            timeSlotObj["MemberEmail"] = memberObj[0]["EmailID"];
            timeSlotObj["FirstName"] = memberObj[0]["FirstName"];
            timeSlotObj["LastName"] = memberObj[0]["LastName"];
            timeSlotObj['MemberKey'] = memberObj[0]['MemberKey']
          }
          }
        }
        for(let recuringSlot = 0 ; recuringSlot < this.recuringBookDetails.length ;recuringSlot++){
            let slotDate = new Date(moment(dateInfo.CreatedDate).format('D-MMM-YYYY')).getTime() 
            let recuringStartDate = new Date(moment(this.recuringBookDetails[recuringSlot]["StartDate"]).format('D-MMM-YYYY')).getTime();
            let recuringEndDate = new Date(moment(this.recuringBookDetails[recuringSlot]["EndDate"]).format('D-MMM-YYYY')).getTime();
            if(slotDate >= recuringStartDate && slotDate <= recuringEndDate){
             let tt = moment(dateInfo.CreatedDate).format("ddd");
              if(this.recuringBookingAvailabledays[recuringSlot].has(tt)){
                let recuringStartHour = this.recuringBookDetails[recuringSlot].StartTime.split(":")[0];
                let recuringStartMin = this.recuringBookDetails[recuringSlot].StartTime.split(":")[1];
                let recuringEndHour = this.recuringBookDetails[recuringSlot].EndTime.split(":")[0];
                let recuringEndMin = this.recuringBookDetails[recuringSlot].EndTime.split(":")[1];
                let totstartTimeOfRecuring = (Number(recuringStartHour)*60)+Number(recuringStartMin);
                let totalEndTimeOfrecuring = (Number(recuringEndHour)*60)+Number(recuringEndMin);
                let totalStartTimeOfSlot = (Number(timeSlotObj.StartHour)*60)+Number(timeSlotObj.StartMin);
                let totalEndTimeOfSlot = (Number(timeSlotObj.EndHour)*60)+Number(timeSlotObj.EndMin);
                if(totalEndTimeOfSlot > totstartTimeOfRecuring){
                  if(totalStartTimeOfSlot < totalEndTimeOfrecuring){
                    timeSlotObj.IsEnable = false;
                    timeSlotObj["MemberName"] = this.recuringBookDetails[recuringSlot].BookingFor;
                     break;
                  }
                }
              }
            }
           }
        if(timeSlotObj.StartHour >= todayStartTime){
          if(String(timeSlotObj.EndMin).length < 2){
            timeSlotObj.EndMin =0+""+timeSlotObj.EndMin;
          }
          if(String(timeSlotObj.StartMin).length < 2){
            timeSlotObj.StartMin = 0+""+timeSlotObj.StartMin;
          }
          allSlots.push(timeSlotObj);
        }
      }
    }  
    //check whether court is available or not 
    return allSlots;
  }
  book(court,slideInfo){
    if(!court.IsEnable){
      this.presentActionSheet(court,slideInfo);
    }
  }
  presentActionSheet(court,slideInfo) {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Cancel Booking',
          handler: () => {
            if(this.recurringSubjectSet.has(court.MemberName)){
              //this.showConfirm(court,slideInfo);// vinod added this line
            }else{
              this.showConfirm(court,slideInfo);
            }
          }
        },{
          text: 'Close',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    //actionSheet.present(); //not showing the actionsheet for temporory 
  }
  showConfirm(court,slideInfo) {
    const confirm = this.alertCtrl.create({
      title: 'Cancel Booking',
      message: 'Do you want to cancel this booking?',
      buttons: [
        {
          text: 'No',
          handler: () => {
           
          }
        },
        {
          text: 'Yes',
          handler: () => {
          //  this.fb.update(court["CancelInfo"].SlotsKey,
          //   "CourtBooking/ParentClub/"+this.selectedParentClubKey+"/"+slideInfo["CourtInfo"]["$key"]+"/SlotsTime/"+court["CancelInfo"].BookingTime+"/Slots/",
          //   {IsEnable:true,IsCancel:true,CancelTime:new Date().getTime()});
          //  this.fb.update(court["CancelInfo"].SlotsInfoKey,
          //     "CourtBooking/ParentClub/"+this.selectedParentClubKey+"/"+slideInfo["CourtInfo"]["$key"]+"/SlotsTime/"+court["CancelInfo"].BookingTime+"/Slots/"+court["CancelInfo"].SlotsKey+"/SlotInfo",
          //     {IsEnable:true});
          //     this.getEmialObject(court,slideInfo);

              //this.cancelCourt(slideInfo); //vinod added this method

          }
        }
      ]
    });
    confirm.present(); 
  }

   cancelCourt(courtInfo:any) {
  //   console.log(courtInfo);
  //   let courtInfoObj = {}

  //   courtInfoObj["ParentClubKey"] = this.selectedParentClubKey;
  //   let clubIndex = this.clubs.findIndex(club => club.$key === this.selectedClubKey);
  //   courtInfoObj["VanueName"] = this.clubs[clubIndex].ClubName;
  //   courtInfoObj["CourtInfo"] = courtInfo.CourtInfo;
  //   courtInfoObj["Member"] = courtInfo.Member[0];
  //   courtInfoObj["Time"] = courtInfo.StartHour+":"+courtInfo.StartMin +"-"+ courtInfo.EndHour+":"+courtInfo.EndMin;
  //   courtInfoObj["BookingDate"] = courtInfo.Date;
  //   //courtInfoObj["BookingDate"] = moment(Number(courtInfo.Date)).format("ddd D MMM");
  //   courtInfoObj["Price"] = parseFloat(courtInfo.Price).toFixed(2);
  //   courtInfoObj["SlotInfoKey"] = courtInfo.SlotInfoKey;
  //   courtInfoObj["Slotkey"] = courtInfo.Slotkey;
    
  //   //https://activitypro-nest-261607.appspot.com
  //   this.http.post(`https://activitypro-nest-261607.appspot.com/courtbooking/cancelCourt`, courtInfoObj).subscribe((res: any) => {
  //     //console.log(res.status == 200);
  //     if(res.status == 200){
  //       this.commonService.toastMessage("Booking cancelled successfully", 3000, ToastMessageType.Success, ToastPlacement.Bottom);
  //       this.navCtrl.pop();
  //     }else{
  //       this.commonService.toastMessage("Booking cancellation failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
  //     }
  //   }, (err) => {
  //     this.commonService.toastMessage("Booking cancellation failed", 3000, ToastMessageType.Error, ToastPlacement.Bottom);
  //     console.log(err);
  //   });
   }
  
  bookCourt(){
    this.navCtrl.push('BookcourtPage',{
      noOfBooking:this.noOfSlootBook,
      bookingInfo:this.selectedCourt,
      courtInfo:this.selectedCourts,
      bookingConfigInfo:this.bookingConfig,
      amountInfo:this.amount,
      isMember:this.isMember,
      memberType:this.memberType,
      currencyDetails:this.currencyDetails
    });
  }



  getBookedCourtDetails(){

    {
     
      let key:any = "";
      let value:any = ""
     this.bookedTime = new TSMap<any,any>();
     let x = this.fb.getAllWithQuery("CourtBooking/ParentClub/"+this.selectedCourts["ParentClubkey"],{orderByKey:true,equalTo:this.selectedCourts["$key"]}).subscribe((data) =>{
       for(let i = 0; i <  data.length;i++){
         if(data[i]["SlotsTime"] != undefined){
           if(data[i]["SlotsTime"].length == undefined){
             data[i]["SlotsTime"] = this.commonService.convertFbObjectToArray(data[i]["SlotsTime"]);
             for(let j = 0 ;j < data[i]["SlotsTime"].length ; j++){
              
               if(data[i]["SlotsTime"][j].Slots != undefined){
                 if(data[i]["SlotsTime"][j].Slots.length == undefined){
                   data[i]["SlotsTime"][j].Slots = this.commonService.convertFbObjectToArray( data[i]["SlotsTime"][j].Slots);
                  for(let k = 0 ; k < data[i]["SlotsTime"][j].Slots.length ;k ++){
                   let obj = {
                     Member:[],
                     Slots:[],
                   }
                   data[i]["SlotsTime"][j].Slots[k].Member = this.commonService.convertFbObjectToArray(data[i]["SlotsTime"][j].Slots[k].Member);
                   data[i]["SlotsTime"][j].Slots[k].SlotInfo = this.commonService.convertFbObjectToArray(data[i]["SlotsTime"][j].Slots[k].SlotInfo);
                   obj.Member = data[i]["SlotsTime"][j].Slots[k].Member;
                   obj.Slots = data[i]["SlotsTime"][j].Slots[k].SlotInfo;
                   let bookedMembetrKey = null;
                   if(data[i]["SlotsTime"][j].Slots[k].BookedMemberKey != undefined &&  data[i]["SlotsTime"][j].Slots[k].BookedMemberKey != ""){
                     bookedMembetrKey = data[i]["SlotsTime"][j].Slots[k].BookedMemberKey;
                   }
                   for(let m = 0 ; m < obj.Slots.length ; m++){
                     let firstName = "N/A"
                     let lastName = ""         
                     if(data[i]["SlotsTime"][j].Slots[k].BookedMemberKey = null){
                       if( obj.Member[0]["FirstName"] != undefined &&  obj.Member[0]["FirstName"] !=""){
                         firstName = obj.Member[0]["FirstName"];
                       }   
                       if(obj.Member[0]["LastName"] != undefined && obj.Member[0]["LastName"] != ""){
                         lastName = obj.Member[0]["LastName"].charAt(0)
                       }
                     }else{
                       for(let mem = 0; mem < obj.Member.length;mem++){
                         if(obj.Member[mem].MemberKey == bookedMembetrKey){
                           if( obj.Member[mem]["FirstName"] != undefined &&  obj.Member[mem]["FirstName"] !=""){
                             firstName = obj.Member[mem]["FirstName"];
                           }
                           if(obj.Member[mem]["LastName"] != undefined && obj.Member[mem]["LastName"] != ""){
                             lastName = obj.Member[mem]["LastName"].charAt(0)
                           }
                        
                           break;
                         }
                       }
                     }
                     obj.Slots[m]["MemberName"] =firstName +" "+lastName
 
                   }
                   //obj.Slots["MemberName"] = obj.Member[0]["FirstName"] +" "+ obj.Member[0]["LastName"].charAt(0);
                   let time = moment(Number(data[i]["SlotsTime"][j].Key)).format('D MMM');
                   if(this.bookedTime.get(time) != undefined){
                     let pre = this.bookedTime.get(time).Slots;
                     for(let l = 0 ; l < pre.length ;l++){
                       obj["Slots"].push(pre[l]);
                     }
                   }
 
                   this.bookedTime.set(time,obj);
                  }
                 }
               }
             }
           }
            
   
         }
       } 
       
       this.getprice();
       this.getTimeByDays()
       x.unsubscribe();
     });
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
  getrecuringBookDetrails(){
    this.recuringBookDetails = [];
      this.fb.getAllWithQuery("CourtBooking/RecuringBooking/"+this.selectedParentClubKey+"/"+this.selectedCourts["ClubKey"]+"/"+this.selectedCourts["ActivityKey"],{orderByChild:'CourtKey',equalTo:this.selectedCourts["$key"]}).subscribe((data)=>{
        for(let i = 0; i <  data.length ;i++){
          if(data[i].IsActive == true){
            this.recuringBookDetails.push(data[i]);
          }
        }
        this.getRecuringInfo();
        
      })
   
  }
  getRecuringInfo(){
    for(let i = 0 ;i < this.recuringBookDetails.length ;i++){
      let days = this.recuringBookDetails[i].BookingDays.split(",");
      let temp:Set<string> = new Set<string>();
      for(let day = 0; day < days.length ; day++){
        temp.add(days[day]);
      }
      this.recuringBookingAvailabledays.push(temp);
    }
    this.getBookedCourtDetails();
  }





  getEmialObject(court,slideInfo){
    let info = court;
    info['CourtInfo'] = slideInfo["CourtInfo"];
    let x = info;
    let temp = {};
    let value = [];
    temp["BookingDate"] = slideInfo.Day + " " +  slideInfo.Date;
    temp["CourtName"] = x["CourtInfo"]["CourtName"];
    temp["VanueName"] =  x["CourtInfo"]["ClubName"];
    temp["VanueKey"] =  x["CourtInfo"]["ClubKey"];
    temp["ActivityName"] =  x["CourtInfo"]["ActivityName"];
    temp["ActivityKey"] =  x["CourtInfo"]["ActivityKey"];
    temp["ParentClubkey"] =  x["CourtInfo"]["ParentClubkey"];
    temp["Duration"] =  this.bookingConfig.ActivityDuration +" min";
    temp["MemberName"] =  info.FirstName +" "+ info.LastName;
    if(x.EndMin.length < 2){
      x.EndMin = "0"+x.EndMin;
    }
    if(x.StartMin.length < 2){
      x.StartMin = "0"+x.StartMin;
    }
    temp["Time"] = x.StartHour+":"+x.StartMin +"-"+ x.EndHour+":"+x.EndMin;
    temp["Price"] = parseFloat(x.Price) .toFixed(2);
    value.push(temp);
    this.sendEmail(value,info);
  }

sendEmail(obj,info){
  let url = this.sharedService.getEmailUrl();
  $.ajax({
  url: url + "umbraco/surface/ActivityProSurface/CourtBookingMail",
  data: {
  CUSTOMER_EMAIL: info.MemberEmail,
  CUSTOMER_NAME: info.FirstName + " "+ info.LastName,
  ACTIVITY_NAME: info['CourtInfo'].ActivityName,
  ACTIVITY_ID: info['CourtInfo'].ActivityKey,
  CLUB_OR_PARENT_CLUB_ID: info['CourtInfo'].ParentClubkey,
  VENUE_ID: info['CourtInfo'].ClubKey,
  VENUE_NAME: info['CourtInfo'].ClubName,
  COURT_BOOKING_TEMPLATE_TYPE: "2", //1 or 2 1 for confirmation 2 for cancellation
  COURT_BOOKING_TEMPLATE_HEADER_NAME: "", //it should be ""
  TYPE_OF_ENTITY: 0, //it must be 0 
  COURT_DETAILS_FROM_ClIENT_SIDE: obj //data preparead [{BookingDate: "Fri 24 August"CourtName: "Court1", Time: "23:00 - 24:00", Duration: "1",Price: "2.00"}]
  },
  type: "POST",
  success: function (respnse) {
    console.log('sucess');
  },
  error: function (xhr) {
    console.log('fail'+ xhr);
  }
  });
}


ionViewWillLeave() { //unsbscribe all subscription to avoid all unnecessary data leaks
  // Can make a loop too :D
 
}


}
class TimeSlot{
  StartHour:any = "0";
  StartMin:any = "0";
  EndHour:any = 0;
  EndMin:any = 0;
  Price:any = -1;
  IsBooked:any = false;
  IsActive:any = true;
  IsEnable:any = true;
 }
 class Time{
  StartHour:number = 0;
  StartMin:number = 0;
  EndHour:number = 0;
  EndMin:number = 0;
  constructor(StartHour,StartMin,EndHour,EndMin){
    this.StartHour = StartHour;
    this.StartMin = StartMin;
    this.EndHour = EndHour;
    this.EndMin = EndMin;
  }

 }