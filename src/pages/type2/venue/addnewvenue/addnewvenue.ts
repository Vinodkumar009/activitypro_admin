import { Component } from '@angular/core';
import { NavController, PopoverController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Type2Venue } from '../venue/venue';
// import { Dashboard } from './../../dashboard/dashboard';

import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType } from '../../../../services/common.service';
import { ReportModel_V1 } from '../../../../shared/model/report.model';
@IonicPage()
@Component({
    selector: 'addnewvenue-page',
    templateUrl: 'addnewvenue.html'
})
export class AddNewVenue {
    selectedVenue: any;
    VisibleatSignUpPage = 1;
    selectedParentClub: string;
    themeType: number;
    country=[]
    clubObj = {
        ClubID: '',
        ParentClubID: '',
        ClubAdminEmailID: '',
        ClubAdminPassword: 'tttttt',
        ClubName: '',
        ClubShortName: '',
        ClubDescription: '',
        Location:'',
        WebsiteUrl:'',
        ClubContactName: '',
        Country:'',
        CountryName:'',
        ContactPhone: '',
        FirstLineAddress: '',
        SecondLineAddress: '',
        State: '',
        City: '',
        PostCode: ''
    };

    tempClubObj = {  //type2 club
        City: "",
        ClubAdminEmailID: "",
        ClubAdminPassword: "",
        ClubContactName: "",
        ClubDescription: "",
        Location:'',
        Country:'',
        CountryName:'',
        ClubID: "",
        ClubName: "",
       
        ClubShortName: "",
        ContactPhone: "",
        FirstLineAddress: "",
        ParentClubID: "",
        PostCode: "",
        VisibleatSignUpPage : 1,
        SecondLineAddress: "",
        State: "",
        WebsiteUrl:'',
        Type: "",
        OriginalClubKey: "",
        IsActive: true,
        IsEnable: true,
        CreatedDate: 0,
            CreatedBy: 'Parent Club',
            ParentClubKey:"",
            OriginalParentClubKey:""

    };

    userObj = { EmailID: '', Name: '', Password: '', RoleType: '', Type: '', UserType: '' };
    userInfoObj = { ParentClubKey: '', ClubKey: '' };
    userInfoObj2 = {
        ParentClubKey: "",
        ClubKey: "",
        OriginalClubKey:"",
        OriginalParentClubKey:""
    }
    selectedParentClubKey: any;
    clubKey:any;
    userresponseDetals:any;
    userKey:any;
    responseDetails:any;
    userType: any;
    userresponseDetails: Promise<any>;
    
    constructor(storage: Storage, public comonService: CommonService, public navParams: NavParams, public navCtrl: NavController, public sharedservice: SharedServices, public fb: FirebaseService, public popoverCtrl: PopoverController) {
      
      this.themeType = sharedservice.getThemeType();
      storage.get('userObj').then((val) => {
        val = JSON.parse(val);
        this.userType = val.UserType;
        this.selectedParentClub = val.UserInfo[0].ParentClubKey;  
        this.getCountry();
      }).catch(error => {
       // alert("Errr occured");
      });
    }

    getCountry(){
        this.fb.getAll("Countries/").subscribe(data =>{
            if(data.length > 0){
                this.country = this.comonService.convertFbObjectToArray(data);
                this.country = this.comonService.sortingObjects(this.country,'CountryName')
            }
        })
    }

    countryAssign(){
        this.country.forEach(eachCountry =>{
            if (eachCountry.CountryCode == this.clubObj.Country){
                this.clubObj['CountryName'] = eachCountry.CountryName
            }
         })
       
    }

