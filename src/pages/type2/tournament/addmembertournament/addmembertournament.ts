import { Component } from '@angular/core';
import { Platform, ActionSheetController, LoadingController, ToastController, NavController, NavParams } from 'ionic-angular';
import { PopoverController } from 'ionic-angular';
import * as moment from 'moment';
import { AlertController } from 'ionic-angular';
import { IonicPage } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import * as firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';

@IonicPage()
@Component({
    selector: 'addmembertournament-page',
    templateUrl: 'addmembertournament.html'
})

export class AddMemberTournament {
    members = [];
    parentClubKey: any;
    clubs: any;
    allMemebers: any;
    tournamentKey: any;
    memberDisplay:any = [];
    GroupKey: any;
    membersArr = [];
    existingMembers = [];
    selectedMembers = [];
    tournament: any;
    limit:number = 18;
    offset:number = 0;
    search_term:string = '';
    constructor(public commonService: CommonService, public platform: Platform,
        public actionSheetCtrl: ActionSheetController, public loadingCtrl: LoadingController,
        private alertCtrl: AlertController, private toastCtrl: ToastController,
        public fb: FirebaseService, public navParams: NavParams, public navCtrl: NavController,
        storage: Storage, public sharedservice: SharedServices, public popoverCtrl: PopoverController,
        private apollo: Apollo,) {
        this.membersArr = this.navParams.get('memberArr')
        storage.get('userObj').then((val) => {
            val = JSON.parse(val);
            if (val.$key != "") {
                this.parentClubKey = val.UserInfo[0].ParentClubKey;
                this.tournamentKey = this.navParams.get('TournamentKey')
                this.tournament = this.navParams.get('Tournament');
                this.members = JSON.parse(JSON.stringify([]));
                this.allMemebers = JSON.parse(JSON.stringify([]));
                this.getTournament(this.tournamentKey);
                this.getParentClubUsers();
            }
        })

    }
    ionViewDidEnter() {
        //this.getClubList(this.parentClubKey)
    }
    // getClubList(ParentClubKey) {
    //     this.commonService.showLoader("Please wait");
    //     let x: any;
    //     let currentInvokingObject = this;
    //     let ref = firebase.database().ref('/').child("/Club/Type2/" + ParentClubKey);
    //     ref.once("value", function (snapshot) {
    //         x = snapshot.val();
    //         x = currentInvokingObject.commonService.convertFbObjectToArray(x);
    //         currentInvokingObject.clubs = x;
    //         currentInvokingObject.getMemberListsForEdit();
    //     }, function (error) {
    //         this.commonService.hideLoader();
    //         //this.showToast(error.message, 3000);
    //     });
    // }


    // getParentClubUsers = () => {
    //     this.commonService.showLoader("Fetching users...")
    //     const userQuery = gql`
    //     query getAllMembersByParentClubNMemberType($parentclubid:String!) {
    //         getAllMembersByParentClubNMemberType(ParentClubKey:$parentclubid){
    //             FirebaseKey,
    //             FirstName,
    //             LastName
    //             ClubKey
    //             IsChild
    //             DOB
    //             EmailID
    //             EmergencyContactName
    //             EmergencyNumber
    //             Gender
    //             MedicalCondition
    //             ParentClubKey
    //             ParentKey
    //             PhoneNumber
    //             IsEnable
    //             IsActive
    //             PromoEmailAllowed
    //       }
    //     }
    //   `;
    //  this.apollo
    //   .query({
    //     query: userQuery,
    //     fetchPolicy: 'network-only',
    //     variables: {
    //       parentclubid:this.parentClubKey,
    //       MemberType:null
    //     },
    //   })
    //   .subscribe(({data}) => {
    //     console.log('challeges data' + data["getAllMembersByParentClubNMemberType"]);
    //     //this.commonService.hideLoader();
    //     let totUsers = data["getAllMembersByParentClubNMemberType"] as UsersModel[];
    //     // this.UnmutatedChallenges = JSON.parse(JSON.stringify(this.Challenges));
    //     for (let i = 0; i < totUsers.length; i++) {
    //         //if(data[i].IsEnable && data[i].IsActive){
    //         if(totUsers[i].IsActive && totUsers[i].FirstName!=""){
    //             totUsers[i]["isSelect"] = false;
    //             totUsers[i]["isAlreadySelected"] = false;
    //             let temp = this.membersArr.find(actmbr => actmbr.Key == totUsers[i].FirebaseKey)
    //             if (temp === undefined) {
    //                 if (totUsers[i].FirstName != undefined) {
    //                     totUsers[i]['DisplayName'] = totUsers[i].FirstName + " " + totUsers[i].LastName;
    //                     this.memberDisplay.push(totUsers[i]);
    //                     //this.members.push(totUsers[i]);
    //                     let age = this.commonService.getAgeFromYYYY_MM(this.memberDisplay[(this.memberDisplay.length - 1)].DOB);
    //                     if (isNaN(age)) {
    //                         this.memberDisplay[(this.memberDisplay.length - 1)].Age = "N.A";
    //                     } else {
    //                         this.memberDisplay[(this.memberDisplay.length - 1)].Age = age;
    //                     }
    //                 }
    //             } else {
    //                 totUsers[i]["isAlreadySelected"] = true;
    //                 this.existingMembers.push(totUsers[i]);
    //             }
    //         }
          
