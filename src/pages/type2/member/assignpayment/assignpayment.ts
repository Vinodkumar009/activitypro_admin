import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ActionSheetController, ToastController, Platform } from 'ionic-angular';
import { CommonService } from '../../../../services/common.service';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { PopoverController } from 'ionic-angular';
import * as moment from 'moment';
import { Member } from '../../../Model/MemberModel';
import { isContinueStatement } from 'typescript';

/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-assignpayment',
    templateUrl: 'assignpayment.html',
})
export class AssignPaymentPage {
    selectedClubKey: any;
    ParentClubKey: any;
    isDirectedEdit: boolean;
    Setups = [];
    currencyDetails: any;
    selectedMember;
    Member: any;
    Setup: any;
    member = {};
    selectedClubMember: any;
    Duration: any;
    selectedClubMembers = []
    count: any;
    validity: any;
    updateDate = ' ';
    isAssigned = false;
    time: any;
    ConfigKeyForUpdate: any;
    Creationdate: any;
    MemberKey: any;
    FamilyMember: any;
    selectedMemberKey: any;
    AllSetups: any;
    currentDate: any;
    year: any;
//IsRenewed have NotRenewed, RenewedPending, RenewedPaid.

    constructor(public fb: FirebaseService,
        public toastCtrl: ToastController,
        public alertCtrl: AlertController,
        public comonService: CommonService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public actionSheetCtrl: ActionSheetController,
        storage: Storage,
        public popoverCtrl: PopoverController
    ) {
        storage.get('Currency').then((val) => {
            this.currencyDetails = JSON.parse(val);
        })
        this.AllSetups = navParams.get("AllSetups")
        this.MemberKey = navParams.get("MemberKey")
        this.FamilyMember = navParams.get("FamilyMember")
        if ((this.ParentClubKey = navParams.get("ParentClubKey"))
            && (this.selectedClubKey = navParams.get("ClubKey"))
            && (this.Setup = navParams.get("Setup"))
        ) {
            this.isDirectedEdit = true
            this.getMemberlist(this.ParentClubKey, this.selectedClubKey, this.MemberKey)


        } else {
            this.isDirectedEdit = false
        }

    }


    selectMember(member) {
        if (member != undefined) {
            for (let i = 0; i < this.selectedMember.length; i++) {
                if (this.selectedMember[i]['key'] == member.key) {
                    this.selectedMember[i]['IsSelect'] = member.IsSelect
                    this.selectedMemberKey = member.key
                }
            }
        }
    }


    getMemberlist(ParentClubKey, selectedClubKey, MemberKey) {
        this.selectedMember = []
        this.fb.getAllWithQuery("Member/" + ParentClubKey + "/" + selectedClubKey, { orderByKey: true, equalTo: MemberKey })
            .subscribe((data) => {
                if (data.length > 0) {
                    this.comonService.convertFbObjectToArray(data).forEach(selectedMemberInfo => {
                        selectedMemberInfo['key'] = selectedMemberInfo.$key
                        selectedMemberInfo['DisplayName'] = selectedMemberInfo['FirstName'] + " " + selectedMemberInfo['MiddleName'] + " " + selectedMemberInfo['LastName'];
                        this.selectedMember.push(selectedMemberInfo)

                        //this.selectMember(this.selectedMember[0])
                        if (selectedMemberInfo.FamilyMember) {
                            for (let family in selectedMemberInfo.FamilyMember) {

                                if (selectedMemberInfo.FamilyMember[family]['MiddleName'] != undefined) {
                                    selectedMemberInfo.FamilyMember[family]['key'] = family
                                    selectedMemberInfo.FamilyMember[family]['IsSelect'] = false
                                    selectedMemberInfo.FamilyMember[family]['DisplayName'] = selectedMemberInfo.FamilyMember[family]['FirstName'] + " " + selectedMemberInfo.FamilyMember[family]['LastName'];
                                    this.selectedMember.push(selectedMemberInfo.FamilyMember[family])

                                } else {
                                    selectedMemberInfo.FamilyMember[family]['key'] = family
                                    selectedMemberInfo.FamilyMember[family]['IsSelect'] = false
                                    selectedMemberInfo.FamilyMember[family]['DisplayName'] = selectedMemberInfo.FamilyMember[family]['FirstName'] + " " + selectedMemberInfo.FamilyMember[family]['LastName'];
                                    this.selectedMember.push(selectedMemberInfo.FamilyMember[family])

                                }
                            }
                        }
                    })
                    this.getMembership()
                }

            })
    }

