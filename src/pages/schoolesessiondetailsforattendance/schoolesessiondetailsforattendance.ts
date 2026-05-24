import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import { map } from 'rxjs/operator/map';
import * as firebase from 'firebase';
import { FirebaseService } from '../../services/firebase.service';
import { CommonService } from '../../services/common.service';
/**
 * Generated class for the SchoolesessiondetailsforattendancePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()


@Component({
  selector: 'page-schoolesessiondetailsforattendance',
  templateUrl: 'schoolesessiondetailsforattendance.html',
})
export class SchoolesessiondetailsforattendancePage {
  sessionInfo:any = "";
  days:Array<Day> = [];
  availableDaySet:Set<string> = new Set();
  availbaleAttendance:Set<string> = new Set();
  attendMember:Map<string,any> = new Map();
  temp2:any = {};
  temp:any = {};
  type:any = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,public fb:FirebaseService,public commonService:CommonService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SchoolesessiondetailsforattendancePage');
    this.sessionInfo = this.navParams.get('sessionOInfo');
    this.type = this.navParams.get('type');
    this.temp2 = JSON.parse(JSON.stringify(this.sessionInfo))
    this.temp = JSON.parse(JSON.stringify(this.sessionInfo))
    if(this.sessionInfo.Member != undefined){
      if(this.sessionInfo.Member.length == undefined){
        this.sessionInfo.Member = this.commonService.convertFbObjectToArray(this.sessionInfo.Member);
      }
      this.sessionInfo.Member.forEach(mem => {
        mem['IsPresent'] = false;
      });
    }
    let availDays:Array<string> =  this.sessionInfo.Days.split(',');
    availDays.forEach((day:string) =>{
      this.availableDaySet.add(day);
    })
  }
  getDays(){
    this.days = [];
    let startDate = moment(this.sessionInfo.StartDate);
    let endDate = moment(this.sessionInfo.EndDate);
    let duration = (endDate.diff(startDate,'days'));
    for(let i = 0; i <= duration; i++){
      let currentDays = moment(startDate,'YYYY-MM-DD').add(i,'days').format('ddd');
      if(this.availableDaySet.has(currentDays)){
        let sortDay = moment(startDate,'YYYY-MM-DD').add(i,'days').format('dddd');
        let date = moment(startDate,'YYYY-MM-DD').add(i,'days').format(' DD-MMM');
        let customDate = moment(startDate,'YYYY-MM-DD').add(i,'days').format('DD-MM-YYYY');
        let customDateObj = moment(startDate,'YYYY-MM-DD').add(i,'days').format('YYYY-MM-DD');
        let dateObj = new Date(customDateObj).getTime();
        let status = '';
        let today = new Date(moment().format('YYYY-MM-DD')).getTime();
        let comp =  new Date(moment(startDate,'YYYY-MM-DD').add(i,'days').format('YYYY-MM-DD')).getTime();
        if(this.availbaleAttendance.has(String(dateObj))){
          if(this.attendMember.get(String(dateObj)).Iscancel){
            status = 'Canceled'
          }else{
            status = 'Done'
          }
        }else if(today > comp){
          status = 'Pending'
        }
        this.days.push(new Day(currentDays,sortDay,date,customDate,dateObj,this.availbaleAttendance.has(String(dateObj)),status));
       
      }
    }
   
  }
  ionViewWillEnter(){

     let x =  this.fb.getAllWithQuery("SchoolSession/"+this.sessionInfo.ParentClubKey,{orderByKey:true,equalTo:this.sessionInfo.$key}).subscribe((data)=>{
        let attendance = [];
        if(data[0]['Attendance'] != undefined){
          if(data[0]['Attendance'].length == undefined){
            data[0]['Attendance'] = this.commonService.convertFbObjectToArray( data[0]['Attendance']);
          }
          for(let i = 0 ; i < data[0]['Attendance'].length ;i++){
            this.availbaleAttendance.add(data[0]['Attendance'][i].Key);
            this.attendMember.set(data[0]['Attendance'][i].Key,data[0]['Attendance'][i]);
          }
        }
       
        x.unsubscribe();
        this.getDays();
      });
  }
  goToSchooleAttendancePage(obj:Day){
    this.navCtrl.push('SchoolattendencePage',{
      dateObj:obj,
      sessionInfo:this.sessionInfo,
      attendenceInfo:this.attendMember.get(String(obj.dateObj)),
      temp2:this.temp2,
      temp:this.temp,
      type:this.type
    });
  }
  addmin(starTime:string,min):string{
    min = parseInt(min);
    let result:string = "";
    let startHour = parseInt(starTime.split(":")[0]);
    let startMin = parseInt(starTime.split(":")[1]);
    let res = startMin + min;
    if(res >= 60){
        let temp:any = res - 60;
        if(String(temp).length == 1){
            temp = 0+""+temp;
        }
        if(startHour == 24){
            return '01'+":"+temp;
        }else{
            ++startHour;
            return startHour+":"+temp;
        }
    }else{
        return startHour+":"+res;
    }

}


getAge(info){
    let year = info.split("-")[0];
    let currentYear = new Date().getFullYear();
    return Number(currentYear) - Number(year);
  }
}
class Day{
  fullName:string = "";
  day:string = "";
  date:string = "";
  customDate:string = "";
  dateObj:number;
  isAttendanceAvailable:boolean;
  status:any ="";
  constructor(fullName,day,date,customDate,dateObj,isAttendanceAvailable,status){
    this.fullName = fullName;
    this.day = day;
    this.date = date;
    this.customDate = customDate;
    this.dateObj = dateObj;
    this.isAttendanceAvailable = isAttendanceAvailable;
    this.status = status;
  }
}
