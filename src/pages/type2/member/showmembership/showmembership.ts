import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController, ToastController, ActionSheetController, Platform } from 'ionic-angular';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import { CallNumber } from '../../../../../node_modules/@ionic-native/call-number';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { HttpService } from '../../../../services/http.service';
import { SharedServices } from '../../../services/sharedservice';
import { MemberShipData, MemberShips, MemberShipUser, VenueUser } from '../model/member';
import { GraphqlService } from '../../../../services/graphql.service';
import gql from 'graphql-tag';
import { IClubDetails } from '../../session/sessions_club.model';
import { API } from '../../../../shared/constants/api_constants';
import { AppType } from '../../../../shared/constants/module.constants';
import { first } from 'rxjs/operators';
/**
 * Generated class for the MemberprofilePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-showmembership',
    templateUrl: 'showmembership.html',
    providers: [HttpService]
})
export class ShowmembershipPage {
    selectedClubKey: any;
    ParentClubKey: any;
    isDirectedEdit: boolean;
    Setups = [];
    SetupDisplay = [];
    ActiveSetupDispaly = [];
    filterSetup = [];
    currencyDetails: any;
    selectedMembership = [];
    MemberKey: any;
    Key: any;
    IsThereAnyActiveSetup = false;
    count: number;
    time: any;
    Duration: string;
    FamilyMember: VenueUser;
    selectedMember: any[];
    AllSetups: any[];
    ActiveSetups: any[];
    endDateArr: any[];
    nodeUrl: string;
    loading: any;
    postgre_parentclub_id: string;
    clubs: IClubDetails[];
    userMemberShip: MemberShipUser;
    parentClubMemberShip: MemberShips[]
    inputObj = {
        parentclubId: "",
        clubId: "",
        activityId: "",
        memberId: "",
        action_type: 0,
        device_type: 0,
        app_type: 0,
        device_id: "",
        updated_by: "",
    }


    constructor(public fb: FirebaseService,
        public toastCtrl: ToastController,
        public callNumber: CallNumber,
        public alertCtrl: AlertController,
        public comonService: CommonService,
        public navCtrl: NavController,
        public navParams: NavParams,
        public http: HttpClient,
        public actionSheetCtrl: ActionSheetController,
        public storage: Storage,
        public loadingCtrl: LoadingController,
        private httpService: HttpService,
        private sharedservice: SharedServices,
        private graphqlService: GraphqlService
    ) {
        
    }

    ionViewWillEnter() {
        this.comonService.category.pipe(first()).subscribe((data) => {
            if (data == "update_user_memberships_list") {
                this.storage.get('Currency').then((val) => {
                    this.currencyDetails = JSON.parse(val);
                })
                this.storage.get('postgre_parentclub').then((postgre_parentclub) => {
                    this.postgre_parentclub_id = postgre_parentclub.Id;
                    //this.getListOfClub();
                    this.inputObj.app_type = AppType.ADMIN_NEW
                    console.log("Assigned clubId to inputObj:", this.inputObj.clubId);
                    this.inputObj.parentclubId = this.sharedservice.getPostgreParentClubId();
                    this.inputObj.memberId = this.FamilyMember.Id;
                    this.inputObj.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2
                    //console.log("Sending payload:", this.payload);
                    this.getUserMemberships();
                    this.getMemberShipForParentClub();
                }),
                this.FamilyMember = this.navParams.get("MemberInfo");
                //console.log("family member info is:", this.FamilyMember);
        
                if ((this.ParentClubKey = this.navParams.get("ParentClubKey")) && (this.selectedClubKey = this.navParams.get("ClubKey")) && (this.MemberKey = this.navParams.get("MemberKey"))) {
                    this.isDirectedEdit = true
                    this.nodeUrl = "https://activitypro-nest-261607.appspot.com"
                } else {
                    this.isDirectedEdit = false
                }  
            }
        })
    }

    getListOfClub() {
        const clubs_input = {
            parentclub_id: this.postgre_parentclub_id,
            user_postgre_metadata: {
                UserMemberId: this.sharedservice.getLoggedInId()
            },
            user_device_metadata: {
                UserAppType: 0,
                UserDeviceType: this.sharedservice.getPlatform() == "android" ? 1 : 2
            }
        }
        const clubs_query = gql`
            query getVenuesByParentClub($clubs_input: ParentClubVenuesInput!){
              getVenuesByParentClub(clubInput:$clubs_input){
                    Id
                    ClubName
                    FirebaseId
                    MapUrl
                    sequence
                }
            }
            `;
            this.graphqlService.query(clubs_query, { clubs_input: clubs_input }, 0)
            .subscribe((res: any) => {
                this.clubs = res.data.getVenuesByParentClub as IClubDetails[];
                console.log("Clubs list:", this.clubs);
                const foundClub = this.clubs.find(club => club.FirebaseId === this.FamilyMember.clubkey);
                if (foundClub) {
                    console.log("Club found:", foundClub);
                    this.inputObj.clubId = foundClub.Id;
                    // this.inputObj.app_type = AppType.ADMIN_NEW
                    // console.log("Assigned clubId to inputObj:", this.inputObj.clubId);
                    // this.inputObj.parentclubId = this.sharedservice.getPostgreParentClubId();
                    // this.inputObj.memberId = this.FamilyMember.Id;
                    // this.inputObj.device_type = this.sharedservice.getPlatform() == "android" ? 1 : 2
                    // //console.log("Sending payload:", this.payload);
                    // this.getUserMemberships();
                    // this.getMemberShipForParentClub();
                } else {
                    console.log("Club not found");
                }
            },
            (error) => {
                this.comonService.toastMessage("No venues found", 2500, ToastMessageType.Error)
                console.error("Error in fetching:", error);
            })                
    }


    //getting user memberships
    getUserMemberships() {
        this.ActiveSetups = [];
        this.httpService.post(`${API.MEMBERSHIP_USER}`, this.inputObj).subscribe((res: any) => {
            this.userMemberShip = res["data"];
            console.log("active memberships data", this.userMemberShip);
        }, (error) => {
            this.comonService.toastMessage("User memberships fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })
    }

    //getting parentclub -> venue memberships available
    getMemberShipForParentClub() {
        // this.inputObj.memberId = this.ActiveSetups[0].id
        this.httpService.post(`${API.MEMBERSHIP_PARENT_CLUB}`, this.inputObj).subscribe((res: any) => {
            this.parentClubMemberShip = res["data"];
            console.log("membership for parentclub", JSON.stringify(res));
        }, (error) => {
            this.comonService.toastMessage("Member Fetch failed", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })
    }

    formatMatchStartDate(date) {
        //return moment(+date, "YYYY-MM-DD hh:mm:ss").format("DD-MMM-YYYY, hh:mm");
        return moment(date, "YYYY-MM-DD").format("DD/MM/YYYY");
    }

    // setupListing() {
    //     this.Setups = []
    //     this.SetupDisplay = []
    //     this.ActiveSetupDispaly = []

    //     this.fb.getAllWithQuery("Membership/MembershipSetup/" + this.ParentClubKey, { orderByKey: true, equalTo: this.selectedClubKey }).subscribe((data) => {
    //         if (data.length > 0) {
    //             data.forEach(selectedVenue => {
    //                 if (selectedVenue.Setup) {
    //                     this.Setups = []
    //                     this.SetupDisplay = []
    //                     this.ActiveSetupDispaly = []
    //                     this.comonService.convertFbObjectToArray(selectedVenue.Setup)
    //                         .forEach(eachSetup => {

    //                             if (eachSetup.IsActive) {
    //                                 eachSetup["ClubKey"] = selectedVenue.ClubKey;
    //                                 eachSetup["SetupKey"] = eachSetup.Key;
    //                                 if (selectedVenue.Options) {
    //                                     this.comonService.convertFbObjectToArray(selectedVenue.Options)
    //                                         .forEach(eachOptions => {
    //                                             //  console.log("eachOptions", eachOptions)
    //                                             if (eachSetup.Tier1 in eachOptions == true) {
    //                                                 eachSetup["SetupName"] = eachOptions[eachSetup.Tier1]['Label']

    //                                             }
    //                                             if (eachSetup.Tier2 in eachOptions == true) {
    //                                                 eachSetup.SetupName = eachSetup.SetupName + "-" + eachOptions[eachSetup.Tier2]['Label']

    //                                             }
    //                                             if (eachSetup.Tier3 in eachOptions == true) {
    //                                                 eachSetup.SetupName = eachSetup.SetupName + "-" + eachOptions[eachSetup.Tier3]['Label']

    //                                             }
    //                                             if (eachSetup.Tier4 in eachOptions == true) {
    //                                                 eachSetup.SetupName = eachSetup.SetupName + "-" + eachOptions[eachSetup.Tier4]['Label']

    //                                             }
    //                                             //  eachSetup["SetupName"]= Tier1Name+"-"+Tier2Name+"-"+Tier3Name+"-"+ Tier4Name
    //                                         });
    //                                 }
    //                                 if (selectedVenue.MembershipYear != undefined) {
    //                                     //  console.log("selectedVenue.MembershipYear", selectedVenue.MembershipYear)
    //                                     console.log("selectedVenue.MembershipYear", selectedVenue.MembershipYear)

    //                                     this.comonService.convertFbObjectToArray(selectedVenue.MembershipYear).forEach(endYear => {

    //                                         if (endYear.Option == "FinancialYear" && endYear.IsActive) {
    //                                             eachSetup['MembershipYearobj'] = endYear
    //                                             eachSetup['OptionName'] = "Financial Year"
    //                                             eachSetup["CreatedDate"] = endYear.EndMonth
    //                                         }
    //                                         if (endYear.Option == "TwelvemonthrollingMonthBefore" && endYear.IsActive) {
    //                                             eachSetup['MembershipYearobj'] = endYear
    //                                             eachSetup['OptionName'] = 'finish a month before'
    //                                             eachSetup["CreatedDate"] = endYear.ExpireDate

    //                                         }
    //                                         if (endYear.Option == "TwelvemonthrollingAtThatMonth" && endYear.IsActive) {
    //                                             eachSetup['MembershipYearobj'] = endYear
    //                                             eachSetup['OptionName'] = 'finish at that month'
    //                                             eachSetup["CreatedDate"] = endYear.ExpireDate
    //                                         }
    //                                         //     if (endYear.IsActive) {
    //                                         //         for (const key in endYear) {
    //                                         //             if (key == "FinancialYear" && endYear['FinancialYear'].IsActive) {
    //                                         //               eachSetup['OptionName'] = "Financial Year"
    //                                         //               eachSetup["CreatedDate"] = endYear[key].CreationDate                                     
    //                                         //             }
    //                                         //             if (key == "Twelvemonthrolling" && endYear['Twelvemonthrolling']['MonthBefore'].IsActive) {                                           
    //                                         //               eachSetup['OptionName'] = 'finish a month before'
    //                                         //               eachSetup["CreatedDate"] = endYear[key].MonthBefore.CreationDate

    //                                         //             }
    //                                         //             if (key == "Twelvemonthrolling" && endYear["Twelvemonthrolling"]['AtThatMonth'].IsActive) {
    //                                         //               eachSetup['OptionName'] = 'finish at that month'
    //                                         //               eachSetup["CreatedDate"] = endYear[key].AtThatMonth.CreationDate
    //                                         //             }
    //                                         //           }
    //                                         //     }
    //                                     })
    //                                 }
    //                                 eachSetup.TimePayments = []
    //                                 this.comonService.convertFbObjectToArray(eachSetup.PaymentOptions)
    //                                     .forEach(eachPayment => {
    //                                         if (eachPayment.IsActive && eachPayment.Price != 0) {
    //                                             eachSetup.TimePayments.push({ Label: eachPayment.Key, Value: eachPayment.Price, absDiscount: eachPayment.DiscountAbsolute, percentDiscount: eachPayment.DiscountPercentage })
    //                                         }
    //                                     });
    //                                 console.log(eachSetup)
    //                                 this.getActiveSetups(eachSetup)
    //                                 this.Setups.push(eachSetup)
    //                                 this.SetupDisplay.push(eachSetup)
    //                             }
    //                         });
    //                 }
    //             });
    //         }

    //     });
    // }
    // getActiveSetups(eachSetup) {
    //     if (this.ActiveSetups != undefined) {
    //         this.ActiveSetups.forEach(config => {
    //             this.selectedMember.forEach(member => {

    //                 if (member.key == config.MemberKey) {
    //                     if (config.IsActive == true && config.SetupKey == eachSetup.Key) {

    //                         this.IsThereAnyActiveSetup = true;

    //                         config["Price"] = config.Amount
    //                         config["OptionName"] = eachSetup.OptionName
    //                         config["Name"] = eachSetup.Name
    //                         config["subsOn"] = false
    //                         if (config['Subscriptions']) {
    //                             this.comonService.convertFbObjectToArray(config['Subscriptions'].SubscriptionDetails).forEach(sub => {
    //                                 sub['Date'] = moment(new Date(+sub.Key)).format("MMM-YYYY")
    //                                 if (sub.IsPaid && config.subsDetail.subsOn) {
    //                                     config["subsOn"] = true

    //                                 }
    //                             });
    //                         }

    //                         config["MaxNoOfMember"] = eachSetup.MaxNoOfMember
    //                         config["MinNoOfMember"] = eachSetup.MinNoOfMember
    //                         config["Validity"] = moment(config.Validity).format("DD/MM/YYYY")
    //                         config["TimePayments"] = eachSetup.TimePayments;
    //                         config["CurrentPayment"] = config.PaymentOptions;
    //                         config["DisplayName"] = config.DisplayName;
    //                         config["CreatedDate"] = eachSetup.CreatedDate;
    //                         this.ActiveSetupDispaly.push(config)
    //                     }
    //                 }
    //             })
    //         })


    //     }

    // }


    gotoMembership() {
        this.navCtrl.push("RecommendedmembershipPage")
    }

    presentActionSheet(eachSetup: MemberShipUser) {
        const actionSheet = this.actionSheetCtrl.create({
            //  title: 'Send Report',
            buttons: [
                {
                    text: 'Edit Membership',
                    handler: () => {
                        // if (!eachSetup.IsPaid && !eachSetup.subsOn) {
                        // if (eachSetup.membership_packages[0].subscription_status == 0) {
                        //     this.gotoassignmembership(eachSetup)
                        // } 
                        if(eachSetup.membership_package.enrolled_count < eachSetup.max_member || eachSetup.membership_packages[0].subscription_status == 0){
                            this.gotoassignmembership(eachSetup)
                        }
                        else {
                            if(eachSetup.membership_package.enrolled_count >= eachSetup.max_member){
                                this.comonService.toastMessage("No family member(s) left to add", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                                return false;
                            }
                            this.comonService.toastMessage("You can't modify the paid membership", 2500,ToastMessageType.Error,ToastPlacement.Bottom);
                        }

                    }
                },
                {
                    text: 'Change Fees',
                    handler: () => {
                        // if (!eachSetup.IsPaid && !eachSetup.subsOn) {
                        if (eachSetup.membership_packages[0].subscription_status == 0) {
                            this.goassignpayment(eachSetup)
                        } else {
                            this.comonService.toastMessage("You can't modify the paid membership", 2500,ToastMessageType.Error,ToastPlacement.Bottom)
                        }
                    }
                },
                // {
                //     text: 'Admin Fees',
                //     handler: () => {
                //         // if (!eachSetup.IsPaid && !eachSetup.subsOn) {
                //         if (eachSetup.membership_packages[0].subscription_status == 0) {
                //             this.goassignpayment(eachSetup, 'adminfees')
                //         } else {
                //             this.showToast("you can't modify the paid membership", 3000)
                //         }

                //     }
                // },

            ]
        });
        actionSheet.present();
    }

    goassignpayment(eachSetup:MemberShipUser) {
        this.navCtrl.push("EditFeesMembershipPage", { eachSetup: eachSetup,  clubId: this.inputObj.clubId,memberId: this.FamilyMember.Id, ParentClubKey: this.ParentClubKey })
    }

    getFilterItems(ev: any) {
        // Reset items back to all of the items
        this.initializeItems();

        // set val to the value of the searchbar
        let val = ev.target.value;

        // if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.SetupDisplay = this.filterSetup.filter((item) => {
                if (item.Name != undefined) {
                    return (item.Name.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
                else if (item.SetupName != undefined) {
                    return (item.SetupName.toLowerCase().indexOf(val.toLowerCase()) > -1);
                }
            })
        }
    }
    initializeItems() {
        this.filterSetup = this.Setups;
        this.SetupDisplay = this.Setups;
    }

    gotoassignmembership(eachSetup:MemberShipUser) {
        this.navCtrl.push("EditmembershipPage", { Isnew:false, clubId: this.inputObj.clubId,memberId: this.FamilyMember.Id, membership_id: eachSetup.id })
    }

    gotoassignfromrecommended(eachSetup: MemberShipData) {
        this.navCtrl.push("AssignmembershipsPage", {Isnew:true, clubId: this.inputObj.clubId, memberId: this.FamilyMember.Id, membership_id: eachSetup.id })
    }

    ionViewWillLeave(){
        this.comonService.updateCategory("");
    }


}

