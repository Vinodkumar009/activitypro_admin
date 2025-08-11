import { Component } from '@angular/core';
import { NavController, PopoverController, LoadingController, NavParams, ToastController } from 'ionic-angular';
import { SharedServices } from '../../services/sharedservice';
import { Storage } from '@ionic/storage';
import { FirebaseService } from '../../../services/firebase.service';
import {IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../services/common.service';
@IonicPage()
@Component({
    selector: 'venueassigntocoach-page',
    templateUrl: 'venueassigntocoach.html'
})

export class Type2VenueAssignCoach {
    themeType: number;
    selectedParentclubKey: any;
    selectedClubKey: any;
    clubs: any;
    selectedclub: any;
    activities: any;
    selectedActivities: any;
    coachKey: "";
    tempCoachObj: any;
    clubupadefinished: any;
    clubObj = {
        City: "",
        ClubAdminEmailID: "",
        ClubContactName: "",
        ClubDescription: "",
        ClubName: "",
        ClubShortName: "",
        ContactPhone: "",
        FirstLineAddress: "",
        IsActive: true,
        IsEnable: true,
        OriginalClubKey: "",
        PostCode: "",
        SecondLineAddress: "",
        State: "",
        Type: "",
        ParentClubKey: "",
        ClubKey: ""
    }

    coachObj = {
        ParentClubKey: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Gender: "",
        EmailID: "",
        PhoneNumber: "",
        DOB: "",
        DBSNumber: "",
        RegistrationNumber: "",
        Recognition: "",
        ShortDescription: "",
        DetailDescription: "",
        IsActive: true,
        IsEnabled: true,
        IsVenueAssigned: false,
        CoachKey: ""
    }

    activityObj = {
        ActivityCode: "",
        ActivityName: "",
        AliasName: ""
    }
    clubupadefinished1: any;
    tempCoachArr = [];
    act: any;
    clubcall: any;
    //TempActivities = [];
    constructor(private toastCtrl: ToastController,
         public navParams: NavParams, 
         public loadingCtrl: LoadingController,
          storage: Storage, public fb: FirebaseService, 
          public navCtrl: NavController, 
          public sharedservice: SharedServices, 
          public popoverCtrl: PopoverController,
          private comonService: CommonService,) {



        this.themeType = sharedservice.getThemeType();
        this.tempCoachObj = navParams.get('CoachInfo');
      

        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            for (let club of val.UserInfo)
                if (val.$key != "") {
                    this.selectedParentclubKey = club.ParentClubKey;
                    this.clubcall = this.fb.getAllWithQuery("/Club/Type2/" + this.selectedParentclubKey, { orderByChild: "IsEnable", equalTo: true }).subscribe((data) => {
                        this.clubs = data;
                        if (data.length > 0) {
                            this.selectedclub = data[0];
                            this.selectedClubKey = data[0].$key;
                            // this.getActivities();
                            // this.selectedClubKey = data[0].$key;
                            //this.getActivities();
                            for (let i = 0; i < this.clubs.length; i++) {
                                this.act = this.fb.getAll("/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key).subscribe((data) => {

                                    this.activities = data;
                                 
                                    if (data.length > 0) {
                                        this.clubs[i].IsSelected = false;
                                        this.clubs[i].Activities = data;
                                        //this.clubs[i].TempActivities = [];
                                        this.selectedActivities = data[0];
                                        if (this.clubs[i].Activities.length != undefined) {
                                            for (let j = 0; j < this.clubs[i].Activities.length; j++) {
                                                this.clubs[i].Activities[j].IsSelected = false;
                                            }
                                        }

                                        if (this.clubs[i].Activities.length != undefined) {
                                            if (this.tempCoachObj.Club != undefined) {
                                                for (let s = 0; s < this.tempCoachObj.Club.length; s++) {
                                                    if (this.clubs[i].$key == this.tempCoachObj.Club[s].Key) {
                                                        this.clubs[i].IsSelected = true;
                                                        for (let r = 0; r < this.clubs[i].Activities.length; r++) {
                                                            if (this.tempCoachObj.Club[s].Activity != undefined) {
                                                                for (let t = 0; t < this.tempCoachObj.Club[s].Activity.length; t++) {
                                                                    if (this.clubs[i].Activities[r].$key == this.tempCoachObj.Club[s].Activity[t].Key) {
                                                                        this.clubs[i].Activities[r].disabled = true;
                                                                        this.clubs[i].Activities[r].IsSelected = true;
                                                                        //this.clubs[i].IsSelected = true;
                                                                        break;
                                                                    }
                                                                    else {
                                                                        this.clubs[i].Activities[r].disabled = false;

                                                                    }
                                                                }
                                                            }

                                                        }
                                                    }
                                                }
                                            }

                                        }

                                    }


                                });

                                if (this.tempCoachObj.Club != undefined) {
                                    for (let k = 0; k < this.tempCoachObj.Club.length; k++) {
                                        if (this.clubs[i].$key == this.tempCoachObj.Club[k].Key) {
                                            this.clubs[i].disabled = true;
                                            this.clubs[i].IsSelected = true;
                                            break;
                                        }
                                        else {
                                            this.clubs[i].disabled = false;
                                            this.clubs[i].IsSelected = false;
                                        }
                                    }
                                }







                            }
                     
                        }
                    });



                    // this.getCoachList();
                    // this.getClubList();

                }
        })
    }

    presentPopover(myEvent) {
        let popover = this.popoverCtrl.create("PopoverPage");
        popover.present({
            ev: myEvent
        });
    }

    showToast(m: string, howLongShow: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: howLongShow,
            position: 'bottom'
        });
        toast.present();
    }
    assignVenueToCoach() {
        this.act.unsubscribe();
        this.clubcall.unsubscribe();
        this.coachObj.ParentClubKey = this.selectedParentclubKey;
        this.coachObj.FirstName = this.tempCoachObj.FirstName;
        this.coachObj.MiddleName = this.tempCoachObj.MiddleName || "";
        this.coachObj.LastName = this.tempCoachObj.LastName;
        this.coachObj.Gender = this.tempCoachObj.Gender;
        this.coachObj.EmailID = this.tempCoachObj.EmailID;
        this.coachObj.PhoneNumber = this.tempCoachObj.PhoneNumber;
        this.coachObj.DOB = this.tempCoachObj.DOB;
        this.coachObj.DBSNumber = this.tempCoachObj.DBSNumber;
        this.coachObj.RegistrationNumber = this.tempCoachObj.RegistrationNumber;
        this.coachObj.Recognition = this.tempCoachObj.Recognition;
        this.coachObj.ShortDescription = this.tempCoachObj.ShortDescription ? this.tempCoachObj.ShortDescription:"";
        this.coachObj.DetailDescription = this.tempCoachObj.DetailDescription ? this.tempCoachObj.DetailDescription :"";
        this.coachObj.IsActive = this.tempCoachObj.IsActive;
        this.coachObj.IsEnabled = this.tempCoachObj.IsEnabled;
        this.coachObj.IsVenueAssigned = true;
        this.coachObj.CoachKey = this.tempCoachObj.$key;

        for (let i = 0; i < this.clubs.length; i++) {
            if (this.clubs[i].IsSelected == true) {
                this.clubs[i].IsChecked = true;
                for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                    if (this.clubs[i].Activities[k].IsSelected == true) {
                        this.clubs[i].Activities[k].IsChecked = true;
                    }

                }
            }
        }
        for (let i = 0; i < this.clubs.length; i++) {
            if (this.clubs[i].IsChecked == true) {

                // if (this.clubs[i].Activities != undefined) {
                //     this.clubs[i].TempActivities = [];
                //     for (let index = 0; index < this.clubs[i].Activities.length; index++) {
                //         this.clubs[i].TempActivities.push(this.clubs[i].Activities[index]);
                //     }
                // }


                this.clubObj.City = this.clubs[i].City;
                this.clubObj.ClubAdminEmailID = this.clubs[i].ClubAdminEmailID;
                this.clubObj.ClubContactName = this.clubs[i].ClubContactName;
                this.clubObj.ClubDescription = this.clubs[i].ClubDescription ? this.clubs[i].ClubDescription:"";
                this.clubObj.ClubName = this.clubs[i].ClubName;
                this.clubObj.ClubShortName = this.clubs[i].ClubShortName;
                this.clubObj.ContactPhone = this.clubs[i].ContactPhone ? this.clubs[i].ContactPhone : "";
                this.clubObj.FirstLineAddress = this.clubs[i].FirstLineAddress;
                this.clubObj.IsActive = true;
                this.clubObj.IsEnable = true;
                this.clubObj.OriginalClubKey = this.clubs[i].OriginalClubKey;
                this.clubObj.PostCode = this.clubs[i].PostCode;
                this.clubObj.SecondLineAddress = this.clubs[i].SecondLineAddress ? this.clubs[i].SecondLineAddress:"";
                this.clubObj.State = this.clubs[i].City;
                this.clubObj.Type = this.clubs[i].Type;
                this.clubObj.ParentClubKey = this.selectedParentclubKey;
                this.clubObj.ClubKey = this.clubs[i].$key;

                this.clubupadefinished = this.fb.update(this.clubs[i].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Club/", this.clubObj);




                this.fb.update(this.coachObj.CoachKey, "/Club/Type2/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/Coach/", this.coachObj);
                this.fb.update(this.coachObj.CoachKey, "/Coach/Type2/" + this.selectedParentclubKey + "/", { IsVenueAssigned: true });

                if (this.clubs[i].Activities != undefined) {
                    for (let k = 0; k < this.clubs[i].Activities.length; k++) {
                        if (this.clubs[i].Activities[k].IsChecked == true) {
                            this.activityObj.ActivityCode = this.clubs[i].Activities[k].ActivityCode;
                            this.activityObj.ActivityName = this.clubs[i].Activities[k].ActivityName;
                            this.activityObj.AliasName = this.clubs[i].Activities[k].AliasName;
                            this.clubupadefinished = this.fb.update(this.clubs[i].Activities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Club/" + this.clubs[i].$key + "/Activity/", this.activityObj);
                            this.fb.update(this.clubs[i].Activities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Activity/", this.activityObj);
                            this.fb.update(this.coachObj.CoachKey, "/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/" + this.clubs[i].Activities[k].$key + "/Coach/", this.coachObj);
                            this.activityObj = {
                                ActivityCode: "",
                                ActivityName: "",
                                AliasName: ""
                            }
                        }

                    }
                }

                // if (this.clubs[i].TempActivities != undefined) {
                //     for (let k = 0; k < this.clubs[i].TempActivities.length; k++) {
                //         if (this.clubs[i].TempActivities[k].IsSelected == true) {
                //             this.activityObj.ActivityCode = this.clubs[i].TempActivities[k].ActivityCode;
                //             this.activityObj.ActivityName = this.clubs[i].TempActivities[k].ActivityName;
                //             this.activityObj.AliasName = this.clubs[i].TempActivities[k].AliasName;
                //             this.clubupadefinished = this.fb.update(this.clubs[i].TempActivities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Club/" + this.clubs[i].$key + "/Activity/", this.activityObj);
                //             this.fb.update(this.clubs[i].TempActivities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Activity/", this.activityObj);
                //             this.fb.update(this.coachObj.CoachKey, "/Activity/" + this.selectedParentclubKey + "/" + this.clubs[i].$key + "/" + this.clubs[i].TempActivities[k].$key + "/Coach/", this.coachObj);

                //         }

                //     }
                // }





            }
        }
       
        if (this.clubupadefinished != undefined) {
            let message = "Saved successfully";
            this.comonService.toastMessage(message, 2500,ToastMessageType.Success,ToastPlacement.Bottom);
            this.comonService.updateCategory("coach_list");
            this.navCtrl.pop();
        }
        // if (this.clubupadefinished1 != undefined) {
        //     var message = "Selected activity saved successfully";
        //     this.showToast(message, 5000);
        // }
        // for (let j = 0; j < this.clubs.length; j++) {
        //     if (this.clubs[j].IsSelected == true) {
        //         for (let k = 0; k < this.clubs[j].Activities.length; k++) {
        //             if (this.clubs[j].Activities[k].IsSelected == true) {
        //                 this.activityObj.ActivityCode = this.clubs[j].Activities[k].ActivityCode;
        //                 this.activityObj.ActivityName = this.clubs[j].Activities[k].ActivityName;
        //                 this.activityObj.AliasName = this.clubs[j].Activities[k].AliasName;

        //                 this.fb.update(this.clubs[j].Activities[k].$key, "/Coach/Type2/" + this.selectedParentclubKey + "/" + this.coachObj.CoachKey + "/Activity/", this.activityObj);
        //                 this.fb.update(this.coachObj.CoachKey, "/Activity/" + this.selectedParentclubKey + "/" + this.clubs[j].$key +"/"+ this.clubs[j].Activities[k].$key + "/Coach/", this.coachObj);

        //             }

        //         }
        //     }
        // }
    }
    saveCoach() {


    }

    cancelVenueToCoach() {
        this.navCtrl.pop();
    }

    goToDashboardMenuPage() {
        this.navCtrl.setRoot("Dashboard");
    }

}
