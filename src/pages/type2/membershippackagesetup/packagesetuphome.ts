import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { ToastController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'packagesetuphome-page',
    templateUrl: 'packagesetuphome.html'
})

export class Type2PackageSetupHome {
    mebershipPackage: any[];
    clubKey: any;
    themeType: number;
    parentClubKey: string;
    schools: any;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
        WebIcon:string;
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    allSchools: any;
    schoolArr = [];
    responseDetails: any;
    responseDetails1: any;
    selectedClub: any;
    allClub: any;
    activity = [];
    selectedActivity: any;
    allDiscount = [];
    discountArr = [];
    selectedClubKey: string;
    activitykey: string;
    allActivityDiscount = [];
    clubDetails = [];
    tempDiscountArr = [];
    allMembercategory = [];
    subCategoryList = [];
    packageDetails = {
        PackageName: '',
        SelectedActivityName: '',
        MonthlyFees: '',
        QuaterlyFees: '',
        HalfYearlyFees: '',
        YearlyFees: '',
        DefaultFees: '',
        IsCourtBooking: false,
        FreeBookingHours: '',
        IsAdult: false,
        Comments: '',
        IsActive: false,
        CreatedDate: ''
    }
    allCategory = [];
    myIndex = -1;
    myIndex1 = -1;
    allSubCategory = [];
    allActivityArr = [];
    selectedActivityArr = [];
    defaultFeesArr = [
        { id: 1, FeesName: 'Monthly Fees' },
        { id: 2, FeesName: 'Half Yearly Fees' },
        { id: 3, FeesName: 'Quaterly Fees' },
        { id: 4, FeesName: 'Yearly Fees' }
    ];
    selectedMemberCategoryArr = [];
    selectedMemberSubCategoryArr = [];
    packageTypeKey: any;
    activityResponseDetails: any;
    categoryResponseDetails: any;
    subCategoryResponseDetails: any;
    constructor(public commonService:CommonService,public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();



        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.clubKey = club.ClubKey;
                    //  this.getClubList();
                    this.getClubList();
                }
        })
    }


    goTo(obj) {
        this.navCtrl.push(obj.component);
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
            this.allClub = data;
            if (data.length > 0) {
                this.selectedClub = data[0];
                this.selectedClubKey = data[0].$key;
                this.onClubChange();
            }

        });
    }
    getClub() {
        this.fb.getAllWithQuery("/Club/Type2/" + this.parentClubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
            //alert();
            this.allClub = data;
            if (data.length > 0) {

                for (let i = 0; i < this.allClub.length; i++) {
                    if (this.allClub[i].$key == this.clubKey) {
                        this.selectedClub = this.allClub[i];
                        this.fb.getAll("/MembershipPackage/" + this.selectedClub.OriginalParentClubKey + "/" + this.selectedClub.OriginalClubKey).subscribe((data) => {
                            //alert();
                            this.mebershipPackage = data;
                            if (data.length > 0) {

                                for (let i = 0; i < this.mebershipPackage.length; i++) {
                                    this.mebershipPackage[i].IsSelected = false;
                                    // if (this.allClub[i].$key == this.clubKey) {
                                    // this.selectedClub = this.allClub[i];
                                    // }
                                }
                                //  this.selectedClub = data[0].$key;
                                // this.getAllMemberCategory();
                                //this.getAllActivity();
                            }
                        })
                        break;
                    }
                }
                this.selectedClub = data[0].$key;
                // this.getAllMemberCategory();
                //this.getAllActivity();
            }
        })
    }


    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }




    onClubChange() {
        // this.getAllMemberCategory();
        // this.getAllActivity();
        for (let i = 0; i < this.allClub.length; i++) {
            if (this.allClub[i].$key == this.selectedClubKey) {
                this.fb.getAll("/MembershipPackage/" + this.selectedClub.OriginalParentClubKey + "/" + this.selectedClub.OriginalClubKey).subscribe((data) => {
                    //alert();
                    this.mebershipPackage = data;
                    if (data.length > 0) {

                        for (let i = 0; i < this.mebershipPackage.length; i++) {
                            this.mebershipPackage[i].IsSelected = false;
                            this.mebershipPackage[i].ActivityArr = this.commonService.convertFbObjectToArray(this.mebershipPackage[i].Activity)
                            this.mebershipPackage[i].MemberCategoryArr = this.commonService.convertFbObjectToArray(this.mebershipPackage[i].MemberCategory);
                            if (this.allClub[i].$key == this.clubKey) {
                                this.selectedClub = this.allClub[i];
                            }
                            for (let j = 0; j < this.mebershipPackage[i].MemberCategoryArr.length; j++) {
                                if (this.mebershipPackage[i].MemberCategoryArr[j].MemberSubcategory != undefined) {
                                    this.mebershipPackage[i].MemberCategoryArr[j].MemberSubcategoryArr = this.commonService.convertFbObjectToArray(this.mebershipPackage[i].MemberCategoryArr[j].MemberSubcategory);
                                }
                            }
                        }
                        //  this.selectedClub = data[0].$key;
                        // this.getAllMemberCategory();
                        //this.getAllActivity();
                    }
                })
            }
        }
    }
    addMembershipPackageSetup() {
        for (let i = 0; i < this.mebershipPackage.length; i++) {
            if (this.mebershipPackage[i].IsSelected == true) {
                this.packageDetails.PackageName = this.mebershipPackage[i].PackageName;
                this.packageDetails.SelectedActivityName = this.mebershipPackage[i].SelectedActivityName;
                this.packageDetails.MonthlyFees = this.mebershipPackage[i].MonthlyFees;
                this.packageDetails.QuaterlyFees = this.mebershipPackage[i].QuaterlyFees;
                this.packageDetails.HalfYearlyFees = this.mebershipPackage[i].HalfYearlyFees;
                this.packageDetails.YearlyFees = this.mebershipPackage[i].YearlyFees;
                this.packageDetails.DefaultFees = this.mebershipPackage[i].DefaultFees;
                this.packageDetails.IsCourtBooking = this.mebershipPackage[i].IsCourtBooking;
                this.packageDetails.FreeBookingHours = this.mebershipPackage[i].FreeBookingHours;
                this.packageDetails.IsAdult = this.mebershipPackage[i].IsAdult;
                this.packageDetails.Comments = this.mebershipPackage[i].Comments;
                this.packageDetails.IsActive = this.mebershipPackage[i].IsActive;
                this.packageDetails.CreatedDate = this.mebershipPackage[i].CreatedDate;
            }
            this.fb.update(this.mebershipPackage[i].$key, "/MembershipPackage/" + this.parentClubKey + "/" + this.selectedClubKey + "/", this.packageDetails);
            for (let j = 0; j < this.mebershipPackage[i].ActivityArr.length; j++) {
                //this.mebershipPackage[i].ActivityArr
                this.fb.update(this.mebershipPackage[i].ActivityArr[j].Key, "/MembershipPackage/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.mebershipPackage[i].$key + "/Activity/",
                    {
                        ActivityCode: this.mebershipPackage[i].ActivityArr[j].ActivityCode,
                        ActivityName: this.mebershipPackage[i].ActivityArr[j].ActivityName,
                        AliasName: this.mebershipPackage[i].ActivityArr[j].AliasName,
                        BaseFees: this.mebershipPackage[i].ActivityArr[j].BaseFees,
                        FreeBookingHoursForActivity: this.mebershipPackage[i].ActivityArr[j].FreeBookingHoursForActivity
                    });
            }
            for (let k = 0; k < this.mebershipPackage[i].MemberCategoryArr.length; k++) {
                this.fb.update(this.mebershipPackage[i].MemberCategoryArr[k].Key, "/MembershipPackage/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.mebershipPackage[i].$key + "/MemberCategory/",
                    {
                        AliasName: this.mebershipPackage[i].MemberCategoryArr[k].AliasName,
                        CreatedDate: this.mebershipPackage[i].MemberCategoryArr[k].CreatedDate,
                        IsActive: this.mebershipPackage[i].MemberCategoryArr[k].IsActive,
                        IsExistSubCategory: this.mebershipPackage[i].MemberCategoryArr[k].IsExistSubCategory,
                        MemeberCategoryCode: this.mebershipPackage[i].MemberCategoryArr[k].MemeberCategoryCode,
                        MemeberCategoryName: this.mebershipPackage[i].MemberCategoryArr[k].MemeberCategoryName
                    });
                for (let l = 0; l < this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr.length; l++) {
                    this.fb.update(this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr[l].Key, "/MembershipPackage/" + this.parentClubKey + "/" + this.selectedClubKey + "/" + this.mebershipPackage[i].$key + "/MemberCategory/" + this.mebershipPackage[i].MemberCategoryArr[k].Key + "/MemberSubcategory/",
                        {
                            AliasName: this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr[l].AliasName,
                            CreatedDate: this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr[l].CreatedDate,
                            IsActive: this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr[l].IsActive,
                            MembershipSubCategoryCode: this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr[l].MembershipSubCategoryCode,
                            MembershipSubCategoryName: this.mebershipPackage[i].MemberCategoryArr[k].MemberSubcategoryArr[l].MembershipSubCategoryName
                        });
                }
            }

        }
        let message = "Successfully Saved";
        this.showToast(message, 3000);
        this.navCtrl.pop();
    }

}