    //     }
    //     this.commonService.hideLoader();
    //     this.allMemebers = JSON.parse(JSON.stringify(this.memberDisplay)); 
    //     this.commonService.toastMessage(`${totUsers.length} Users found`,2000,ToastMessageType.Success,ToastPlacement.Bottom);
    //   },(err)=>{
    //     this.commonService.hideLoader();
    //     this.commonService.toastMessage("Users fetch failed",2500,ToastMessageType.Error,ToastPlacement.Bottom);
    //   });
           
    //   }
    doInfinite(infiniteScroll) {
        this.offset+=this.limit;
        this.search_term = "";
        this.getParentClubUsers();
        setTimeout(() => {
          infiniteScroll.complete();
        },500); 
      }
    
      getParentClubUsers = () => {
        this.allMemebers = [];
        //this.newSelectedMemberArray = [];
        //this.commonService.showLoader("Fetching users...")
        console.log("time started")
        console.time();
        const userQuery = gql`
        query getAllMembersByParentClubNMemberType($parentclubid:String!,$searchterm:String!,$offset:Float!,$limit:Float!) {
          getAllMembersByParentClubNMemberType(ParentClubKey:$parentclubid,SearchTerm:$searchterm,Offset:$offset,Limit:$limit){
                FirebaseKey,
                FirstName,
                LastName
                ClubKey
                IsChild
                DOB
                EmailID
                EmergencyContactName
                EmergencyNumber
                Gender
                MedicalCondition
                ParentClubKey
                ParentKey
                PhoneNumber
                IsEnable
                IsActive
                PromoEmailAllowed
          }
        }
      `;
      this.apollo
        .query({
          query: userQuery,
          fetchPolicy: 'network-only',
          //fetchPolicy: 'cache-first',
          variables: {
            parentclubid:this.parentClubKey,
            searchterm:this.search_term,
            offset:this.offset,
            limit:this.limit,
            MemberType:1
          },
        })
        .subscribe(({data}) => {
          //console.log('challeges data' + data["getAllMembersByParentClubNMemberType"]);
          console.timeEnd();
          console.log("time ended")
          let totUsers = JSON.parse(JSON.stringify(data["getAllMembersByParentClubNMemberType"] as UsersModel[]));
          if(totUsers.length > 0) this.checkForExistingUsers(totUsers);
          this.allMemebers = JSON.parse(JSON.stringify(this.members));
        },(err)=>{
          //this.commonService.hideLoader();
          this.commonService.toastMessage("Users fetch failed",3000,ToastMessageType.Error,ToastPlacement.Bottom);
        });
           
      }
    
      //find existing users in sessions and make them disable
      checkForExistingUsers(totUsers){
        for (let i = 0; i < totUsers.length; i++) {
          totUsers[i]["DisplayName"] = totUsers[i].FirstName + " " + totUsers[i].LastName;
          if(totUsers[i]["DisplayName"].trim()!=""){
            this.members.push(totUsers[i]);
            //let age = (new Date().getFullYear() - new Date(this.members[(this.members.length - 1)].DOB).getFullYear());
            let age = this.commonService.getAgeFromYYYY_MM(this.members[(this.members.length - 1)].DOB);
            if (isNaN(age)) {
              this.members[(this.members.length - 1)].Age = "N.A";
            } else {
              this.members[(this.members.length - 1)].Age = age;
            }
            
            if(this.membersArr.length > 0){
              for (let j = 0; j < this.membersArr.length; j++) {
                if (totUsers[i].FirebaseKey == this.membersArr[j].Key && this.membersArr[j].IsActive) {
                  this.members[(this.members.length - 1)].isSelect = true;
                  this.members[(this.members.length - 1)].isAlreadySelected = true;
                  //this.members[(this.members.length - 1)].isPaid = totUsers[i].SchoolSession[this.schoolSession.$key] && totUsers[i].SchoolSession[this.schoolSession.$key].AmountPayStatus && (totUsers[i].SchoolSession[this.schoolSession.$key].AmountPayStatus == "Paid") ? true:false;
                  break;
                }
                else {
                  this.members[(this.members.length - 1)].isAlreadySelected = false;
                  this.members[(this.members.length - 1)].isSelect = false;
                  //this.members[(this.members.length - 1)].isPaid = false;
                }
      
              }
            }if(this.selectedMembers.length > 0){
              for (let j = 0; j < this.selectedMembers.length; j++) {//we need to show already selected members while searching
                if (totUsers[i].FirebaseKey == this.selectedMembers[j].FirebaseKey) {
                  this.members[(this.members.length - 1)].isSelect = true;
                  break;
                }
              }
            }
          }
          
        }
        //console.table(this.selectedMembersForTheSession);
    
      }
    // getMemberListsForEdit() {
    //     this.members = [];
    //     this.memberDisplay = [];
    //     this.existingMembers = [];
    //     for (let clubIndex = 0; clubIndex < this.clubs.length; clubIndex++) {

