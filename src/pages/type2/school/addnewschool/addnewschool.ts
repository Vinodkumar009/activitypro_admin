import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2AddSchool } from './addschool';
// import { Dashboard } from './../../dashboard/dashboard';
import { CommonService, ToastMessageType } from "../../../../services/common.service";
import gql from "graphql-tag";
import {IonicPage } from 'ionic-angular';
import { ICreateSchoolDto } from '../dto/school.dto';
import { GraphqlService } from '../../../../services/graphql.service';
@IonicPage()
@Component({
  selector: 'addnewschool-page',
  templateUrl: 'addnewschool.html',
  providers:[GraphqlService]
})

export class AddnewSchool {
  themeType: number;
  parentClubKey: string;
  schools: any;
  clubs: any;
  selectedClub: any;
  schoolSetupObj={
    SchoolName:'',
    SchoolEmailID:'',
    SchoolAddress:'',
    SchoolContactNumber:'',
    IsActive:true,
    IsEnable:true,
    FirstLineAddress:'',
    SecondLineAddress:'',
    PostCode:'',
    City:''
  };
  postgre_school:ICreateSchoolDto = {
    parentclub_id:"",
    school_name: "",
    email_id: "",
    contact_no: "",
    city: "",
    postcode: "",
    firstline_address: "",
    secondline_address: "",
    firebasekey:"",
  }
  platform:string = "";
  responseDetails: any;
  constructor(public loadingCtrl: LoadingController, storage: Storage, 
    private commonService: CommonService,
    private graphqlService: GraphqlService,
    public navCtrl: NavController, public sharedservice: SharedServices,
     public fb: FirebaseService, public popoverCtrl: PopoverController) {
      this.platform = this.sharedservice.getPlatform();
    this.themeType = sharedservice.getThemeType();
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
      
        }
    })
    storage.get('postgre_parentclub').then((postgre_parentclub)=>{
      this.postgre_school.parentclub_id = postgre_parentclub.Id;
    })
  }

  saveSchoolSetup() {
    if(this.schoolSetupObj.SchoolName && this.schoolSetupObj.FirstLineAddress && this.schoolSetupObj.PostCode){
      this.responseDetails = this.fb.saveReturningKey("/StandardCode/SchoolSetup/Default/", this.schoolSetupObj);
      if (this.responseDetails != undefined) {
          this.schoolSetupObj['CreatedDate'] = new Date();
          this.schoolSetupObj['CreatedBy'] = 'Parent Club';
          this.fb.update(this.responseDetails, "/School/Type2/" + this.parentClubKey + "/", this.schoolSetupObj);
          this.commonService.toastMessage("Successfully Saved", 2500);
          this.addSchoolInPostgre(this.responseDetails);
          this.navCtrl.pop();
      }
    }else{
      if (!this.schoolSetupObj.SchoolName){
        this.commonService.toastMessage('School name can not be blank.', 3000, ToastMessageType.Error);
      }
      else if(!this.schoolSetupObj.FirstLineAddress){
        this.commonService.toastMessage('First line address can not be blank.', 3000, ToastMessageType.Error);
      }
      else if(!this.schoolSetupObj.PostCode){
        this.commonService.toastMessage('PostCode can not be blank.', 3000, ToastMessageType.Error);
      }
    }
    
  }

  addSchoolInPostgre(school_firebasekey:string){
    try{
      this.postgre_school.school_name = this.schoolSetupObj.SchoolName;
      this.postgre_school.city = this.schoolSetupObj.City;
      this.postgre_school.email_id = this.schoolSetupObj.SchoolEmailID;
      this.postgre_school.contact_no = this.schoolSetupObj.SchoolContactNumber;
      this.postgre_school.postcode = this.schoolSetupObj.PostCode;
      this.postgre_school.firstline_address = this.schoolSetupObj.FirstLineAddress;
      this.postgre_school.secondline_address = this.schoolSetupObj.SecondLineAddress;
      this.postgre_school.firebasekey = school_firebasekey;
  
      const create_school_mutation = gql`
      mutation createSchool($school_input: CreateSchoolDto!) {
        createSchool(schoolInput: $school_input) {
          id
          school_name
        }
      }`
  
      this.graphqlService.mutate(create_school_mutation,{ school_input: this.postgre_school},0)
        .subscribe(
          ({ data }) => {
            console.log("school saved");
          },
          (err) => {
            console.log(JSON.stringify(err));
          }
      );
    }catch(err){
      console.log(JSON.stringify(err));
    }
    
  }

  cancelSchoolSetup(){
    this.schoolSetupObj = { SchoolName: "", SchoolEmailID: "",SchoolAddress: "",SchoolContactNumber: "",IsActive:false,IsEnable:false,FirstLineAddress:'',SecondLineAddress:'',PostCode:'',City:'' };
  }

  ionViewDidLoad() {
      
    this.commonService.screening("Type2School");
  
}
  presentPopover(myEvent) {
    let popover = this.popoverCtrl.create("PopoverPage");
    popover.present({
      ev: myEvent
    });
  }
  gotoAddSchool(){
    this.navCtrl.push("Type2AddSchool");
  }

  gotoaddnewschool(){
    
  }

   goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