    getMembership() {
        if (this.AllSetups != undefined) {
            let active = this.AllSetups
            let setup = this.Setup
            for (let i = 0; i < this.selectedMember.length; i++) {
                for (let configuration of this.AllSetups) {
                    if (configuration.IsActive == true && configuration.SetupKey == this.Setup.SetupKey && this.selectedMember[i].key == configuration.MemberKey) {

                        this.selectedMember[i].IsSelect = configuration.IsActive
                        this.isAssigned = true  
                        this.Duration = configuration.PaymentOptions
                    }

                }
            }
            // to remove members from list which are already assigned
            this.selectedMember = this.selectedMember.filter(function (item) {
                return (active.some(element => item.key == element.MemberKey && element.SetupKey == setup.SetupKey) || !active.some(element => item.key == element.MemberKey))
            });
        }

    }
   
    calValidity() {
        this.year = new Date().getFullYear()
        if (this.Setup.OptionName == "Financial Year") {
            if (new Date(this.Setup.CreatedDate).getMonth() < new Date().getMonth()) {
                this.year = this.year + 1;
            } else if (new Date(this.Setup.CreatedDate).getMonth() > new Date().getMonth()) {
                this.year = this.year
            } else if (new Date(this.Setup.CreatedDate).getMonth() == new Date().getMonth()) {
                if (new Date(this.Setup.CreatedDate).getDate() >= new Date().getDate()) {
                    this.year = this.year;
                } else if (new Date(this.Setup.CreatedDate).getDate() < new Date().getDate()) {
                    this.year = this.year + 1;
                }
            }
            return new Date(this.year, new Date(this.Setup.CreatedDate).getMonth(), new Date(this.Setup.CreatedDate).getDate()).getTime()
          //  console.log(moment(this.validity).format("DD-MM-YYYY"))
           // console.log(this.validity)
        } else {
            return this.Setup.CreatedDate
        }
    }

