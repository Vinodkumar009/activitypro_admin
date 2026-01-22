import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseService } from '../../../../services/firebase.service';
import { Storage } from '@ionic/storage';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
import * as $ from 'jquery';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { AppType } from '../../../../shared/constants/module.constants';
import { HttpService } from '../../../../services/http.service';
import { SharedServices } from '../../../services/sharedservice';
import { API } from '../../../../shared/constants/api_constants';
import { ParentclubStripeAccounts } from '../stripeconnectsetuplist/stripeconnectsetuplist';
import { ClubVenueDto, GetParentClubVenuesRequestDto, GetParentClubVenuesResponseDto } from '../../../../shared/dtos/club.dto';
import { GraphqlService } from '../../../../services/graphql.service';
import { Activity, ClubActivityInput } from '../../../../shared/model/club.model';
import gql from "graphql-tag";

interface ActivityItem {
  $key: string;
  ActivityName: string;
  ClubKey: string;
  isSelect: boolean;
}

interface ExtendedClubVenue extends ClubVenueDto {
  $key: string;
  isSelect: boolean;
  Activity?: ActivityItem[];
}

/**
 * Generated class for the CreatestripeconnectsetupPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-createstripeconnectsetup',
  templateUrl: 'createstripeconnectsetup.html',
  providers:[HttpService]
})
export class CreatestripeconnectsetupPage {
  show_selection_view:boolean = true;
  selected_account_id:string = "";
  instructions_arry:Array<{text:string}> = [
    {text:"Select Venue(s) and Activity(ies)"},
    {text:"Enter a name for future reference"},
    {text:"Click on the Link Stripe Account"},
    {text:"Login using your existing Stripe Account or Open a New Stripe Account"},
    {text:"Follow the instructions on the Stripe page"},
    {text:"Once done successfully your Stripe account is ready for accepting payment for the selected venue(s) and activity(ies)"}
  ];
  club_activities:Activity[] = [];
  setupDetails: any;
  setup_type: number = 2;
  setupSet: Set<any> = new Set();
  allClub: ExtendedClubVenue[] = [];
  parentClubKey: string = '';
  isSelectAll: boolean = false;
  previousParams: string = '';
  activityList: ActivityItem[] = [];
  selectedActivity: any;
  divheight: number = 0;
  height: number = 80.8;
  widthofact: number = 0;
  stripeConfigDetails: any = {};
  state_key: string = '';
  uniqueStripeAccounts: ParentclubStripeAccounts[] = [];
  setupObj = {
    setupType: '',
    name: '',
    parentclubKey: '',
    data: []
  }
  constructor(private iab: InAppBrowser,
    public navCtrl: NavController, 
    public comonService: CommonService, storage: Storage,
     public fb: FirebaseService, public navParams: NavParams,
     public sharedservice: SharedServices,
     private httpService:HttpService,
     private graphqlService: GraphqlService,) {
    this.setupDetails = this.navParams.get('setupDetails')
    this.setup_type = +this.navParams.get('setup_type');
    storage.get('userObj').then((val) => {
      val = JSON.parse(val);
      for (let club of val.UserInfo)
        if (val.$key != "") {
          this.parentClubKey = club.ParentClubKey;
          if(this.setup_type === 2){
            this.getParentClubUniqueStripeAccounts();
          }
          this.getClubList()
          this.getStripeConfig();
        }
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreatestripeconnectsetupPage');
  }

  selectActivity(club: ExtendedClubVenue, activity: ActivityItem): void {
    if (club.Activity) {
      club.Activity.forEach(act => {
        if (act.ActivityName === activity.ActivityName) {
          act.isSelect = !act.isSelect;
        }
      });
    }
  }

  selectVenue(event: ExtendedClubVenue | string): void {
    const clubsToLoadActivities: string[] = [];

    if (this.previousParams === 'All' && event !== 'All') {
      this.isSelectAll = false;
      this.allClub.forEach(club => {
        if (typeof event !== 'string' && club.ClubName === event.ClubName) {
          club.isSelect = true;
          if (!club.Activity) {
            clubsToLoadActivities.push(club.$key);
          }
        } else {
          club.isSelect = false;
        }
      });
    } else if (event === 'All') {
      this.isSelectAll = !this.isSelectAll;
      this.allClub.forEach(club => {
        club.isSelect = this.isSelectAll;
        if (this.isSelectAll && !club.Activity) {
          clubsToLoadActivities.push(club.$key);
        }
      });
    } else {
      this.allClub.forEach(club => {
        if (typeof event !== 'string' && club.ClubName === event.ClubName) {
          club.isSelect = !club.isSelect;
          if (club.isSelect && !club.Activity) {
            clubsToLoadActivities.push(club.$key);
          }
        }
      });
    }

    // Load activities only for clubs that don't have them cached
    if (clubsToLoadActivities.length > 0) {
      this.loadActivitiesForClubs(clubsToLoadActivities);
    }

    this.previousParams = event === 'All' ? 'All' : (typeof event !== 'string' ? event.ClubName : '');
  }

  getStripeConfig(): void {
    this.fb.getAllWithQuery('ActivityPro', { orderByKey: true, equalTo: "StripeConfigDetails" }).subscribe((data) => {
      if (data && data.length > 0) {
        this.stripeConfigDetails = data[0];
      }
    });
  }

  // Load activities for multiple clubs efficiently
  loadActivitiesForClubs(clubKeys: string[]): void {
    clubKeys.forEach(clubkey => {
      this.club_activities = [];
      const club_activity_input: ClubActivityInput = {
        ParentClubKey: this.parentClubKey,
        ClubKey: clubkey,
        VenueKey: clubkey,
        AppType: 0, // 0-Admin
        DeviceType: this.sharedservice.getPlatform() === 'android' ? 1 : 2 // 1-android, 2-IOS
      };

      const clubs_activity_query = gql`
        query getAllActivityByVenue($input_obj: VenueDetailsInput!){
          getAllActivityByVenue(venueDetailsInput:$input_obj){
            ActivityCode
            ActivityName
            ActivityImageURL
            FirebaseActivityKey
            ActivityKey
            PriceSetup{
              IsActive
              MemberPricePerHour
              NonMemberPricePerHour
            }
          }
        }
      `;

      this.graphqlService.query(clubs_activity_query, { input_obj: club_activity_input }, 0)
        .subscribe({
          next: (res: any) => {
            if (res.data.getAllActivityByVenue && res.data.getAllActivityByVenue.length > 0) {
              const activities: ActivityItem[] = res.data.getAllActivityByVenue.map((activity: Activity) => ({
                ...activity,
                $key: activity.ActivityKey,
                ClubKey: clubkey,
                isSelect: false
              }));

              this.allClub.forEach(venue => {
                if (venue.$key === clubkey) {
                  venue.Activity = activities;
                  
                  // Update divheight if this venue is selected and has more activities
                  if (venue.isSelect && this.divheight < activities.length) {
                    this.divheight = activities.length;
                  }
                }
              });

              this.divCalculate();
            } else {
              const clubName = this.allClub.find(club => club.$key === clubkey).ClubName;
              this.comonService.toastMessage(
                `No activities found for ${clubName}`,
                2500,
                ToastMessageType.Error,
                ToastPlacement.Bottom
              );
            }
          },
          error: (error) => {
            console.error('Error fetching activities:', error);
            this.comonService.toastMessage(
              'Failed to load activities',
              2500,
              ToastMessageType.Error,
              ToastPlacement.Bottom
            );
          }
        });
    });
  }

  // Keep this method for backward compatibility
  getActivity(clubkey: string): void {
    this.loadActivitiesForClubs([clubkey]);
  }

  getParentClubUniqueStripeAccounts(): void {
    const stripeacc_payload = {
      parentclubId: this.parentClubKey,
      app_type: AppType.ADMIN_NEW,
      device_id: this.sharedservice.getDeviceId(),
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      action_type: 1,
    };
    
    this.httpService.post(API.GET_PARENTCLUB_STRIPES, stripeacc_payload).subscribe({
      next: (res: any) => {
        console.table(res.data);
        this.uniqueStripeAccounts = res.data as ParentclubStripeAccounts[];
        if (this.uniqueStripeAccounts.length > 0) {
          this.selected_account_id = this.uniqueStripeAccounts[0].setup_id;
        }
      }
    });
  }
  

  divCalculate(): void {
    this.height = 80.8;
    const slideWidth = $("#ionslide").width();
    this.widthofact = slideWidth ? slideWidth / 1.2 : 0;
    
    if (this.divheight === 1) {
      this.height = 109.8;    
    } else if (this.divheight > 1) {
      this.height = this.height + this.divheight * 33;
    }
  }



  getClubList(): void {
    const body: GetParentClubVenuesRequestDto = {
      parentclub_id: this.sharedservice.getPostgreParentClubId(),
      app_type: AppType.ADMIN_NEW,
      device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
      device_id: this.sharedservice.getDeviceId() || 'web',
      updated_by: this.sharedservice.getLoggedInUserId()
    };

    this.httpService.post(API.GET_PARENT_CLUB_VENUES, body, null, 1).subscribe({
      next: (res: GetParentClubVenuesResponseDto) => {
        if (res.data && res.data.length > 0) {
          this.allClub = res.data.map(club => ({
            ...club,
            $key: club.FirebaseId,
            isSelect: false
          })) as ExtendedClubVenue[];
        }
      },
      error: () => {
        this.allClub = [];
      }
    });    
  }


  addSetupMenu(setup: any): void {
    if (this.setupSet.has(setup)) {
      this.setupSet.delete(setup);
    } else {
      this.setupSet.add(setup);
    }
  }
  
  async addSetup(): Promise<void> {
    this.setupObj.parentclubKey = this.parentClubKey;
    this.setupObj.setupType = this.setupDetails.SetupName;
    
    const reqObj: Array<{ clubKey: string; activityKey: string }> = [];
    
    this.allClub.forEach((club) => {
      if (club.isSelect) {
        const obj = {
          clubKey: club.$key,
          activityKey: ''
        };
        
        let selectedActivity = 0;
        if (club.Activity) {
          club.Activity.forEach((activity) => {
            if (activity.isSelect) {
              selectedActivity++;
              obj.activityKey += activity.$key + ' ';
            }
          });
        }
        
        if (selectedActivity > 0) {
          reqObj.push(obj);
        }
      }
    });
    
    this.setupObj.data = reqObj;
    
    if (!this.setupObj.name || this.setupObj.name.trim() === '') { 
      this.comonService.toastMessage('Please enter account name', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return;
    }
    
    if (reqObj.length === 0) {
      this.comonService.toastMessage('Please select at least a venue and activity', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      return;
    }
    
    this.state_key = await this.fb.saveReturningKey('StripeConnectAccountStates', { data: JSON.stringify(this.setupObj) });
    
    if (this.setup_type === 1) {
      const browser = this.iab.create(
        `${this.stripeConfigDetails.AuthURL}&scope=read_write&client_id=${this.stripeConfigDetails.ClientId}&state=${this.state_key}`,
        '_blank'
      );
      browser.on('exit').subscribe(() => {
        this.navCtrl.pop();
      });
    } else {
      this.show_selection_view = false;
    }
  }

  // Copy existing stripe account
  copyStripeAccount(): void {
    this.comonService.commonAlert_V5(
      'Copy Stripe Account', 
      'Are you sure you want to copy the existing stripe account?', 
      'Yes', 
      'No', 
      (agreed: boolean) => {
        if (agreed) {
          const stripeacc_payload = {
            parentclubId: this.parentClubKey,
            app_type: AppType.ADMIN_NEW,
            device_id: this.sharedservice.getDeviceId(),
            device_type: this.sharedservice.getPlatform() === 'android' ? 1 : 2,
            action_type: 1,
            state_key: this.state_key,
            setup_id: this.selected_account_id
          };
          
          this.httpService.post(API.COPY_PARENTCLUB_STRIPE_ACCOUNT, stripeacc_payload).subscribe({
            next: (res: any) => {
              console.table(res.data);
              this.navCtrl.pop();
            }
          });
        }
      }
    );
  }

  accountNameHint(): void {
    const message = 'Please enter a description of the Stripe account for the selected Venue and Activities for future reference';
    this.comonService.toastMessage(message, 2500, ToastMessageType.Info, ToastPlacement.Bottom);
  }

  // Helper method to check if any selected club has activities
  hasSelectedClubsWithActivities(): boolean {
    return this.allClub.some(club => club.isSelect && club.Activity && club.Activity.length > 0);
  }
}


