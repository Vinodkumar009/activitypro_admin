import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
// import { PopoverPage } from '../../popover/popover';
import { FirebaseService } from '../../../services/firebase.service';
import { Storage } from '@ionic/storage';
// import { Dashboard } from './../../dashboard/dashboard';
import { ToastController } from 'ionic-angular';
//import { Platform } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { CommonService } from '../../../services/common.service';

@IonicPage()
@Component({
    selector: 'editpromotion-page',
    templateUrl: 'editpromotion.html'
})

export class Type2EditPromotion {
    themeType: number;
    parentClubKey: string;
    menus: Array<{ DisplayTitle: string; 
        OriginalTitle:string;
        MobComponent: string;
        WebComponent: string; 
        MobIcon:string;
        WebIcon:string;
        MobLocalImage: string;
        MobCloudImage: string; 
        WebLocalImage: string;
        WebCloudImage:string;
        MobileAccess:boolean;
        WebAccess:boolean;
        Role: number;
        Type: number;
        Level: number }>;
    promoObj = {
        PromotionTitle: '',
        StartDate: '',
        EndDate: '',
        Description: '',
        Sequence: '',
        PromotionType: '',
        SlideShowSpeed: '',
        Images: {},
        CreateDate:'',
        UpdatedDate:''
    }
    clubKey: any;
    imagesArr = [];
    allClub = [];
    allClubPromo = [];
    allClubPromoArr = [];
    promoKey = '';
    specificPromo = [];
    response: any;
    constructor(public commonService:CommonService,public toastCtrl: ToastController, public loadingCtrl: LoadingController, storage: Storage,
        public navCtrl: NavController, public sharedservice: SharedServices,
        public fb: FirebaseService, public popoverCtrl: PopoverController, public navParams: NavParams) {

        this.themeType = sharedservice.getThemeType();
        this.menus = sharedservice.getMenuList();
        this.promoObj = navParams.get('activePromoObj');
        this.clubKey = navParams.get('clubKey');
        this.promoKey = navParams.get('promoKey');
        console.log(this.promoObj);
        console.log(this.promoKey);
        console.log(this.clubKey);
        if (this.promoObj != undefined) {
            this.convert(this.promoObj.StartDate);
            this.convert1(this.promoObj.EndDate);
            this.imagesArr = this.commonService.convertFbObjectToArray(this.promoObj.Images);
            console.log(this.imagesArr);
        }


        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.parentClubKey = club.ParentClubKey;
                    this.getRequiredPromo();

                }
        })



    }

    convert(str) {
        var mnths = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        },
            date = str.split(" ");
        //console.log([date[3], mnths[date[1]], date[2]].join("-"));
        this.promoObj.StartDate = [date[3], mnths[date[1]], date[2]].join("-");
        //console.log(this.promoObj.StartDate);
        //return [date[3], mnths[date[1]], date[2]].join("-");
    }

    convert1(str) {
        var mnths = {
            Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
            Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
        },
            date = str.split(" ");

        this.promoObj.EndDate = [date[3], mnths[date[1]], date[2]].join("-");
        //console.log(this.promoObj.EndDate);
        //return [date[3], mnths[date[1]], date[2]].join("-");
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

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }

  
    cancelPromotion() {
        this.navCtrl.pop();
    }

    getRequiredPromo() {
        this.fb.getAll("/Promotion/Type2/" + this.parentClubKey).subscribe((data) => {
            this.allClubPromo = [];
            if (data.length > 0) {
                this.allClub = data;
                console.log(this.allClub);
                for (let i = 0; i < this.allClub.length; i++) {
                    if (this.clubKey == this.allClub[i].$key) {
                        this.allClubPromo.push(this.allClub[i]);
                    }
                }
                console.log(this.allClubPromo);
                for (let j = 0; j < this.allClubPromo.length; j++) {
                    console.log(this.allClubPromo[j]);
                    this.allClubPromoArr = this.commonService.convertFbObjectToArray(this.allClubPromo[j]);
                    this.specificPromo = [];
                    for (let k = 0; k < this.allClubPromoArr.length; k++) {
                        if (this.promoKey == this.allClubPromoArr[k].Key) {
                            this.specificPromo.push(this.allClubPromoArr[k]);
                        }
                    }
                }
                console.log(this.specificPromo);
            }
        })
    }

    editPromotion() {
        if (this.specificPromo.length > 0) {
            let imageSaveObj = { ImagePath: '', ImageToShow: false,ImageRedirectURL:''};
            for (let i = 0; i < this.imagesArr.length; i++) {
                imageSaveObj.ImagePath = this.imagesArr[i].ImagePath;
                imageSaveObj.ImageToShow = this.imagesArr[i].ImageToShow;
                imageSaveObj.ImageRedirectURL =  this.imagesArr[i].ImageRedirectURL;
                this.fb.update(this.imagesArr[i].Key,"/Promotion/Type2/" + this.parentClubKey + "/" + this.clubKey + "/" + this.specificPromo[0].Key + "/Images/", imageSaveObj);
            }

            this.response = this.fb.update(this.specificPromo[0].Key, "/Promotion/Type2/" + this.parentClubKey + "/" + this.clubKey + "/"
                , {
                    PromotionTitle: this.promoObj.PromotionTitle,
                    StartDate: (new Date(this.promoObj.StartDate)).toString(),
                    EndDate: (new Date(this.promoObj.EndDate)).toString(),
                    Description: this.promoObj.Description,
                    Sequence: this.promoObj.Sequence,
                    PromotionType: this.promoObj.PromotionType,
                    SlideShowSpeed: this.promoObj.SlideShowSpeed,
                    CreateDate:this.promoObj.CreateDate,
                    UpdatedDate:((new Date()).getTime()).toString()
                });
        }
        if (this.response != undefined) {
            let message = "Successfully saved.";
            this.showToast(message, 3000);
            this.navCtrl.pop();
        }
    }





}
