import { FirebaseService } from './../../../services/firebase.service';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
/**
 * Generated class for the StaffattendancesetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-staffattendancesetup',
  templateUrl: 'staffattendancesetup.html',
})
export class StaffattendancesetupPage {
  days:Array<String> = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  isCaptureInOutTime:boolean = true;
  daysSet:Set<String> = new Set<String>();
  attendanceObj = new AttendanceFormat();
  selectedParentClubKey = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,public storage: Storage,public fb: FirebaseService) {
    this.storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let user of val.UserInfo) {
        this.selectedParentClubKey = user.ParentClubKey;
        break;
      }
    }).catch(error => {

    });
    this.daysSet.add('Sun');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad StaffattendancesetupPage');
  }
  add(day:string){
    if(this.daysSet.has(day)){
      this.daysSet.delete(day);
    }else{
      this.daysSet.add(day);
    }
  }
  saveData(){
    this.attendanceObj.CaptureInandOutTime = this.isCaptureInOutTime;
    let d = "";
    this.daysSet.forEach((day:string) =>{
       d = d +day+",";
    });
    this.attendanceObj.ClosedDays = d;
    console.log(this.attendanceObj);
    if(this.attendanceObj.HoursPerDay == undefined || this.attendanceObj.HoursPerWeek == undefined || this.attendanceObj.AllowDaysForEdit == undefined ){
      
    }else{
      this.fb.save(this.attendanceObj,"StandardCode/StaffSetup/"+this.selectedParentClubKey);
    }
  }
}
class AttendanceFormat{
  HoursPerDay:number =  8;
  HoursPerWeek:number = 40;
  AllowDaysForEdit:number = 7;
  CaptureInandOutTime:boolean = false;
  ClosedDays:String;
}