    //         this.fb.getAll("/Member/" + this.parentClubKey + "/" + this.clubs[clubIndex].Key).subscribe((data) => {
    //             if (data.length > 0) {
                   
    //                 //    this.members = data;
    //                 for (let i = 0; i < data.length; i++) {
    //                     //if(data[i].IsEnable && data[i].IsActive){
    //                     if(data[i].IsActive){
    //                         let temp = this.membersArr.find(actmbr => actmbr.Key == data[i].$key)
    //                         if (temp === undefined) {
    //                             if (data[i].FirstName != undefined) {
    //                                 data[i].DisplayName = data[i].FirstName + " " + data[i].LastName;
    //                                 this.memberDisplay.push(data[i]);
    //                                 this.members.push(data[i]);
    //                                 let age = (new Date().getFullYear() - new Date(this.members[(this.members.length - 1)].DOB).getFullYear());
    //                                 if (isNaN(age)) {
    //                                     this.members[(this.members.length - 1)].Age = "N.A";
    //                                 } else {
    //                                     this.members[(this.members.length - 1)].Age = age;
    //                                 }
    //                             }
    //                         } else {
    //                             this.existingMembers.push(data[i])
    //                         }
    //                     }
                      


    //                     // for (let j = 0; j < this.selectedMembersForTheSession.length; j++) {
    //                     //   if (data[i].$key == this.selectedMembersForTheSession[j].Key && this.selectedMembersForTheSession[j].IsActive) {
    //                     //     this.members[(this.members.length - 1)].isSelect = true;
    //                     //     this.members[(this.members.length - 1)].isAlreadySelected = true;
    //                     //     this.members[(this.members.length - 1)].isPaid = (data[i].Session[this.OldSessionDetails.$key].AmountPayStatus == "Paid");
    //                     //     break;
    //                     //   }
    //                     //   else {
    //                     //     this.members[(this.members.length - 1)].isAlreadySelected = false;
    //                     //     this.members[(this.members.length - 1)].isSelect = false;
    //                     //     this.members[(this.members.length - 1)].isPaid = false;
    //                     //   }
    //                     // }
    //                 }

    //                 this.allMemebers = this.members;
    //             }
    //         });
    //     }
    //     console.log(this.memberDisplay.length);
    //     this.commonService.hideLoader();
    // }


    getFilterItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();
        // set val to the value of the searchbar
        let val = ev.target.value;
        // if the value is an empty string don't filter the items
        // if (val && val.trim() != '') {
        //     this.memberDisplay = this.allMemebers.filter((item) => {
        //         if (item.DisplayName != undefined) {
        //             return (item.DisplayName.toLowerCase().indexOf(val.toLowerCase()) > -1);
        //             //return item;
        //         }
        //     })
        // }else{
        //     this.initializeItems();
        // }
        if (val && val.trim()!= '' && val.length > 2) {
            this.members = [];
            this.search_term = val;
            this.offset = 0;
            this.limit = 18;
            this.getParentClubUsers();
          }else{
            this.search_term = "";
            this.members = [];
            this.offset = 0;
            this.limit = 18;
            this.getParentClubUsers();
          }
    }

    initializeItems() {
        this.memberDisplay = this.allMemebers;
    }
    getTournament(tournamentKey) {
        const tournment$ = this.fb.getAllWithQuery("Tournament/" + this.parentClubKey, { orderByKey: true, equalTo: tournamentKey })
            .subscribe(data => {
                tournment$.unsubscribe();
                let temp = data[0]
                this.commonService.convertFbObjectToArray(temp.Group)
                    .forEach(eachGroup => {
                        this.GroupKey = eachGroup.Key;
                    });
            })
    }
    selecteMembers(member) {
        if (!member.isSelect) {
            this.selectedMembers.push(member)
        } else {
            this.selectedMembers = this.selectedMembers.filter(item => item.FirebaseKey!= member.FirebaseKey)
        }
        console.log(this.selectedMembers, 'GroupKey ', this.GroupKey)
    }
    addMember() {
        if (this.validate()) {
            let alert = this.alertCtrl.create({
                title: 'Add Member',
                message: ' Are you sure to add ' + this.selectedMembers.length + ' members ?',
                buttons: [
                    {
                        text: "No",
                        role: 'cancel'

                    },
                    {
                        text: 'Yes',
                        handler: data => {
                            this.enrolMembers()
                        }
                    }
                ]
            });
            alert.present();
        }

    }

    async enrolMembers() {
        const member_prommise_array = [];
        this.selectedMembers.forEach(async eachMember => {
            let selectedParentClubKey = eachMember.ParentClubKey;
            let selectedClubKey = eachMember.ClubKey;
            let selectedMemberKey = eachMember.FirebaseKey;
            let TournamentMemberObj
            // for pay later
            TournamentMemberObj = {
                TournamentKey: this.tournament.$key,
                AmountDue: this.tournament.FullAmountForMember,
                AmountPaid: 0,
                AmountPayStatus: "Due",
                CashPayTo: "",
                StartDate: this.tournament.StartDate,
                EndDate: this.tournament.EndDate,
                StartTime: this.tournament.StartTime,
                TotalFeesAmount: this.tournament.FullAmountForMember,
                EnrolDate: moment().format("YYYY-DD-MM"),
                FirstName: eachMember.FirstName,
                // MiddleName: eachMember.MiddleName,
                LastName: eachMember.LastName,
                NotificationEmailAllowed: true,
                EmailID: eachMember.EmailID,
                EmergencyContactName: eachMember.EmergencyContactName,
                EmergencyNumber: eachMember.EmergencyNumber,
                PhoneNumber: eachMember.PhoneNumber,
                PromoEmailAllowed: eachMember.PromoEmailAllowed,

                ParentClubKey: eachMember.ParentClubKey,
                ClubKey: eachMember.ClubKey,
                ActiveGroupKey: this.GroupKey,
                DOB: eachMember.DOB,
                IsActive: eachMember.IsActive,
                IsChild: eachMember.IsChild,
                IsEnable: eachMember.IsEnable,

                TournamentName: this.tournament.TournamentName,
                TournamentType: this.tournament.TournamentType,
                UmpireKey: this.tournament.UmpireKey,
                UmpireName: this.tournament.UmpireName,
                LocationKey: this.tournament.Location,
                // LocationName: this.tournament.LocationName,
                // LocationType: this.tournament.LocationType,
                ActivityKey: this.tournament.ActivityKey,
                ActivityName: this.tournament.ActivityName,
                AgeGroup: this.tournament.AgeGroup,
                PrimaryEmail: this.tournament.PrimaryEmail
            }
            if (eachMember.MiddleName) {
                TournamentMemberObj["MiddleName"] = eachMember.MiddleName ? eachMember.MiddleName :""
            }
            if (eachMember.IsChild) {
                TournamentMemberObj["ParentKey"] = eachMember.ParentKey;
            }

            console.log("member", TournamentMemberObj)

            // For updating the Tournament Group
            member_prommise_array.push(this.fb.update(selectedMemberKey, "Tournament/" + selectedParentClubKey + "/" + this.tournamentKey + "/Group/" + this.GroupKey + "/Member", TournamentMemberObj));

            // For updating the Member/Tournament & Group        
            member_prommise_array.push(this.fb.update(this.tournamentKey, "Member/" + selectedParentClubKey + "/" + selectedClubKey + "/" + selectedMemberKey + "/Tournament", TournamentMemberObj));

            member_prommise_array.push(this.fb.update(this.GroupKey, "Member/" + selectedParentClubKey + "/" + selectedClubKey + "/" + selectedMemberKey + "/Tournament/" + this.tournamentKey + "/Group", { GroupKey: this.GroupKey, IsEnabled: true }))
            

            // // email to member
            // this.sendEmail(TournamentMemberObj)
            // // For Notification
            

            console.log(eachMember)
        });
        await Promise.all(member_prommise_array);
        this.commonService.toastMessage(this.selectedMembers.length + ' Members Added',2500,ToastMessageType.Success);
        this.navCtrl.pop();
    }

    sendFirebaseResp(firebasereq:any){
        return this.fb.getPropValue(firebasereq);
    }
    
    validate(): boolean {
        if (this.selectedMembers.length == 0) {
            this.presentToast('Please Select a Member');
            return false;
        } else {
            return true;
        }
    }
    presentToast(msg) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 3000
        });
        toast.present();
    }
}

export class UsersModel {
    FirebaseKey:string;
    FirstName:string;
    LastName:string;
    ClubKey:string;
    IsChild:string;
    DOB:string;
    EmailID:string;
    EmergencyContactName:string;
    EmergencyNumber:string;
    Gender:string;
    MedicalCondition:string;
    ParentClubKey:string;
    ParentKey:string;
    PhoneNumber:string;
    IsEnable:string;
    IsActive:string;
    //Source
  }