    assignmember() {
        let key = null
        let data
        var date = new Date();

        try{
            if (this.validate()) {
                //  this.toFindValidity()
                this.validity = this.calValidity()
                for (let i = 0; i < this.selectedMember.length; i++) {
    
                    console.log(this.MemberKey, this.selectedMemberKey)
                    if (this.selectedMember[i].IsSelect == true) {
                        data = {
                            DisplayName: this.selectedMember[i].DisplayName,
                            IsActive: true,
                            IsChild: this.selectedMember[i].IsChild,
                            ParentKey: this.selectedMember[i].ParentKey,
                            EmailID: this.selectedMember[i].EmailID,
                            DOB: this.selectedMember[i].DOB,
                            SetupKey: this.Setup.SetupKey,
                            SetupName: this.Setup.SetupName,
                            Gender: this.selectedMember[i].Gender,
                            PhoneNumber: this.selectedMember[i].PhoneNumber,
                            //CreationDate: moment().format('DD-MM-YYYY'),
                            //Updationdate: moment().format('DD-MM-YYYY'),
                            CreationDate: date.getTime(),
                            Updationdate: date.getTime(),
                            PaymentOptions: this.Duration,
                            IsPaid:false,
                            IsRenewed:"NotRenewed",
                            Validity: this.validity
                        }
    
                        if (this.selectedMember[i].IsChild == true) {
                            data.EmailID = this.selectedMember[0].EmailID
                        } else {
                            data.ParentKey = ''
                        }
                        console.log(data)
                        key = this.fb.saveReturningKey("Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey + "/" +this.selectedMember[i].key , data)
    
                       
                    }
                }
        }
       }catch(err){
            let message = "Unable to Add Membership";
            this.showToast(message, 2000)
        }
        
          
            
    }
    

    update() {
        let key = null
        this.AllSetups.forEach(config => {
            for (let i = 0; i < this.selectedMember.length; i++) {
                if (config.IsActive == true && config.SetupKey == this.Setup.SetupKey && this.selectedMember[i].IsSelect == false) {
                    this.fb.update(config.Key, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey + "/" + config.MemberKey, { IsActive: false });
                }
            }
        })

        let data
        var date = new Date();

        if (this.validate()) {
            //  this.toFindValidity()
            this.validity = this.calValidity()
            for (let i = 0; i < this.selectedMember.length; i++) {

                console.log(this.MemberKey, this.selectedMemberKey)
                if (this.selectedMember[i].IsSelect == true) {
                    data = {
                        DisplayName: this.selectedMember[i].DisplayName,
                        IsActive: true,
                        IsChild: this.selectedMember[i].IsChild,
                        ParentKey: this.selectedMember[i].ParentKey,
                        EmailID: this.selectedMember[i].EmailID,
                        DOB: this.selectedMember[i].DOB,
                        SetupKey: this.Setup.SetupKey,
                        SetupName: this.Setup.SetupName,
                        Gender: this.selectedMember[i].Gender,
                        PhoneNumber: this.selectedMember[i].PhoneNumber,
                        //CreationDate: moment().format('DD-MM-YYYY'),
                        //Updationdate: moment().format('DD-MM-YYYY'),
                        CreationDate: date.getTime(),
                        Updationdate: date.getTime(),
                        PaymentOptions: this.Duration,
                        IsPaid:false,
                        IsRenewed:"NotRenewed",
                        Validity: this.validity
                    }

                    if (this.selectedMember[i].IsChild == true) {
                        data.EmailID = this.selectedMember[0].EmailID
                    } else {
                        data.ParentKey = ''
                    }
                    key = this.fb.saveReturningKey("Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey + "/" +this.selectedMember[i].key , data)

                    console.log(data + "key -" + key)
                }
            }
            this.showToast("Setup Updated Successfully", 2000)

            this.navCtrl.pop()
        }

    }


    remove() {
        let alert = this.alertCtrl.create({
            title: "Remove Member",
            message: ' Are you sure want to remove this Membership?',
            buttons: [
                {
                    text: "No",
                    role: 'cancel'

                },
                {
                    text: 'Yes',
                    handler: data => {
                        this.AllSetups.forEach(config => {
                            if (config.IsActive == true && config.SetupKey != undefined) {
                                if (config.SetupKey == this.Setup.SetupKey && this.validate()) {
                                    this.fb.update(config.Key, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey + "/" + config.MemberKey, { IsActive: false });
                                    this.isAssigned = false
                                    this.showToast("Membership Removed", 2000);
                                    this.navCtrl.pop()
                                }
                            }
                        })


                        // this.fb.getAllWithQuery("Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey, { orderByKey: true, equalTo: this.MemberKey }).subscribe((data) => {
                        //     if(data.length > 0){
                        //         data.forEach(selectedConfig => {
                        //             this.comonService.convertFbObjectToArray(selectedConfig).forEach(config =>{
                        //                 if(config.IsActive == true && config.SetupKey != undefined){
                        //                     if(config.SetupKey == this.Setup.Key){
                        //                         this.fb.update(config.Key, "Membership/MembershipAssigned/" + this.ParentClubKey + "/" + this.selectedClubKey + "/" + this.MemberKey, { IsActive: false });
                        //                     }
                        //                 }
                        //             })
                        //         })
                        //         this.isAssigned =false
                        //     }
                        // })
                        // this.showToast("Member Removed", 300);
                        // this.navCtrl.pop()

                    }
                }
            ]
        });
        alert.present();
    }
    validate() {
        this.count = 0;
        if (this.Duration == undefined) {
            this.showToast("Please select payment option", 2000);
            return false
        }
        for (let i = 0; i < this.selectedMember.length; i++) {
            if (this.selectedMember[i]['IsSelect'] == true) {
                this.count++
            }
        }
        if(this.count > this.Setup.NoOfMember || this.count < this.Setup.NoOfMember){
            this.showToast("Only "+this.Setup.NoOfMember+" Members Are Allowed To This Membreship", 2000);
            return false
        }else{
            return true
        }
        // if (this.Setup.SetupName.toLowerCase().indexOf('Single'.toLowerCase()) > -1) {

        //     if ((this.count > 1) || (this.count < 1)) {
        //         this.showToast("Your Configuartion is for 'Single'.So, please select one member", 2000);
        //         return false
        //     } else {
        //         return true
        //     }
        // }
        // //when members must be selected are two 
        // if (this.Setup.SetupName.toLowerCase().indexOf('Couple'.toLowerCase()) > -1) {

        //     if ((this.count > 2) || (this.count < 2)) {
        //         this.showToast("Your Configuartion is for 'Couple'.So, please select two members", 2000);
        //         return false
        //     } else {
        //         return true
        //     }
        // }
        // //when members must be selected are more than one
        // if (this.Setup.SetupName.toLowerCase().indexOf('Family with Jr.'.toLowerCase()) > -1) {
        //     if (this.count < this.FamilyMember.length) {
        //         this.showToast("Your Configuartion is for 'Family with Jr.'. So, please select your family members too", 2000);
        //         return false
        //     } else {
        //         return true
        //     }
        // }
    }

    showToast(m: string, dur: number) {
        let toast = this.toastCtrl.create({
            message: m,
            duration: dur,
            position: 'bottom'
        });
        toast.present();
    }

}