    save(){
        if(this.validateClubInfoForReg()){
            this.selectedParentClubKey = "-LpjWofUo9B3zwzF_iKb" 
            this.clubObj.ClubAdminEmailID = this.clubObj.ClubName+"01@gmail.com"
    
            this.userObj.EmailID = this.clubObj.ClubAdminEmailID;
            this.userObj.Name = this.clubObj.ClubName;
            this.userObj.Password = 'tttttt';
            this.userObj.RoleType = "3";
            this.userObj.Type = 'Type1';
            this.userObj.UserType = "1";
    
            this.clubKey = this.fb.saveReturningKey("/Club/Type1/" + this.selectedParentClubKey + "/", this.clubObj);
            if (this.clubKey != undefined) {
                this.userresponseDetals = this.fb.saveReturningKey("/User", this.userObj);
    
                if (this.userresponseDetals != undefined) {
                    this.userInfoObj.ParentClubKey = this.selectedParentClubKey
                    this.userInfoObj.ClubKey = this.clubKey
                    this.userKey = this.fb.saveReturningKey("/User/" + this.userresponseDetals + "/UserInfo/", this.userInfoObj);
                    if (this.userKey != undefined) {
                        this.responseDetails = this.fb.update(this.clubKey, "/Club/Type1/" + this.selectedParentClubKey + "/", { UserKey: this.userresponseDetals });
                    }
                }
                
                    this.tempClubObj.City = this.clubObj.City;
                    this.tempClubObj.ClubAdminEmailID = this.clubObj.ClubAdminEmailID;
                    this.tempClubObj.ClubAdminPassword = this.clubObj.ClubAdminPassword;
                    this.tempClubObj.ClubContactName = this.clubObj.ClubContactName;
                    this.tempClubObj.ClubDescription = this.clubObj.ClubDescription;
                    this.tempClubObj.ClubID = this.clubObj.ClubID;
                    this.tempClubObj.ClubName = this.clubObj.ClubName;
                    this.tempClubObj.Location = this.clubObj.Location ? this.clubObj.Location : '',
                    this.tempClubObj.Country = this.clubObj.Country ? this.clubObj.Country : '',
                    this.tempClubObj.CountryName = this.clubObj.CountryName ? this.clubObj.CountryName : '',
                    this.tempClubObj.ClubShortName = this.clubObj.ClubShortName;
                    this.tempClubObj.ContactPhone = this.clubObj.ContactPhone;
                    this.tempClubObj.WebsiteUrl = this.clubObj.WebsiteUrl ? this.clubObj.WebsiteUrl : '';
                    this.tempClubObj.FirstLineAddress = this.clubObj.FirstLineAddress;
                    this.tempClubObj.ParentClubID = this.clubObj.ParentClubID;
                    this.tempClubObj.PostCode = this.clubObj.PostCode;
                    this.tempClubObj.SecondLineAddress = this.clubObj.SecondLineAddress;
                    this.tempClubObj.State = this.clubObj.State;
                    this.tempClubObj.Type = "";
                    this.tempClubObj.OriginalClubKey = this.clubKey;
                    this.tempClubObj.IsActive = true;
                    this.tempClubObj.IsEnable = true;
                    this.tempClubObj.ParentClubKey = this.selectedParentClub;
                    this.tempClubObj.OriginalParentClubKey = this.selectedParentClubKey; 
                    this.tempClubObj.CreatedDate = new Date().getTime();
                    if (this.userType == "2") {
                        this.responseDetails = this.fb.saveReturningKey("/Club/Type2/" + this.selectedParentClub + "/", this.tempClubObj);
                        if (this.responseDetails != undefined) {
                            this.userObj.EmailID = this.tempClubObj.ClubAdminEmailID;
                            this.userObj.Name = this.tempClubObj.ClubName;
                            this.userObj.Password = this.tempClubObj.ClubAdminPassword;
                            this.userObj.RoleType = "3";
                            this.userObj.Type = "2";
                            this.userObj.UserType = "2";
          
    
    
    
    
                            this.userresponseDetails = this.fb.saveReturningKey("/User/", this.userObj);
                            if (this.userresponseDetails != undefined) {
                                this.userInfoObj2.ParentClubKey = this.selectedParentClub;
                                this.userInfoObj2.ClubKey = this.responseDetails;
                                this.userInfoObj2.OriginalClubKey = this.clubKey;
                                this.userInfoObj2.OriginalParentClubKey=this.selectedParentClubKey;
    
                                this.fb.saveReturningKey("/User/" + this.userresponseDetails + "/UserInfo/", this.userInfoObj);
                               
                            }
                            this.responseDetails = this.fb.saveReturningKey("/Club/Type1/" + this.selectedParentClub +"/"+this.clubKey+ "/Type2Child", {ParentClubKey:this.selectedParentClub,Clubkey:this.responseDetails});
                        }
                    }
                this.showPopover();
                this.navCtrl.pop().then(() => this.navCtrl.pop());
            }
        }

    }

    showPopover() {
        const detailedMessage = `
            <p>Congratulations! You have added a new venue successfully!</p>
            <p>Please complete the following steps now before start using this venue:</p>
            <ol>
            <li>Assign an ‘Activity’ to the venue. For example: Tennis, Football. Click on the venue and use the menu to add an activity for the newly added venue.</li>
            <li>Assign a coach to the venue. Setup—>Manage Team.</li>
            <li>Connect a Stripe account for the new venue and activity combination.</li>
            </ol>
            <p><strong>NOTE:</strong> Without the above steps, sessions cannot be created for the new venue.</p>
        `;
        this.comonService.alertWithText("", detailedMessage, "Okay, got it!");
    }

    cancelVenue() {
        this.navCtrl.pop();
    }

    validateClubInfoForReg(): boolean {
        if (this.clubObj.ClubName == "") {
            this.comonService.toastMessage("Enter Club Name",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.ClubShortName == "") {
            this.comonService.toastMessage("Enter Club ShortName",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.ClubDescription == "") {
            this.comonService.toastMessage("Enter Club Description",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.FirstLineAddress == "") {
            this.comonService.toastMessage("Enter First Line Address",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.State == "") {
            this.comonService.toastMessage("Enter State",2500,ToastMessageType.Error);
        
            return false;
        }
        else if (this.clubObj.City == "") {
            this.comonService.toastMessage("Enter City",2500,ToastMessageType.Error);
            return false;
        }
        else if (this.clubObj.PostCode == "") {
            this.comonService.toastMessage("Enter Post Code",2500,ToastMessageType.Error);
            return false;
        }
        return true;
    }
    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }
}