import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { FamilyMember, VenueUser } from '../model/member';
import { SharedServices } from "../../../services/sharedservice";
/**
 * Generated class for the ShowfamilymemberPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-showfamilymember',
  templateUrl: 'showfamilymember.html',
})
export class ShowfamilymemberPage implements OnInit{
  memberInfo:VenueUser;
  type:any = "";
  familyInfo: FamilyMember[] = [];
  ngOnInit(): void {
    this.memberInfo = this.navParams.get('memberdetails');
    this.familyInfo = this.navParams.get('familyInfo');
    const parent_clubkey = this.sharedservice.getParentclubKey();
    this.type = this.navParams.get('type');
    // if(this.type == "Member"){
    //   this.fb.getAllWithQuery("Member/"+parent_clubkey+"/"+this.memberInfo.clubkey,{orderByKey:true,equalTo:this.memberInfo.parentFirebaseKey}).subscribe((data) => {
    //   //this.memberInfo = data[0];
    //     this.getFamilyMemberDetails(); 
    //   });
    // }else if(this.type == "Holidaycampmember"){
    //   this.fb.getAllWithQuery("HolidayCampMember/"+parent_clubkey,{orderByKey:true,equalTo:this.memberInfo.parentFirebaseKey}).subscribe((data) => {
    //     this.memberInfo = data[0];
    //     this.getFamilyMemberDetails(); 
    //   });
    // }else{
    //   this.fb.getAllWithQuery("SchoolMember/"+parent_clubkey,{orderByKey:true,equalTo:this.memberInfo.parentFirebaseKey}).subscribe((data) => {
    //     this.memberInfo = data[0];
    //     this.getFamilyMemberDetails(); 
    //   });
    // }
    
    
  }
  constructor(public fb: FirebaseService,
    public commonService:CommonService,
    private sharedservice: SharedServices,
    public navCtrl: NavController, public navParams: NavParams) {
  }
  //vinod commented while migration
  // getFamilyMemberDetails(){
  //   //let age = (new Date().getFullYear() - new Date(this.memberInfo.DOB).getFullYear());
  //   let age = this.commonService.getAgeFromYYYY_MM(this.memberInfo.DOB);
  //   if (isNaN(age)) {
  //     this.memberInfo.Age = "";
  //     } else {
  //       this.memberInfo.Age = age;
  //     }
      
  //   if(this.memberInfo.FamilyMember != undefined){
  //     if(this.memberInfo.FamilyMember.length == undefined){
  //       //let x = [];
  //       this.memberInfo.FamilyMember = this.commonService.convertFbObjectToArray(this.memberInfo.FamilyMember);
       
       
  //       // for(let i = 0 ; i < this.memberInfo.FamilyMember.length ; i++){
  //       //   if(this.memberInfo.FamilyMember[i].IsActive == true){
  //       //     x.push(this.memberInfo.FamilyMember[i])
  //       //   }
  //       // }
  //       // this.memberInfo.FamilyMember = x;
  //     }
  //     this.familyInfo.forEach((member)=>{
  //       member["Handicap"] = member["Handicap"] ? this.memberInfo["Handicap"] : 1;
  //       member["MediaConsent"] = member["MediaConsent"] ? member["MediaConsent"] : true;
  //       //console.table(this.memberInfo.FamilyMember);
  //     })
  //     for(let i = 0 ; i < this.memberInfo.FamilyMember.length ; i++){
  //       //let age = (new Date().getFullYear() - new Date(this.memberInfo.FamilyMember[i].DOB).getFullYear());
  //       let age = this.commonService.getAgeFromYYYY_MM(this.memberInfo.FamilyMember[i].DOB);
  //       if (isNaN(age)) {
  //         this.memberInfo.FamilyMember[i].Age = "";
  //         } else {
  //           this.memberInfo.FamilyMember[i].Age = age;
  //         }
  //     }
   
  //   }else{
  //     this.memberInfo.FamilyMember = [];
  //   }
  // }
  ionViewDidLoad() {
    console.log('ionViewDidLoad ShowfamilymemberPage');
  }
  goToEditfamilyPage(member,index){
    this.navCtrl.push('EditfamilyPage',{
      memberInfo:member,
      type:this.type,
      parentObj:this.memberInfo
    });
  }

  addFamilyMember(){
    this.navCtrl.push("Type2AddFamilyMember", { ClubKey: this.memberInfo.clubkey, MemberDetails: this.memberInfo, divType: this.type });
  }
}
