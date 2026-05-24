import { Component, ViewChildren } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import * as moment from 'moment';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import { CommonService } from '../../../services/common.service';
/**
 * Generated class for the StaffattendancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-staffattendance',
  templateUrl: 'staffattendance.html',
})
export class StaffattendancePage {
  @ViewChildren(Slides) slides: Slides;
  days:Array<String> = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  month:Array<any> = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  selectedDays:Array<CustomCalender> = [];
  selectedDate = moment().format('DD');
  selectedMonth = moment().format('MMM');
  selectedYear = moment().format('YYYY');
  selectedLabel = 'Today';
  //calculate todays date 
  todayDate = moment().format('DD');
  todayMonth = moment().format('MMM');
  todayYear = moment().format('YYYY');
  //.......... end here .......


  coachList:Array<String> = [];
  selectedParentClubKey:any = "";
  //selectedClubsForCoch:Map<String,any> = new Map<String,any>();



  //others
  fullMonthObj:FullMonth = new FullMonth();


  selectedCoach = {};

  coachAttendanceSetupInfo:any = "";
  closeDayOfAttandance:Set<String> = new Set<String>();


  attendanceMap:Map<any,Array<any>> = new Map<any,Array<any>>();
  attendanceKeySet:Set<any> = new Set<any>();
  selectedDateObj:any = "";
  constructor(public commonService:CommonService,public navCtrl: NavController, public navParams: NavParams,public storage: Storage,public fb: FirebaseService) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        break;
      }
      this.getAllCoach();
     
    }).catch(error => {

    });
  }
  getAllCoach(){
    this.fb.getAllWithQuery("Coach/Type2/"+this.selectedParentClubKey,{orderByChild:"IsActive",equalTo:true}).subscribe((data)=>{
      this.getAttendanceSetupDetails();
      this.coachList = [];
      data.forEach((element) =>{
        this.coachList.push(element);
        if(element.Club != undefined){
          if(element['Club'].length == undefined){
            element['Club'] = this.commonService.convertFbObjectToArray(element['Club']);
           // this.selectedClubsForCoch.set(element.$key,element['Club']);
          }
          element['Club'].forEach((club) => {
            club["CoachName"] = element["FirstName"]+" "+element["LastName"];
            club["CoachKey"] = element["$key"];
          });
        }
      });
      
    });
  }
  getAttendanceSetupDetails(){
    this.fb.getAllWithQuery("StandardCode/StaffSetup/"+this.selectedParentClubKey,{orderByKey:true}).subscribe((data) =>{
      this.coachAttendanceSetupInfo = data[data.length - 1];
      let arr = this.coachAttendanceSetupInfo["ClosedDays"].split(",");
      for(let i = 0 ; i < arr.length ;i++){
        this.closeDayOfAttandance.add(arr[i]);
      }
    });
  }
  getcalender(){
    this.selectedDays  = [];
    let totaldays = new Date(Number(this.selectedYear), Number(this.month.indexOf(this.selectedMonth))+1, 0).getDate();
    let todayMomentparam =  this.todayYear+"-"+this.todayMonth+"-"+this.todayDate;
   
    for(let i = 1 ; i <= totaldays;i++){
      let momentParam = this.selectedYear+"-"+this.selectedMonth+"-"+i;
      let customCalenderObj = new CustomCalender();
      customCalenderObj.date = moment(momentParam).format('DD');
      customCalenderObj.day = this.days[moment(momentParam).day()];
      customCalenderObj.year = moment(momentParam).format('YYYY');
      customCalenderObj.month = moment(momentParam).format('MMM');
      let diff =  moment(todayMomentparam).diff(moment(momentParam),'days');
      if(diff == 0){
        customCalenderObj.label = 'Today'
      }else if(diff == -1){
        customCalenderObj.label = 'Tomorrow'
      }else if(diff == 1){
        customCalenderObj.label = 'YesterDay'
      }else{
        customCalenderObj.label = customCalenderObj.date+"-"+ customCalenderObj.month;
      }
      this.selectedDays.push(customCalenderObj);
    }
    console.log(this.selectedDays);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad StaffattendancePage');
    this.getcalender();
  }
  getFullNonthName(month:any){
    return this.fullMonthObj["fullMonth"][month];
  }
  coachNameChanged(item){
    this.selectedCoach = item;
  }
  monthChanged(){
    console.log(this.slides["first"].getActiveIndex());
    this.selectedMonth = this.month[this.slides["first"].getActiveIndex()];
    this.getcalender();
  }
  changeDate(item:any){
    this.selectedDateObj = item;
    this.selectedDate = item["date"];
    //this.selectedMonth = item["day"];
    this.selectedLabel = item["label"];
  }
  showAttendance(clubInfo){
    if(clubInfo["showAttnd"] == undefined || clubInfo["showAttnd"] == ""){
      clubInfo["showAttnd"] = true;
    }else{
      switch (clubInfo["showAttnd"]){
        case true:{
          clubInfo["showAttnd"] = false;
          break;
        }
        case false:{
          clubInfo["showAttnd"] = true;
          break;
        }
      }
      this.getAttandanceDetails(clubInfo)
    }
    // let key:AttendaceKey  = new AttendaceKey(this.selectedCoach["$key"],clubInfo.Key);
    // if( ! this.attendanceKeySet.has(key)){
    //   this.attendanceKeySet.add(key);
    //   let arr:Array<any> = new Array();
    //   arr.push(new CustomCalender());
    //   this.attendanceMap.set(key,arr)
    // }
    console.log(clubInfo);
  //   let keys = this.AttendanceMap.keys;
  //   if(this.attendanceKeySet.has(clubInfo.))
  }
  getAttandanceDetails(clubInfo){
    let key = clubInfo["CoachKey"]+clubInfo["ClubKey"];
    if(this.attendanceMap.has(key)){

    }else{
      //if there is no attandance befor it will insert a new Attandance object into it
      let tempArray = [];
      tempArray.push(new Attandance())
      this.attendanceMap.set(key,tempArray)
    }
  }
  // inputChange(change,obj:Attandance){
  //   if(obj.InTime != "" && obj.OutTime != "" &&  ){
  //     if(obj.Duration == NaN || obj.Duration == undefined){
  //       let inTime:any = "";
  //       let outTime:any = "";
  //       if(change == 'in'){
  //         let inObj = obj.InTime.split(":");
  //         let inHour  = Number(inObj[0]);
  //         let inMin =  Number(inObj[1]);
  //         inTime =  new Date(Number(this.selectedYear),Number(this.selectedMonth),Number(this.selectedDateObj["date"]),this.month.indexOf(this.selectedDateObj["month"]),inHour,inMin,0).getTime();
  //       }
  //       if(change == 'out'){
  //         let outObj = obj.OutTime.split(":");
  //         let outHour  = Number(outObj[0]);
  //         let outMin =  Number(outObj[1]);
  //         outTime =  new Date(Number(this.selectedYear),Number(this.selectedMonth),Number(this.selectedDateObj["date"]),this.month.indexOf(this.selectedDateObj["month"]),outHour,outMin,0).getTime();
  //       }
  //       let start = moment(inTime);
  //       let end = moment(outTime);
  //       let duration = moment.duration(end.diff(start));
  //       obj.Duration = duration.hours();
  //     }
  //     }
     
  // }
}

class CustomCalender{
   date:any;
   day:any;
   year:any;
   month:any;
   label:any;
  
}
class FullMonth {
  fullMonth = {
    Jan : 'January',
    Feb : 'February',
    Mar : 'March',
    Apr : 'April',
    May : 'May',
    Jun : 'June',
    Jul : 'July',
    Aug : 'August',
    Sep : 'September',
    Oct : 'October',
    Nov : 'November',
    Dec : 'December',
  }
  
}
class Attandance{
    InTime = "";
    OutTime = "";
    Duration:Number;
    Date = "";
    Day = "";
}


