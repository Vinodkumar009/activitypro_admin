import { Component, ViewChild } from '@angular/core';
import { IonicPage,Select, Content, NavController, Platform, NavParams, AlertController, ToastController, ActionSheetController, ModalController, } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpClient } from '@angular/common/http';
import { CommonService, ToastPlacement, ToastMessageType } from "../../../../services/common.service";
import { SharedServices } from '../../../services/sharedservice';
import { FirebaseService } from '../../../../services/firebase.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import * as moment from 'moment';
import { File, FileEntry } from '@ionic-native/file';
import { FileOpener } from '@ionic-native/file-opener';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import * as _ from "lodash";
declare var google: any;
import { first } from 'rxjs/operators';
import { HttpService } from '../../../../services/http.service';
import { API } from '../../../../shared/constants/api_constants';
import { Addon, BookingData, BookingStatsInputDTO, CouponDiscount, Discount, EventDiscountCouponInputDTO, EventDiscountInputDTO, EventEntity, EventInfo, EventLocation, EventStats, EventTicket, EventTicketsDto, EventTypes, GetBookingListInputDTO, GetEventDetsInputDTO, ParentclubStripeAccounts, TicketCategory, UpdateAddOnInputDto, UpdateEventInputDto, UpdateEventTicketDto, UpdateTicketTypeDto, UserBookings } from '../model/event.model';
import { AppType, ModuleTypes } from '../../../../shared/constants/module.constants';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IClubDetails } from '../../session/sessions_club.model';
import gql from 'graphql-tag';
import { GraphqlService } from '../../../../services/graphql.service';
import { Camera, PictureSourceType, CameraOptions } from '@ionic-native/camera';
import { EventImageUploadService } from '../imageupload/eventimageupload.service';
import { inputPlaceholderMap, inputTypeMap, titleMap } from '../../../../shared/constants/event.constants';



/**
 * Generated class for the EventdetailsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-eventdetails',
  templateUrl: 'eventdetails.html',
  providers: [HttpService, EventImageUploadService]
})
export class EventdetailsPage {
  isActive:boolean = false;
  maxDate:string = '';
  discount_type: number = 1;
  discount_coupon_type: number = 1;
  isPopupVisible: boolean = false;
  showEventInfo: boolean = true;
  Policies = {
    PolicyTitle: "",
    Description: "",
    PolicyDocs: []
  };
  eventTypes: EventTypes[] = [];
  category: TicketCategory;
  can_summary_update: boolean = false;
  can_description_update: boolean = false;
  eventDetails: EventInfo | null = null;
  showTicketContent: boolean = false;
  showAddOns: boolean = false;
  isAddonPopupVisible: boolean = false;
  isDiscountPopupVisible: boolean = false;
  isCouponDiscountPopupVisible: boolean = false;
  isCustomDiscountPopupVisible: boolean = false;
  selected_addon: Addon;
  showDiscountSection: boolean = false;
  discounts: Discount[];
  coupon_discounts: CouponDiscount[];
  user_bookings: UserBookings;
  tot_tkts_sold: any = 0;
  tot_event_rev: any = 0;
  selectedType: boolean = true;
  IsShowDescPara: boolean = false;
  IsShowSumaryPara: boolean = false;
  monthArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
  googleApiKey: string;
  event_title: string = "";
  //evntDetails: any;
  nestUrl: string = "";
  ParentClubKey: any;
  ParentClubName: string = "";
  currencyDetails: any;
  EventDescription: SafeHtml;
  EventSummary: SafeHtml;
  //rootNavCtrl:any;
  currencycode: string = "";
  isMultiDay: boolean = false;
  postgre_parentclub_id: string = "";
  event_stats: EventStats;
  eventId: string;
  date: string = "";
  month: string = "";
  event_status: boolean = false;
  eventsDto = {
    event_id: '',
    updated_by: '',
    currency: ''
  }
  is_discounts_avail: boolean = false;
  is_coupon_discounts_avail: boolean = false;
  discount_apply_strategy: boolean = false;
  min: any;
  max: any;
  ticketInfo: EventTicket[];
  addons: Addon[];
  event_stripes: ParentclubStripeAccounts[] = [];
  selectedAccount: string = "";
  selected_discount: Discount;
  selected_discount_coupon: CouponDiscount;
  booking_until: string;
  eventLocation: EventLocation[] = []
  clubs: IClubDetails[]=[];
  selectedClub: any;
  postgre_parentclub: string;
  @ViewChild('mySelect') mySelect: Select;
  eventActionObj = { isActive: true, isTitleEvent: false, isDraft: true, EventKey: "", ParentClubKey: "" };
  constructor(public navCtrl: NavController, private graphqlService: GraphqlService, 
    private camera: Camera,
    public navParams: NavParams, public alertCtrl: AlertController, 
    private imageUploadService: EventImageUploadService,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController, public commonService: CommonService,
    public fb: FirebaseService, public storage: Storage,
    public sharedService: SharedServices, public actionSheetCtrl: ActionSheetController,
    public iab: InAppBrowser, private platform: Platform,
    private file: File, private fileTransfer: FileTransfer,
    private fileOpener: FileOpener,
    private sanitizer: DomSanitizer,
    private httpService: HttpService,
    ) {
    this.eventId = navParams.get('event_id');
    this.eventsDto.event_id = this.eventId;
    //console.log(this.eventDetails);

    this.min = new Date().toISOString();
    this.max = "2049-12-31";
    this.eventsDto.updated_by = this.sharedService.getLoggedInId();
    this.postgre_parentclub = this.sharedService.getPostgreParentClubId();
    Promise.all([
      this.storage.get('userObj'),
      this.storage.get('Currency'),
      this.storage.get('postgre_parentclub')
    ]).then(([userObj, currencyDetails, postgre_parentclub]) => {
      if (userObj) {
        const val = JSON.parse(userObj);
        if (val.$key != "") {
          this.ParentClubKey = val.UserInfo[0].ParentClubKey;
        }
      }
      if (currencyDetails) {
        this.currencyDetails = JSON.parse(currencyDetails);
        this.eventsDto.currency = this.currencyDetails.CurrencySymbol;
      }
      if (postgre_parentclub) {
        this.postgre_parentclub_id = postgre_parentclub.Id;
        this.getBookingStats();
        this.getEventDetails(this.eventsDto);
        this.getEventLocations();
        this.editVenue();
        this.getEventTypes();
      }
    }).catch(error => {
      console.error("Error fetching storage data:", error);
    });
  }

  ionViewWillEnter() {
    this.nestUrl = this.sharedService.getnestURL();
  }

  changeTab(tab: boolean) {
    this.selectedType = tab;
    if (!this.selectedType) {
      this.getBookingInfo();
    } else {
      this.getMap();
    }
  }


  getEventDetails(update_input: Partial<GetEventDetsInputDTO>) {
    this.commonService.showLoader("Please wait")
    if (!this.eventsDto.currency) {
      console.error("Currency is missing!");
      return;
    }
    Object.assign(update_input, {
      parentclubId: this.postgre_parentclub_id,
      device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
      updated_by: this.sharedService.getLoggedInId(),
      device_id: this.sharedService.getDeviceId() || "",
      app_type: AppType.ADMIN_NEW
    })
    const eventDetsDTO = new GetEventDetsInputDTO(update_input);
    console.log("Input for events:", JSON.stringify(this.eventsDto));
    this.httpService.post(`${API.GET_EVENT_DETAILS}`, eventDetsDTO).subscribe((res: any) => {
      this.commonService.hideLoader();
      if (res && res.data && res.data.event_info) {
        try {
          this.eventDetails = res.data.event_info;
          this.selectedAccount = this.eventDetails.payment_method_id || "";
          this.maxDate = moment(this.eventDetails.transformed_end_date,"DD MMM YYYY").format("YYYY-MM-DD");
          this.isMultiDay = moment(this.eventDetails.start_date).isSame(this.eventDetails.end_date);
          this.booking_until = moment(this.eventDetails.booking_until).format("YYYY-MM-DD");
          this.is_discounts_avail = res.data.discounts.length > 0 ? true : false;
          this.is_coupon_discounts_avail = res.data.coupon_discounts.length > 0 ? true : false;
          this.event_status = this.eventDetails.status === 1 ? true : false;
          this.eventDetails.description = this.eventDetails.description.replace(/(?:\r\n|\r|\n)/g, '<br>');
          this.eventDetails.summary = this.eventDetails.summary.replace(/(?:\r\n|\r|\n)/g, '<br>');
          this.ticketInfo = res.data.tickets;
          this.discounts = res.data.discounts;
          this.discount_apply_strategy = this.eventDetails.discount_apply_strategy === 1 ? true : false;
          this.coupon_discounts = res.data.coupon_discounts;
          this.getMap();

          if(this.eventDetails.is_paid){
            this.checkForStripeAccounts();
          }

          if (this.ticketInfo.length > 0) {
            let counter = 0;
            this.ticketInfo.forEach((ticket: EventTicket) => {
              ticket.is_selected = false; // Default state
              ticket.is_available = ticket.categories.some(ctg => +ctg.capacity > 0); // Default availability
              ticket.categories = ticket.categories || []; // Ensure categories exist
              ticket.categories.forEach((category: TicketCategory,ind:number) => {
                category.category_identifier = `${category.category_id}_${new Date().getTime()}_${counter++}`; // Default state for each category
              });
            });
          }

          this.addons = res.data.addons;
          this.EventSummary = this.sanitizer.bypassSecurityTrustHtml(this.eventDetails.summary.replace(/\\n|[\r\n]/g, '<br>')) as string;
          this.EventDescription = this.sanitizer.bypassSecurityTrustHtml(this.eventDetails.description.replace(/\\n|[\r\n]/g, '<br>')) as string;
          //const match = this.eventDetails.transformed_start_date.match(/(\d{1,2}) (\w{3})/);
        } catch (err) {
          this.commonService.hideLoader();
        }
      } else {
        console.error("event info not found", res);
        this.commonService.toastMessage("Event info not found", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }, error => {
      this.commonService.hideLoader();
      this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    });
  }

  checkForStripeAccounts(){
    this.commonService.showLoader("Please wait");
    this.getEventStripes().then((stripe_accounts:ParentclubStripeAccounts[]) => {
      this.event_stripes = stripe_accounts;
      this.commonService.hideLoader();
        if (this.event_stripes.length > 0) {
          if (this.selectedAccount!='') {
            const selected_account = this.event_stripes.find((stripe: ParentclubStripeAccounts) => stripe.payment_method_id === this.eventDetails.payment_method_id);
            this.selectedAccount = selected_account.payment_method_id;
          } else {
            this.selectedAccount = this.event_stripes[0].payment_method_id;
            this.selectEventStripe();
          }
        }else{
          this.selectedAccount = '';
          //this.commonService.toastMessage("No stripe account(s) found", 2500, ToastMessageType.Info, ToastPlacement.Bottom);
          const status_text = `No stripe account(s) found. Do you want to connect stripe?`;
            this.commonService.commonAlert_V5("Stripe Setup", status_text, "Yes", "No", (res) => {
              if(res){
                this.navigateToStripeSetUp();
              }
            });
        }
    }).catch((error) => {
      this.commonService.hideLoader();
      console.error("Error fetching accounts:", error);
        if (error.error.message) {
          this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        } else {
          this.commonService.toastMessage('Accounts fetch failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
    })
  }

  getEventLocations() {
    console.log("event location api called");
    this.httpService.post(`${API.GET_EVENT_LOCATIONS}`, this.eventsDto).subscribe((res: any) => {
      if (res) {
        this.eventLocation = res.data;
        console.log("res for event location", JSON.stringify(res.data));
      } else {
        console.log("error in fetching",)
      }
    })
  }

  validateEvent(): boolean {
    if (this.eventDetails.is_paid) {
      // Check if Stripe account is selected
      if (this.selectedAccount == '') {

        this.commonService.toastMessage("Please select a stripe account", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }

      // Check if any ticket type is selected
      const isTicketTypeSelected = this.ticketInfo.some(ticket => ticket.is_available);

      if (!isTicketTypeSelected) {

        this.commonService.toastMessage("Please choose a ticket type", 2500, ToastMessageType.Error);
        return false;
      }
    }
    // Check if ticket category has capacity
    const isTicketCatgCapacityAvail = this.ticketInfo.some(ticket =>
      ticket.is_available && ticket.categories.some(catg => Number(catg.capacity) > 0)
    );

    if (!isTicketCatgCapacityAvail) {

      this.commonService.toastMessage("Please ensure capacity or price is provided for the selected ticket types", 2500, ToastMessageType.Error);
      return false;
    }


    return true; // If not paid or all validations pass
  }

  //validating amount for when ticket price change
  validateAmount(ev: any) {
    return this.commonService.validateNumber(ev.target.value);
  }

  handleSpeakerStatus() {
    // const checkbox = event.target as HTMLInputElement;
    setTimeout(() => {
      let event_status_input: Partial<UpdateEventInputDto>;
      event_status_input = {
        speaker_trainer_avail: this.eventDetails.is_speaker_trainer_avail
      };
      this.updateEventInfo(event_status_input).then(() => {
          this.commonService.toastMessage("Status updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
      }).catch((err) => {
          this.eventDetails.is_speaker_trainer_avail =!this.eventDetails.is_speaker_trainer_avail;
          if (err.error.message) {
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage('Failed to update event', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
      });
    }, 100);
  }

  handleStatusChange() {
    // const checkbox = event.target as HTMLInputElement;
    setTimeout(() => {
      //const newStatus = this.event_status;
      if (this.event_status) {
        if (!this.validateEvent()) {
          this.event_status = false; // Update the bound property
          return;
        }
      } 

      // Update status only if validation passes
      //this.event_status = newStatus;
      this.updateEventStatus();
    }, 100);
  }

  updateEventStatus() {
    const status_text = `Are you sure you want to ${this.event_status ? 'make the event to LIVE?':'DRAFT the event?'}`;
    this.commonService.commonAlert_V5("Event Status", status_text, "Yes", "No", (res) => {
      if(res){
        let event_status_input: Partial<UpdateEventInputDto>;
        event_status_input = {
          event_status: this.event_status ? 1 : 0
        };
        this.updateEventInfo(event_status_input).then(() => {
            this.commonService.toastMessage("Status updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        }).catch((err) => {
            if (err.error.message) {
              this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            } else {
              this.commonService.toastMessage('Failed to update event', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
        });
      }else{
        this.event_status = !this.event_status;
      }
    });
  }

  editEventName(type: string, value: string) {
    const title = 'Edit Event Name';
    const inputPlaceholderMap = {
      eventName: 'Enter new event name',
    };
    const inputTypeMap = {
      eventName: 'text',
    };

    const inputPlaceholder = inputPlaceholderMap[type];
    const inputType = inputTypeMap[type];
    const cancelButtonText = "Cancel";
    const updateButtonText = "Update";
    const default_value = value;

    this.commonService.presentDynamicAlert(
      title,
      "",
      inputPlaceholder,
      cancelButtonText,
      updateButtonText,
      default_value,
      inputType,
      async (inputValue: string) => {
        try {
          // Construct the input DTO
          const event_input: Partial<UpdateEventInputDto> = {
            event_name: inputValue,
          };

          // Update event information
          await this.updateEventInfo(event_input);
          // Show success message
          this.commonService.toastMessage("Updated successfully",2500,ToastMessageType.Success,ToastPlacement.Bottom);
          // Update the local event name to reflect changes
          this.eventDetails.event_name = inputValue;
        } catch (error) {
          const errorMessage = error.message || "Failed to update event";
          this.commonService.toastMessage(errorMessage,2500,ToastMessageType.Error,ToastPlacement.Bottom);
          console.error("Error updating event:", error);
        }
      }
    );
  }

  getEventTypes() {
    console.log("input for events", this.eventsDto)
    this.httpService.post(`${API.GET_EVENTS_TYPES}`, this.eventsDto).subscribe((res: any) => {
      if (res) {
        this.eventTypes = res.data;
        console.log("res for event type", JSON.stringify(res.data));
      } else {
        console.log("error in fetching",)
      }
    })
  }

  editVenue() {
    const clubs_input = {
      parentclub_id: this.sharedService.getPostgreParentClubId(),
      user_postgre_metadata: {
        UserMemberId: this.sharedService.getLoggedInId()
      },
      user_device_metadata: {
        UserAppType: 0,
        UserDeviceType: this.sharedService.getPlatform() == "android" ? 1 : 2
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
        this.selectedClub = this.clubs[0].FirebaseId;


        if (this.clubs.length > 0) {
        //  this.presentVenueAlert();

        }

      },
        (error) => {
          this.commonService.toastMessage("No venues found", 2500, ToastMessageType.Error)
          console.error("Error in fetching:", error);
        })
  }

  //update event group status
  updateEventDiscountStatus() {
    setTimeout(() => {
      let can_update: boolean = false;
      const title_text = this.discounts.length > 0 ? "Existing discount(s) wil be deleted, Do you want to remove ?" : "Do you want to remove";
      if (this.is_discounts_avail) {
        if (!this.validateEvent()) {
          this.is_discounts_avail = !this.is_discounts_avail;
          return;
        }
      }
      const status_text = title_text;
      this.commonService.commonAlert_V4("Discount update", status_text, "Update", "Cancel", (res) => {
        const event_status_input: Partial<UpdateEventInputDto> = {
          event_status: this.is_discounts_avail ? 1 : 0,
        }
      })
    }, 100);
  }

  updateEventCouponStatus() {
    setTimeout(() => {
      let can_update: boolean = false;
      const title_text = this.discounts.length > 0 ? "Existing coupons(s) wil be deleted, Do you want to remove ?" : "Do you want to remove";
      if (this.is_coupon_discounts_avail) {
        if (!this.validateEvent()) {
          this.is_coupon_discounts_avail = !this.is_coupon_discounts_avail;
          return;
        }
      }
      const status_text = title_text;
      this.commonService.commonAlert_V4("Coupon update", status_text, "Update", "Cancel", (res) => {
        const event_status_input: Partial<UpdateEventInputDto> = {
          event_status: this.is_discounts_avail ? 1 : 0,
        }
      })
    }, 100);
  }

  OpenSocialLinks(url: string | null | undefined): void {
    if (!url) {
      console.warn('Social media URL is missing or invalid.');
      return;
    }
    // Clean the URL of any unnecessary whitespace
    const sanitizedUrl = url.trim();
    // Use Ionic's InAppBrowser to open the sanitized URL
    this.iab.create(sanitizedUrl, '_blank');
  }

  expandCard(item: EventTicket): void {
    // Toggle the selected state of the clicked ticket
    this.ticketInfo.forEach(listItem => {
      listItem.is_selected = listItem === item ? !listItem.is_selected : false;
      if (listItem.is_selected) {
        listItem.is_available = true; // Ensure it's available when expanded
      }
    });
  }

  //checking it's a paid or free event
  checkIsPaid() {
    // const checkbox = event.target as HTMLInputElement;
    // const newStatus = checkbox.checked;
    setTimeout(() => {
      if(this.eventDetails.is_paid){
        this.commonService.showLoader("Please wait")
        this.getEventStripes().then((res: ParentclubStripeAccounts[]) => {
          this.event_stripes = res as ParentclubStripeAccounts[];
          this.commonService.hideLoader();
          if (this.event_stripes.length > 0) {
            this.updatePaidStatus();
          } else {
            //this.commonService.toastMessage("No stripe account(s) found", 2500, ToastMessageType.Info, ToastPlacement.Bottom);
            const status_text = `No stripe account(s) found. Do you want to attach?`;
              this.commonService.commonAlert_V5("Stripe Setup", status_text, "Yes", "No", (res) => {
                if(res){
                  this.navigateToStripeSetUp();
                }
              });
          }
        }).catch((err) => {
          this.commonService.hideLoader();
          this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        })          
      }else{
        this.updatePaidStatus();
      }
    }, 100);
  }

  updatePaidStatus() {
    const status_text = `Are you sure you want to ${this.eventDetails.is_paid ? 'make the event as PAID?':'make the event as Free?'}`;
    this.commonService.commonAlert_V5("Event Status", status_text, "Yes", "No", (res) => {
      if(res){
        let event_status_input: Partial<UpdateEventInputDto>;
        event_status_input = {
          is_paid: this.eventDetails.is_paid
        };
        this.updateEventInfo(event_status_input).then(() => {
            this.commonService.toastMessage("Status updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        }).catch((err) => {
            this.eventDetails.is_paid = !this.eventDetails.is_paid;
            if (err.error.message) {
              this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            } else {
              this.commonService.toastMessage('Failed to update event', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
        });
      }else{
        this.eventDetails.is_paid = !this.eventDetails.is_paid;
      }
    });
  }

  //getting stripe accounts available for events
  getEventStripes() {
    return new Promise((resolve, reject) => {
      const accountsDto = {
        parentclubId: this.postgre_parentclub_id,
        clubId: this.eventDetails.club.Id,
        device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
        updated_by: this.sharedService.getLoggedInId(),
        device_id: this.sharedService.getDeviceId() || "",
        app_type: AppType.ADMIN_NEW
      }
      this.httpService.post<{ message: string, data: ParentclubStripeAccounts[] }>(`${API.GET_EVENT_STRIPE_ACCOUNTS}`, accountsDto)
        .subscribe({
          next: (res) => {
            resolve(res.data);
          },
          error: (err) => {
            reject(err);
          }
        });
    });

  }

  updateVenue(selected_venue:string){
    const updatedEvent: Partial<UpdateEventInputDto> = {
      club_id: selected_venue,
    };
    this.updateEventInfo(updatedEvent).then(() => {
      const venue = this.clubs.find(club => club.Id === selected_venue)
      this.eventDetails.club.Id = venue.Id;
      this.eventDetails.club.ClubName = venue.ClubName;
      this.eventDetails.club.FirebaseId = venue.FirebaseId;
      this.selectedAccount = "";
      this.commonService.toastMessage('Event venue updated', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    }).catch((err) => {
      if (err.message) {
        this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      } else {
        this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    })              
  }

  navigateToStripeSetUp(){
    const setup = {
      SetupName: "Events",
      DisplayName: "Events",
      VenueList: true,
      type:ModuleTypes.EVENTS,
      ImageUrl:"https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Fgroupsession.svg?alt=media&token=1f19b4aa-5051-4131-918d-4fa17091a7f9",
    };
    this.navCtrl.push("StripeconnectsetuplistPage", { setupDetails: setup });
  }

  //ticket type name change
  ChangeTicketLabel(ev: any, i: number) {
    if (ev.target.id === "tkttype_edit") {
      let alert = this.alertCtrl.create({
        title: 'Ticket Name',
        inputs: [
          {
            name: 'labelname',
            placeholder: 'Ticket Title Name',
            value: this.ticketInfo[i].ticket_type.name || ''
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            handler: data => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Change',
            handler: data => {
              if ((data.labelname != "")) {
                this.ticketInfo[i].ticket_type.name = data.labelname.trim();
                const ticket_type_input: Partial<UpdateTicketTypeDto> = {
                  ticket_id: this.ticketInfo[i].ticket_id,
                  label: data.labelname
                }
                this.updateTicketType(ticket_type_input);
              } else {
                this.commonService.toastMessage("Please enter ticket type name", 2500, ToastMessageType.Error);
                return false;
              }
            }
          }
        ]
      });
      alert.present()
    }
  }

  /******** updating ticket type label ********/
  updateTicketType(update_input: Partial<UpdateTicketTypeDto>) {
    Object.assign(update_input, {
      parentclubId: this.postgre_parentclub_id,
      device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
      updated_by: this.sharedService.getLoggedInId(),
      device_id: this.sharedService.getDeviceId() || "",
      app_type: AppType.ADMIN_NEW
    })
    const inputDTO = new UpdateTicketTypeDto(update_input);
    console.log(inputDTO);
    console.log("input for bookinginfo", inputDTO)
    this.httpService.post<{ data: any }>(`${API.UPDATE_EVENT_TICKET_TYPE}`, inputDTO)
      .subscribe({
        next: (res) => {
          console.log("updated event", JSON.stringify(res.data));
          this.commonService.toastMessage("Ticket type label updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        },
        error: (err) => {
          console.error("Error fetching events:", err);
          if (err.error.message) {
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage('Ticket type label update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        }
      });
  }

  /******* updating ticket category label ********/
  updateTicketCategoryType(update_input: Partial<UpdateTicketTypeDto>) {
    Object.assign(update_input, {
      parentclubId: this.postgre_parentclub_id,
      device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
      updated_by: this.sharedService.getLoggedInId(),
      device_id: this.sharedService.getDeviceId() || "",
      app_type: AppType.ADMIN_NEW
    })
    const inputDTO = new UpdateTicketTypeDto(update_input);
    console.log(inputDTO);
    console.log("input for bookinginfo", inputDTO)
    this.httpService.post<{ data: any }>(`${API.UPDATE_EVENT_TICKET_TYPE_CTG}`, inputDTO)
      .subscribe({
        next: (res) => {
          console.log("updated event", JSON.stringify(res.data));
          this.commonService.toastMessage("Ticket type category label updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        },
        error: (err) => {
          console.error("Error fetching events:", err);
          if (err.error.message) {
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage('Ticket type category label update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        }
      });
  }

  toggleTicketContent() {
    this.showTicketContent = !this.showTicketContent;
  }

  toggleAddOnContent() {
    this.showAddOns = !this.showAddOns;
  }

  editEventDates() {
    const min = new Date().toISOString();
    const max = "2049-12-31";
    this.commonService.presentMultiInputDynamicAlert(
      'Edit Event Dates',
      [
        {
          name: 'start_date',
          type: 'date',
          min: min,
          max: max,
          value: moment(this.eventDetails.transformed_start_date, "DD MMM YYYY").format("DD-MM-YYYY"),
          placeholder: 'Start Date',
        },
        {
          name: 'end_date',
          type: 'date',
          min: min,
          max: max,
          value: moment(this.eventDetails.transformed_end_date, "DD MMM YYYY").format("DD-MM-YYYY"),
          placeholder: 'End Date',
        },
      ],
      [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => console.log('Date edit canceled'),
        },
        {
          text: 'Save',
          handler: (data) => {
            if(data.start_date && data.end_date) {
              console.log('Dates updated:', data);
              if(this.commonService.validateStartAndEndDate(data.start_date,data.end_date)){
                const updatedEvent: Partial<UpdateEventInputDto> = {
                  start_date: new Date(data.start_date).toISOString(),
                  end_date: new Date(data.end_date).toISOString(),
                };
                this.updateEventInfo(updatedEvent).then(() => {
                  this.eventDetails.transformed_start_date = moment(data.start_date).format("DD MMM YYYY");
                  this.eventDetails.transformed_end_date = moment(data.end_date).format("DD MMM YYYY");
                  this.commonService.toastMessage('Event dates updated', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                }).catch((err) => {
                  if (err.error.message) {
                    this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                  } else {
                    this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                  }
                });
              }
            } else {
              this.commonService.toastMessage("Please select the valid dates", 2500, ToastMessageType.Error, ToastPlacement.Bottom)
            }
          },
        },
      ]
    );
  }

  editEventTime() {
    let alert = this.alertCtrl.create({
      title: 'Edit Event Time',
      inputs: [
        {
          name: 'start_time',
          type: 'time',
          value: this.eventDetails.start_time,
          placeholder: 'Start Time',
        },
        {
          name: 'end_time',
          type: 'time',
          value: this.eventDetails.end_time,
          placeholder: 'End Time',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => console.log('Time edit canceled'),
        },
        {
          text: 'Save',
          handler: (data) => {
            if (data.start_time && data.end_time) {
              if(this.commonService.validateTime(data.start_time,data.end_time)){
                const updatedEvent: Partial<UpdateEventInputDto> = {
                  start_time: data.start_time,
                  end_time: data.end_time,
                };
                this.updateEventInfo(updatedEvent).then(() => {
                  this.eventDetails.start_time = data.start_time;
                  this.eventDetails.end_time = data.end_time;
                  this.commonService.toastMessage('Event time updated', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
                }).catch((err) => {
                  if (err.error.message) {
                    this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                  } else {
                    this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                  }
                });
              }
            } else {
              console.log('Invalid time input');
              this.commonService.toastMessage('Please select valid times', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
          },
        },
      ],
    });
    alert.present();
  }

  presentLocationAlert() {
    const alertInputs = this.eventLocation.map((location) => ({
      type: 'radio',
      label: location.name,
      value: location.name,
      checked: this.eventDetails.event_location === location.name,
    }));

    const alert = this.alertCtrl.create({
      title: 'Select Location',
      inputs: alertInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (selectedLocation) => {
            if (selectedLocation) {
              const location = this.eventLocation.find(loc => loc.name === selectedLocation)
              this.eventDetails.event_location = selectedLocation;
              const updatedEvent: Partial<UpdateEventInputDto> = {
                location_id: location.id,
                location_name: location.name,
                location_type: location.type
                //end_time: data.end_time,
              };

              this.updateEventInfo(updatedEvent).then(() => {
                this.eventDetails.location_id = location.id
                this.eventDetails.location = location.name
                this.eventDetails.location_type = location.type
                this.commonService.toastMessage('Event location updated', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              }).catch((err) => {
                if (err.error.message) {
                  this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                } else {
                  this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }
              })

            }
          },
        }
      ],
    });

    alert.present();
  }

  presentVenueAlert() {
    const alertInputs = this.clubs.map((club) => ({
      type: 'radio',
      label: club.ClubName,
      value: club.Id,
      checked: this.eventDetails.club.Id === club.Id,
    }));

    const alert = this.alertCtrl.create({
      title: 'Select Venue',
      inputs: alertInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (selectedVenue) => {
            if (selectedVenue) {
              if (this.eventDetails.is_paid) {
                this.commonService.showLoader("Please wait");
                this.getEventStripes().then((stripe_accounts:ParentclubStripeAccounts[]) => {
                  this.event_stripes = stripe_accounts;
                  this.commonService.hideLoader();
                    if (this.event_stripes.length > 0) {
                      if (this.selectedAccount!='') {
                        const selected_account = this.event_stripes.find((stripe: ParentclubStripeAccounts) => stripe.payment_method_id === this.eventDetails.payment_method_id);
                        this.selectedAccount = selected_account.payment_method_id;
                      } else {
                        this.selectedAccount = this.event_stripes[0].payment_method_id;
                        this.selectEventStripe();
                      }
                      this.updateVenue(selectedVenue);
                    }else{
                      //this.selectedAccount = '';
                      //this.commonService.toastMessage("No stripe account(s) found", 2500, ToastMessageType.Info, ToastPlacement.Bottom);
                      const status_text = `No stripe account(s) found. Do you want to connect stripe?`;
                        this.commonService.commonAlert_V5("Stripe Setup", status_text, "Yes", "No", (res) => {
                          if(res){
                            this.navigateToStripeSetUp();
                          }
                        });
                    }
                }).catch((error) => {
                  this.commonService.hideLoader();
                  console.error("Error fetching accounts:", error);
                    if (error.error.message) {
                      this.commonService.toastMessage(error.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                    } else {
                      this.commonService.toastMessage('Accounts fetch failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                    }
                })
              }else{
                this.updateVenue(selectedVenue);
              }
            }
          },
        }
      ],
    });

    alert.present();
  }

  eventTypeAlert(){
    const alertInputs = this.eventTypes.map((type) => ({
      type: 'radio',
      label: type.name,
      value: type.id,
      checked: this.eventDetails.event_type_global.id === type.id,
    }));

    const alert = this.alertCtrl.create({
      title: 'Select Event Type',
      inputs: alertInputs,
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Update',
          handler: (selectedEventType) => {
            if (selectedEventType) {
              const event_type = this.eventTypes.find(type => type.id === selectedEventType)
              const updatedEvent: Partial<UpdateEventInputDto> = {
                event_type_id: event_type.id,
              };

              this.updateEventInfo(updatedEvent).then(() => {
                this.eventDetails.event_type_global.name = event_type.name;
                this.eventDetails.event_type_global.id = event_type.id
                this.commonService.toastMessage('Event type updated', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              }).catch((err) => {
                if (err.message) {
                  this.commonService.toastMessage(err.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                } else {
                  this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }
              })

            }
          },
        }
      ],
    });

    alert.present();
  }
  //common update alert controller
  // updateEventAlert(property: string, value: string | number) {
  //   // Map property names to titles and types
  //   const titleMap: { [key: string]: string } = {
  //     booking_until: 'Edit Booking Until',
  //     capacity: 'Edit Capacity',
  //     minimum_booking: 'Edit Minimum Booking Quantity',
  //   };

  //   const inputTypeMap: { [key: string]: string } = {
  //     booking_until: 'date', // Use date for "Booking Until"
  //     capacity: 'number',
  //     minimum_booking: 'number',
  //   };

  //   const placeholderMap: { [key: string]: string } = {
  //     booking_until: 'Enter booking deadline',
  //     capacity: 'Enter capacity',
  //     minimum_booking: 'Enter minimum booking quantity',
  //   };

  //   const title = titleMap[property];
  //   const inputPlaceholder = placeholderMap[property];
  //   const inputType = inputTypeMap[property];
  //   const default_value = value;

  //   // Show the dynamic alert
  //   this.commonService.presentDynamicAlert(
  //     title,
  //     "",
  //     inputPlaceholder,
  //     "Cancel",
  //     "Update",
  //     default_value,
  //     inputType,
  //     async (inputValue: string | number) => {
  //       try {
  //         const updateData: Partial<UpdateEventInputDto> = {
  //           [property]: inputValue,
  //         };

  //         // Update the event info via API
  //         await this.updateEventInfo(updateData);

  //         // Show success toast
  //         this.commonService.toastMessage(
  //           `${title} updated successfully`,
  //           2500,
  //           ToastMessageType.Success,
  //           ToastPlacement.Bottom
  //         );

  //         // Update the local property to reflect changes
  //         this.eventDetails[property] = inputValue;
  //       } catch (error) {
  //         const errorMessage =
  //           error.message || `Failed to update ${title}`;
  //         this.commonService.toastMessage(
  //           errorMessage,
  //           2500,
  //           ToastMessageType.Error,
  //           ToastPlacement.Bottom
  //         );
  //         console.error(`Error updating ${title}:`, error);
  //       }
  //     }

  //   );
  // }
  
  onBookingUntilChange(){

  }

  updateEventAlert(type: number, value: string | number) {
    const title = titleMap[type];
    const inputPlaceholder = inputPlaceholderMap[type];
    const inputType = inputTypeMap[type];
    const cancelButtonText = "Cancel";
    const updateButtonText = "Update";
    const default_value = value;
  
    this.commonService.presentDynamicAlert(
      title,
      "",
      inputPlaceholder,
      cancelButtonText,
      updateButtonText,
      default_value,
      inputType,
      async (inputValue) => {
        try {
          const event_input: Partial<UpdateEventInputDto> = this.buildEventInput(type, inputValue);
          this.updateEventInfo(event_input).then(()=>{
            this.buildEventOutput(type,inputValue);
            this.commonService.toastMessage("Updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          }).catch((err) => {
              if(err.error.message){
                this.commonService.toastMessage(err.message, 2500,ToastMessageType.Error,ToastPlacement.Bottom);
              }else{
                this.commonService.toastMessage('Failed to update events',2500,ToastMessageType.Error,ToastPlacement.Bottom);
              }
          })
        } catch (error) {
          this.commonService.toastMessage('Failed to update event', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          console.error("Error updating event:", error);
        }
      }
    );
  }

  private buildEventInput(type: number, inputValue: string | number): Partial<UpdateEventInputDto> {
    let eventInput: Partial<UpdateEventInputDto> = {};
    switch (type) {
      case 4: // Booking until
        Object.assign(eventInput, { booking_until: new Date(inputValue).toISOString() })
        break;
      case 5: // Capacity
        Object.assign(eventInput, { capacity: +inputValue })
        break;
      case 6: // Minimum booking
        Object.assign(eventInput, { minimum_booking_count: +inputValue })
        break;
    }
    return eventInput;
  }

  private buildEventOutput(type: number, outputValue: string | number): Partial<UpdateEventInputDto> {
    let eventInput: Partial<UpdateEventInputDto> = {};
    switch (type) {
      case 4: // Booking until
        this.booking_until = outputValue as string;
        break;
      case 5: // Capacity
        this.eventDetails.capacity = outputValue as number;
        break;
      case 6: // Minimum booking
        this.eventDetails.minimum_booking = outputValue as number;
        break;
    }
    return eventInput;
  }

  //this is called when stripe account selected for event
  selectEventStripe() {
    const event_status_input: Partial<UpdateEventInputDto> = {
      payment_method_id: this.selectedAccount,
    }
    this.updateEventInfo(event_status_input).then(() => {
      this.commonService.toastMessage("Event stripe account updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    }).catch((err) => {
      if (err.error.message) {
        this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      } else {
        this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    })
  }

  //Goto Event DescriptionPage
  modifyDescription(type: number) {
    type popup_res = {
      description: string,
      can_update: boolean
    }

    let modal = this.modalCtrl.create("EventdescPage", { Description: type == 1 ? this.eventDetails.summary : this.eventDetails.description, type });
    modal.onDidDismiss((data: popup_res) => {
      console.log(data);
      if (data && data.can_update) {
        let event_summary_input: Partial<UpdateEventInputDto> = {}
        if (type === 1) {
          this.EventSummary = this.sanitizer.bypassSecurityTrustHtml(data.description.replace(/\\n|[\r\n]/g, '<br>')) as string;
          Object.assign(event_summary_input, { summary: data.description })
        } else {
          this.EventDescription = this.sanitizer.bypassSecurityTrustHtml(data.description.replace(/\\n|[\r\n]/g, '<br>')) as string;
          Object.assign(event_summary_input, { description: data.description })
        }
        this.updateEventInfo(event_summary_input).then(() => {
          this.commonService.toastMessage("Event updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
        }).catch((err) => {
          if (err.error.message) {
            this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          } else {
            this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
          }
        })
      }
    });
    modal.present();
  }

  //for ticket popup
  showPopup(i: number, j: number) {
    this.isPopupVisible = true;
    this.category = new TicketCategory(this.ticketInfo[i].categories[j])
    this.category.capacity = +this.category.capacity;
    this.category.capacity_left = +this.category.capacity_left;
  }

  //for addon popup
  showAddOnPopup(i: number) {
    this.isAddonPopupVisible = true;
    this.selected_addon = new Addon(this.addons[i]);
  }

  //for discount alert controller
  showDiscountPopup(popup_ind: number) {
    let alert_options: { title: string, cssClass: string, message: string, buttons: any[] } = {
      title: '',
      cssClass: '',
      message: '',
      buttons: []
    };
    alert_options.buttons.push({
      text: 'Edit',
      cssClass: 'border_bottom',
      //icon: 'close',
      handler: () => {
        this.discount_type = 2;
        this.isDiscountPopupVisible = true;
        this.selected_discount = new Discount(this.discounts[popup_ind]);
      }
    }, {
      text: 'Remove',
      cssClass: 'border_bottom',
      handler: () => {
        this.removeEventDiscount(popup_ind, 1);
      }
    })
    const actionSheet = this.actionSheetCtrl.create(alert_options);
    actionSheet.present();

  }

  prepareDiscount() {
    this.discount_type = 1;
    const discount = <Discount>{
      id: "",
      name: "Early Bird",
      valid_from: moment().format("YYYY-MM-DD"),
      valid_til: moment(this.eventDetails.end_date).format("YYYY-MM-DD"),
      discount_percent: 0.00,
      discount_amount: 0.00,
      used_count: 0,
      quota: 0
    }
    this.selected_discount = new Discount(discount);
    this.isDiscountPopupVisible = true;
  }

  prepareCoupon() {
    this.discount_coupon_type = 1;
    const coupon = <CouponDiscount>{
      id: "",
      name: "",
      code: this.commonService.randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
      valid_from: moment().format("YYYY-MM-DD"),
      valid_til: moment(this.eventDetails.end_date).format("YYYY-MM-DD"),
      discount_percent: 0.00,
      discount_amount: 0.00,
      used_count: 0,
      quota: 0
    }
    this.selected_discount_coupon = new CouponDiscount(coupon);
    this.isCouponDiscountPopupVisible = true;
  }

  //for discount coupon popup
  showDiscountCouponPopup(popup_ind: number) {
    let alert_options: { title: string, cssClass: string, message: string, buttons: any[] } = {
      title: '',
      cssClass: '',
      message: '',
      buttons: []
    };
    alert_options.buttons.push({
      text: 'Edit',
      cssClass: 'border_bottom',
      //icon: 'close',
      handler: () => {
        this.discount_coupon_type = 2;
        this.isCouponDiscountPopupVisible = true;
        this.selected_discount_coupon = new CouponDiscount(this.coupon_discounts[popup_ind]);
      }
    }, {
      text: 'Remove',
      cssClass: 'border_bottom',
      handler: () => {
        this.removeEventDiscount(popup_ind, 2);
      }
    })
    const actionSheet = this.actionSheetCtrl.create(alert_options);
    actionSheet.present();
  }

  //remove event discount/coupon
  removeEventDiscount(index: number, type: number) {
    try {
      const update_input = {
        parentclubId: this.postgre_parentclub_id,
        device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
        updated_by: this.sharedService.getLoggedInId(),
        device_id: this.sharedService.getDeviceId() || "",
        app_type: AppType.ADMIN_NEW,
        event_id: this.eventId,
        discount_ids:type == 1 ? [this.discounts[index].id]:[this.coupon_discounts[index].id],
      }
      const controller = type == 1 ? API.REMOVE_DISCOUNT : API.REMOVE_COUPON;
      this.httpService.post<{ data: any }>(`${controller}`, update_input)
        .subscribe({
          next: (res) => {
            type == 1 ? this.discounts.splice(index, 1) : this.coupon_discounts.splice(index, 1);
            this.commonService.toastMessage("Discount removed successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
          },
          error: (err) => {
            console.error("Error fetching events:", err);
            if (err.error.message) {
              this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            } else {
              this.commonService.toastMessage('Failed to remove discount', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
            }
          }
        });
    } catch (err) {
      this.commonService.toastMessage('Failed to remove discount', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
    }
  }


  onPaidSelectionChange(event: boolean) {
    if(!event){
      this.mySelect.close(); // Trigger change detection
    }
  }

  //ticket validation
  validateTicketInfo(): boolean {
    if (this.eventDetails.is_paid) {
      // Check if Stripe account is selected
      if (this.selectedAccount === '') {
        this.commonService.toastMessage("Please select a stripe account", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
    }

    if (this.category.name === "") {
      this.commonService.toastMessage("Please provide a name for the ticket", 2500, ToastMessageType.Error);
      return false;
    }

    if(+this.category.price > 0 && this.selectedAccount =='' ){
      this.commonService.toastMessage("Please choose a stripe account first", 2500, ToastMessageType.Error);
      return false;
    }

    // if (this.category.price == 0 && this.eventDetails.is_paid) {
    //   this.commonService.toastMessage("Please provide price", 2500, ToastMessageType.Error);
    //   return false;
    // }

    if (+this.category.capacity == 0) {
      this.commonService.toastMessage("Please provide capacity", 2500, ToastMessageType.Error);
      return false;
    }

    //capacity check for overall capacity and sum(each ticket type capacity)
    const totalCapacity: number = this.ticketInfo.reduce((sum, ticket) => {
      return sum + ticket.categories.reduce((catSum, cat) => {
        return catSum + (cat.category_identifier === this.category.category_identifier ? 0 : +cat.capacity);
      }, 0);
    }, 0);
 
    const overallCapacity: number = +this.eventDetails.capacity; // Assuming overall capacity is in eventDetails
    const proposedTotalCapacity: number = totalCapacity + Number(this.category.capacity);
 
    if (proposedTotalCapacity > overallCapacity) {
      this.commonService.toastMessage(`Total capacity exceeds the allowed limit of ${overallCapacity}. Please adjust capacities.`,2500,ToastMessageType.Error);
      return false;
    }
 
    // Validate against ticket type capacity if applicable
    const ticketType = this.ticketInfo.find(ticket =>
      ticket.categories.some(cat => cat.category_id === this.category.category_id)
    );
 
    if (ticketType) {
      const currentTicketTypeCapacity = ticketType.categories.reduce((sum, cat) => sum + Number(cat.capacity), 0);
      const updatedTicketTypeCapacity = currentTicketTypeCapacity - Number(this.category.capacity) + Number(this.category.capacity);
      // Check if updated capacity exceeds the limit for this ticket type
      const maxCapacityForTicketType = this.eventDetails.capacity; // Replace with the actual field if there's a specific limit for each ticket type.
 
      if (updatedTicketTypeCapacity > maxCapacityForTicketType) {
        this.commonService.toastMessage(`The capacity for the ticket type "${ticketType.ticket_type.name}" exceeds its allowed limit. Please adjust capacities.`,2500,ToastMessageType.Error);
        return false;
      }
    }

    return true; // If not paid or all validations pass
  }

  updateTicketsInfo() {
    if (this.validateTicketInfo()) {
      try {
        // if (!this.ticketInfo || !this.ticketInfo[i] || !this.ticketInfo[i].categories || !this.ticketInfo[i].categories[j]) {
        //   console.error('Invalid ticketInfo or indices');
        //   return;
        // }
        console.log('Editing category:', this.category);
        //const category = this.ticketInfo[i].categories[j];
        const event_ticket_info: EventTicketsDto[] = [];
        const ticket_info: EventTicketsDto = {
          ticket_id: this.category.ticket_id,
          category_id: this.category.category_id,
          fee: Number(this.category.fee),
          price: Number(this.category.price),
          capacity: Number(this.category.capacity),
          label: this.category.name
        }
        event_ticket_info.push(ticket_info);

        const update_input = {
          parentclubId: this.postgre_parentclub_id,
          device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
          updated_by: this.sharedService.getLoggedInId(),
          device_id: this.sharedService.getDeviceId() || "",
          app_type: AppType.ADMIN_NEW,
          event_id: this.eventDetails.id,
          is_paid: this.eventDetails.is_paid,
          //stripe_acc_id:this.selectedAccounts[0],
          ticket_info: event_ticket_info
        }

        const bookingDetailsDTO = new UpdateEventTicketDto(update_input);
        console.log("input for bookinginfo", bookingDetailsDTO)
        this.httpService.post<{ data: any }>(`${API.UPDATE_EVENT_TICKETS}`, bookingDetailsDTO)
          .subscribe({
            next: (res) => {
              this.isPopupVisible = false;
              //find in category and update
              //this.category = new TicketCategory(this.ticketInfo[i].categories[j])
              for (let ticket of this.ticketInfo) {
                const categoryIndex = ticket.categories.findIndex(cat => cat.ticket_id === this.category.ticket_id);
                if (categoryIndex !== -1) {
                  ticket.categories[categoryIndex] = new TicketCategory(this.category)
                  ticket.categories[categoryIndex].capacity = +ticket.categories[categoryIndex].capacity;
                  ticket.categories[categoryIndex].capacity_left = +ticket.categories[categoryIndex].capacity_left;
                  break; // Exit loop once the category is updated
                }
              }
              console.log("updated event", JSON.stringify(res.data));
              this.commonService.toastMessage("Ticket info updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            },
            error: (err) => {
              console.error("Ticket info update:", err);
              if (err.error.message) {
                this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              } else {
                this.commonService.toastMessage('Ticket info update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
            }
          });
      } catch (err) {
        this.commonService.toastMessage('Ticket info update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
  }

  //addon validation
  validateAddOnInfo(): boolean {
    if (this.selected_addon.status) {
      if (this.selected_addon.quantity === 0) {
        this.commonService.toastMessage("Please enter addon quantity", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.eventDetails.is_paid && this.selectedAccount == '') {
        this.commonService.toastMessage("Please select stripe account", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_addon.is_paid && this.selected_addon.pricing == 0) {
        this.commonService.toastMessage("Please provide price for the addon", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
    }

    return true; // If not paid or all validations pass
  }

  //update addon
  updateAddOnInfo() {
    if (this.validateAddOnInfo()) {
      try {
        console.log('Editing addon:', this.selected_addon);
        //const category = this.ticketInfo[i].categories[j];
        const update_input: UpdateAddOnInputDto = {
          parentclubId: this.postgre_parentclub_id,
          device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
          updated_by: this.sharedService.getLoggedInId(),
          device_id: this.sharedService.getDeviceId() || "",
          app_type: AppType.ADMIN_NEW,
          event_id: this.eventDetails.id,
          is_paid: this.selected_addon.is_paid,
          addon_id: this.selected_addon.id,
          price: +this.selected_addon.pricing,
          quantiy: +this.selected_addon.quantity,
          status: +this.selected_addon.status
        }

        const bookingDetailsDTO = new UpdateEventTicketDto(update_input);
        console.log("input for bookinginfo", bookingDetailsDTO)
        this.httpService.post<{ data: any }>(`${API.UPDATE_EVENT_ADDON}`, bookingDetailsDTO)
          .subscribe({
            next: (res) => {
              this.isAddonPopupVisible = false;
              const update_addon = this.addons.findIndex((addon) => addon.id === this.selected_addon.id);
              if (update_addon !== -1) {
                this.addons[update_addon] = new Addon(res.data);
                this.addons[update_addon].is_paid = this.selected_addon.is_paid;
                this.addons[update_addon].add_on_config = this.selected_addon.add_on_config;
              }
              //this.selected_addon = new Addon(this.addons[i]); //find addon id using selected_addon then update
              console.log("updated event", JSON.stringify(res.data));
              this.commonService.toastMessage("AddOn info updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            },
            error: (err) => {
              console.error("Ticket info update:", err);
              if (err.error.message) {
                this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              } else {
                this.commonService.toastMessage('AddOn info update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
            }
          });
      } catch (err) {
        this.commonService.toastMessage('AddOn info update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
  }

  //discount validation
  validateDiscountInfo(): boolean {
    if (this.eventDetails.is_paid) {
      if (this.selectedAccount === "") {
        this.commonService.toastMessage("Please select stripe account", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_discount.name === "") {
        this.commonService.toastMessage("Please enter discount name", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_discount.valid_from == "" || this.selected_discount.valid_til == "") {
        this.commonService.toastMessage("Please select discount duration dates", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (Number(this.selected_discount.discount_amount) == 0 && Number(this.selected_discount.discount_percent) == 0) {
        this.commonService.toastMessage("Please enter discount amount/percentage", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if(!this.commonService.validateStartAndEndDate(this.selected_discount.valid_from,this.selected_discount.valid_til)){
        return false;
      }
    }
    return true; // If not paid or all validations pass
  }

  //update discount
  updateDiscount() {
    if (this.validateDiscountInfo()) {
      try {
        console.log('Editing discount:', this.selected_addon);
        if (this.discount_type == 2) { //update discount
          //const category = this.ticketInfo[i].categories[j];
          const update_input: EventDiscountInputDTO = {
            parentclubId: this.postgre_parentclub_id,
            device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
            updated_by: this.sharedService.getLoggedInId(),
            device_id: this.sharedService.getDeviceId() || "",
            app_type: AppType.ADMIN_NEW,
            event_id: this.eventDetails.id,
            discount_id: this.selected_discount.id,
            valid_from: new Date(this.selected_discount.valid_from).toISOString(),
            valid_til: new Date(this.selected_discount.valid_til).toISOString(),
            name: this.selected_discount.name,
            amount: +this.selected_discount.discount_amount,
            percentage: +this.selected_discount.discount_percent
          }

          const bookingDetailsDTO = new EventDiscountInputDTO(update_input);
          console.log("input for bookinginfo", bookingDetailsDTO)
          this.httpService.post<{ data: any }>(`${API.UPDATE_EVENT_DISCOUNT}`, bookingDetailsDTO)
            .subscribe({
              next: (res) => {
                this.isDiscountPopupVisible = false;
                const discount_ind = this.discounts.findIndex((discount) => discount.id === this.selected_discount.id);
                if (discount_ind !== -1) {
                  this.discounts[discount_ind] = new Discount(res.data);
                  //this.addons[update_addon].add_on_config = this.selected_addon.add_on_config;
                }
                //this.selected_addon = new Addon(this.addons[i]); //find addon id using selected_addon then update
                console.log("updated event", JSON.stringify(res.data));
                this.commonService.toastMessage("Discount updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              },
              error: (err) => {
                console.error("Discount info update:", err);
                if (err.error.message) {
                  this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                } else {
                  this.commonService.toastMessage('Discount update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }
              }
            });
        } else { //create discount
          const update_input: EventDiscountInputDTO = {
            parentclubId: this.postgre_parentclub_id,
            device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
            updated_by: this.sharedService.getLoggedInId(),
            device_id: this.sharedService.getDeviceId() || "",
            app_type: AppType.ADMIN_NEW,
            event_id: this.eventDetails.id,
            discount_id: "",
            valid_from: new Date(this.selected_discount.valid_from).toISOString(),
            valid_til: new Date(this.selected_discount.valid_til).toISOString(),
            name: this.selected_discount.name,
            amount: +this.selected_discount.discount_amount,
            percentage: +this.selected_discount.discount_percent
          }

          const bookingDetailsDTO = new EventDiscountInputDTO(update_input);
          console.log("input for bookinginfo", bookingDetailsDTO)
          this.httpService.post<{ data: any }>(`${API.CREATE_EVENT_DISCOUNT}`, bookingDetailsDTO)
            .subscribe({
              next: (res) => {
                this.isDiscountPopupVisible = false;
                this.discounts.push(new Discount(res.data))
                console.log("new discount", JSON.stringify(this.discounts));
                //this.selected_addon = new Addon(this.addons[i]); //find addon id using selected_addon then update
                this.commonService.toastMessage("Discount created successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              },
              error: (err) => {
                console.error("Discount info update:", err);
                if (err.error.message) {
                  this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                } else {
                  this.commonService.toastMessage('Discount update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }
              }
            });
        }

      } catch (err) {
        this.commonService.toastMessage('AddOn info update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
  }

  //discount validation
  validateCouponDiscountInfo(): boolean {
    //if (this.is_coupon_discounts_avail && this.eventDetails.is_paid) {
    if (this.eventDetails.is_paid) {
      if(this.selectedAccount === ""){
        this.commonService.toastMessage("Please select stripe account", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_discount_coupon.name === "") {
        this.commonService.toastMessage("Please enter coupon name", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_discount_coupon.valid_from == "" || this.selected_discount_coupon.valid_til == "") {
        this.commonService.toastMessage("Please select coupon duration dates", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (Number(this.selected_discount_coupon.discount_amount) == 0 && Number(this.selected_discount_coupon.discount_percent) == 0) {
        this.commonService.toastMessage("Please enter coupon amount/percentage", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_discount_coupon.code === "") {
        this.commonService.toastMessage("Please enter coupon code", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if (this.selected_discount_coupon.quota === 0) {
        this.commonService.toastMessage("Please enter coupon quota", 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        return false;
      }
      if(!this.commonService.validateStartAndEndDate(this.selected_discount_coupon.valid_from,this.selected_discount_coupon.valid_til)){
        return false;
      }
    }
    return true; // If not paid or all validations pass
  }

  //update discount
  updateCouponDiscount() {
    if (this.validateCouponDiscountInfo()) {
      try {
        if (this.discount_coupon_type == 2) { //update coupon
          console.log('Editing coupon discount:', this.selected_addon);
          //const category = this.ticketInfo[i].categories[j];
          const update_input: EventDiscountCouponInputDTO = {
            parentclubId: this.postgre_parentclub_id,
            device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
            updated_by: this.sharedService.getLoggedInId(),
            device_id: this.sharedService.getDeviceId() || "",
            app_type: AppType.ADMIN_NEW,
            event_id: this.eventDetails.id,
            discount_id: this.selected_discount_coupon.id,
            valid_from: new Date(this.selected_discount_coupon.valid_from).toISOString(),
            valid_til: new Date(this.selected_discount_coupon.valid_til).toISOString(),
            name: this.selected_discount_coupon.name,
            amount: +this.selected_discount_coupon.discount_amount,
            percentage: +this.selected_discount_coupon.discount_percent,
            code: this.selected_discount_coupon.code,
            quota: +this.selected_discount_coupon.quota,
          }

          const bookingDetailsDTO = new EventDiscountCouponInputDTO(update_input);
          console.log("input for bookinginfo", bookingDetailsDTO)
          this.httpService.post<{ data: any }>(`${API.UPDATE_EVENT_COUPON}`, bookingDetailsDTO)
            .subscribe({
              next: (res) => {
                this.isCouponDiscountPopupVisible = false;
                const discount_ind = this.coupon_discounts.findIndex((discount) => discount.id === this.selected_discount_coupon.id);
                if (discount_ind !== -1) {
                  this.coupon_discounts[discount_ind] = new CouponDiscount(res.data);
                }
                console.log("updated event", JSON.stringify(res.data));
                this.commonService.toastMessage("Coupon updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              },
              error: (err) => {
                console.error("Coupon info update:", err);
                if (err.error.message) {
                  this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                } else {
                  this.commonService.toastMessage('Coupon update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }
              }
            });
        } else { //create
          const update_input: EventDiscountCouponInputDTO = {
            parentclubId: this.postgre_parentclub_id,
            device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
            updated_by: this.sharedService.getLoggedInId(),
            device_id: this.sharedService.getDeviceId() || "",
            app_type: AppType.ADMIN_NEW,
            event_id: this.eventDetails.id,
            discount_id: "",
            valid_from: new Date(this.selected_discount_coupon.valid_from).toISOString(),
            valid_til: new Date(this.selected_discount_coupon.valid_til).toISOString(),
            name: this.selected_discount_coupon.name,
            amount: +this.selected_discount_coupon.discount_amount,
            percentage: +this.selected_discount_coupon.discount_percent,
            code: this.selected_discount_coupon.code,
            quota: +this.selected_discount_coupon.quota,
          }

          const bookingDetailsDTO = new EventDiscountCouponInputDTO(update_input);
          console.log("input for bookinginfo", bookingDetailsDTO)
          this.httpService.post<{ data: any }>(`${API.CREATE_EVENT_COUPON}`, bookingDetailsDTO)
            .subscribe({
              next: (res) => {
                this.isCouponDiscountPopupVisible = false;
                this.coupon_discounts.push(new CouponDiscount(res.data));
                console.log("updated event", JSON.stringify(res.data));
                this.commonService.toastMessage("Coupon created successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              },
              error: (err) => {
                console.error("Coupon info update:", err);
                if (err.error.message) {
                  this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                } else {
                  this.commonService.toastMessage('Coupon update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                }
              }
            });
        }
      } catch (err) {
        this.commonService.toastMessage('Coupon update failed', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    }
  }

  eventObj = {
    Paid: true,
    DiscountAvail: false,
    DiscountName: '',
    DiscountAmt: null,
    DiscountPercentage: null,
    DiscountValidUntil: '',
    IsCouponCodeAvail: false,
    CouponName: '',
    CouponCodeVal: null,
    CouponCodePercen: null,
    CouponCode: '',
    CouponTimesAllowed: '',
    CouponValidUntil: '',
    AllowCouponDiscount: false
  };

  showEventActions() {
    let alert_options: { title: string, cssClass: string, message: string, buttons: any[] } = {
      title: '',
      cssClass: '',
      message: '',
      buttons: []
    };
    //when event in not title event
    if (!this.eventDetails.is_title_event) {
      alert_options.title = this.eventDetails.event_name;
      alert_options.cssClass = "action-sheets-basic-page"
      alert_options.buttons.push(
        {
          text: 'Make it title event',
          cssClass: 'border_bottom',
          handler: () => {
            const title_event_input: Partial<UpdateEventInputDto> = {
              is_title_event: true,
            }
            this.updateEventInfo(title_event_input).then(() => {
              this.commonService.toastMessage("Event updated successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
            }).catch((err) => {
              if (err.error.message) {
                this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              } else {
                this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
            });
          }
        }
      )
    }

    //when bookings tab open
    if (!this.selectedType) {
      alert_options.buttons.push({
        text: 'Print',
        cssClass: 'border_bottom',
        handler: () => {
          this.goToPrint();
        }
      },
        // {
        //   text: 'Notify',
        //   cssClass: 'border_bottom',
        //   handler: () => {
        //     this.gotoNotify();
        //   }
        // },
        {
          text: 'Email',
          cssClass: 'border_bottom',
          handler: () => {
            this.gotoMailPage();
          }
        })
    } else {//when event info tab is active
      alert_options.buttons.push(
        {
          text: 'Delete Event',
          cssClass: 'border_bottom',
          handler: () => {
            const title_event_input: Partial<UpdateEventInputDto> = {
              is_active: false,
            }
            this.updateEventInfo(title_event_input).then(() => {
              this.commonService.toastMessage("Event removed successfully", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
              this.navCtrl.pop();
            }).catch((err) => {
              if (err.error.message) {
                this.commonService.toastMessage(err.error.message, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
                this.navCtrl.pop();
              } else {
                this.commonService.toastMessage('Failed to update events', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
              }
            });
          }
        })
    }

    //without any condition

    const actionSheet = this.actionSheetCtrl.create(alert_options);
    actionSheet.present();
  }

  //updating event dets like microservices for individual attribute update
  updateEventInfo(update_input: Partial<UpdateEventInputDto>) {
    return new Promise((resolve, reject) => {
      try {
        Object.assign(update_input, {
          parentclubId: this.postgre_parentclub_id,
          device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
          updated_by: this.sharedService.getLoggedInId(),
          device_id: this.sharedService.getDeviceId() || "",
          app_type: AppType.ADMIN_NEW
        })
        const bookingDetailsDTO = new UpdateEventInputDto(update_input);
        console.log("input for bookinginfo", bookingDetailsDTO)
        this.httpService.put<{ data: { events: EventEntity } }>(`${API.UPDATE_EVENT_INFO}/${this.eventDetails.id}`, bookingDetailsDTO)
          .subscribe({
            next: (res) => {
              resolve(res.data.events);
            },
            error: (err) => {
              console.error("Error fetching events:", err);
              reject(err);
            }
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  getBookingStats() {
    const stats_input = {
      event_id: this.eventId,
      parentclubId: this.postgre_parentclub_id,
      device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
      updated_by: this.sharedService.getLoggedInId(),
      device_id: this.sharedService.getDeviceId() || "",
      app_type: AppType.ADMIN_NEW
    }
    const bookingDetailsDTO = new BookingStatsInputDTO(stats_input);
    console.log("input for bookinginfo", bookingDetailsDTO)
    this.httpService.post<{ message: string, data: EventStats, status: number }>(`${API.GET_EVENT_STATS}`, bookingDetailsDTO)
      .subscribe({
        next: (res) => {
          this.event_stats = res.data;
          console.log("resonse for stats", JSON.stringify(res.data));
        },
        error: (err) => {
          console.error("Error fetching events:", err);
          this.commonService.toastMessage('Failed to fetch event booking info', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }

  //to get user bookings
  getBookingInfo() {
    const bookings_input = {
      event_id: this.eventId,
      parentclubId: this.postgre_parentclub_id,
      device_type: this.sharedService.getPlatform() == "android" ? 1 : 2,
      updated_by: this.sharedService.getLoggedInId(),
      device_id: this.sharedService.getDeviceId() || "",
      app_type: AppType.ADMIN_NEW
    }
    const bookingDetailsDTO = new GetBookingListInputDTO(bookings_input);
    console.log(bookingDetailsDTO);
    console.log("input for bookinginfo", bookingDetailsDTO)
    this.httpService.post<UserBookings>(`${API.GET_EVENT_BOOKINGS}`, bookingDetailsDTO)
      .subscribe({
        next: (res) => {
          console.log("event user bookings", JSON.stringify(res));
          this.user_bookings = res;
        },
        error: (err) => {
          console.error("Error fetching events:", err);
          this.commonService.toastMessage('Failed to fetch bookings', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
        }
      });
  }

  viewDocument(index: number) {
    let path = null;
    const transfer = this.fileTransfer.create();
    if (this.platform.is('ios')) {
      path = this.file.documentsDirectory;
    } else {
      path = this.file.dataDirectory;
    }

    transfer.download(this.Policies.PolicyDocs[index].DownloadUrl, `${path}${new Date().getTime()}.pdf`).then((entry) => {
      let url = entry.toURL();
      this.fileOpener.open(url, this.Policies.PolicyDocs[index].MimeType)
        .then(() => this.commonService.toastMessage("File Opened", 2500, ToastMessageType.Success, ToastPlacement.Bottom))
        .catch(e => this.commonService.toastMessage("File Opened Failed", 2500, ToastMessageType.Success, ToastPlacement.Bottom));
    })
  }


  //show booking info
  ShowBookingDets(booking: BookingData) {
    this.navCtrl.push("TicketdetsPage", { booking_id: booking.id })
  }

  gotoMailPage() {
    const members = this.user_bookings.data.map(booking => booking.user.user_id)
    if (members.length > 0) {
      const member_list = this.user_bookings.data.map((booking, index) => {
        return {
          IsChild: booking.user.is_child ? true : false,
          ParentId: booking.user.is_child ? booking.user.parent_id : "",
          MemberId: booking.user.user_id,
          MemberEmail: booking.user.email != "" && booking.user.email != "-" && booking.user.email != "n/a" ? booking.user.email : (booking.user.is_child ? booking.user.parent_email : ""),
          MemberName: booking.user.first_name + " " + booking.user.last_name
        }
      })
      const email_modal = {
        module_info: {

        },
        email_users: member_list,
        type: ModuleTypes.EVENTS
      }
      this.navCtrl.push("MailToMemberByAdminPage", { email_modal });
    } else {
      this.commonService.toastMessage("No booking(s) found", 2500, ToastMessageType.Error);
    }
  }

  gotoNotify() {
    const members = this.user_bookings.data.map(booking => booking.user.user_id)
    if (members.length > 0) {
      const member_ids = this.user_bookings.data.map(booking => booking.user.is_child ? booking.user.parent_id : booking.user.user_id);
      this.navCtrl.push("Type2NotificationSession", {
        users: member_ids,
        type: ModuleTypes.EVENTS,
        heading: `Event Booking:${this.eventDetails.event_name}`
      });
    } else {
      this.commonService.toastMessage("No member(s) found in the booking", 2500, ToastMessageType.Error);
    }
  }

  // Print event members
  goToPrint() {
    const members = this.user_bookings.data.map(booking => booking.user.user_id)
    if (members.length > 0) {
      const report_members = this.user_bookings.data.map((booking) => {
        return {
          //StartDate: booking.event.start_date,
          //EndDate: booking.event.end_date,
          FirstName: booking.user.first_name,
          LastName: booking.user.last_name,
          EventName: this.eventDetails.event_name,
          VenueName: this.eventDetails.club.ClubName,
          NoOfTickets: booking.no_of_tickets_booked,
          //MedicalCondition: booking.user.medical_condition || "None",
          //Age: booking.user.dob,
          //Gender: booking.user.gender,
          //PaymentStatus: "Paid",//as of now
          PaymentDDate: booking.formatted_payment_date,
          PaidAmount: booking.total_amount,
          DiscountAmount: 0.00,
          //PhoneNumber: booking.user.is_child ? booking.user.parent_phone_number:booking.user.phone_number,
          //EmailID: booking.user.is_child ? booking.user.parent_email:booking.user.email,
          // ExtraLine: true,
          // ExtraLineNumber: 10,
          //MemberType:"1"
        }
      })
      const session_info = {
        session_name: this.eventDetails.event_name,
        club_name: this.eventDetails.club.ClubName,
        coach_name: this.eventDetails.speaker_trainer_name
      }
      this.navCtrl.push("PrintevnentmemberPage", { session_info: session_info, repor_members: report_members, type: ModuleTypes.EVENTS });
    } else {
      this.commonService.toastMessage("No member(s) found in the current session", 2500, ToastMessageType.Error);
    }
    // this.navCtrl.push('PrintevnentmemberPage', {
    //   memberList: this.evntDetails['TempMemberInfo'],
    //   parentClubKey: this.ParentClubKey,
    //   showType:this.evntDetails.Paid ? "Paid":"Free"
    // });
  }

  showFullDesc() {//EventdescPage
    this.IsShowDescPara = !this.IsShowDescPara;
  }

  // GetAddress() {
  //   console.log(`Location/${this.ParentClubKey}/${this.evntDetails.LocationKey}`);
  //   let $locObs = this.fb.getAllWithQuery(`Location/${this.ParentClubKey}`, { orderByKey: true, equalTo: this.evntDetails.LocationKey }).subscribe((res) => {
  //     $locObs.unsubscribe();
  //     if (res.length > 0) {
  //       this.evntDetails["City"] = this.evntDetails["City"] ? res[0].City :"";
  //       this.evntDetails["Address1"] = res[0].Address1;
  //       this.evntDetails["Address2"] = res[0].Address2;
  //       this.evntDetails["PostCode"] = this.evntDetails["PostCode"] ? res[0].PostCode : "";
  //       if (res[0].MapLatitude == undefined || res[0].MapLatitude == "") {
  //         this.getAddfromApi();
  //       } else {
  //         this.evntDetails["MapLatitude"] = res[0].MapLatitude;
  //         this.evntDetails["MapLongitude"] = res[0].MapLongitude;
  //         this.evntDetails["MapUrl"] = `https://maps.google.com/?q=${this.evntDetails["MapLatitude"]},${this.evntDetails["MapLongitude"]}`;
  //         this.getMap();
  //       }
  //       console.log(this.evntDetails["City"]);

  //     } else {
  //       this.getAddfromApi();
  //     }

  //   }, (err) => {
  //     console.log('err', +err);
  //   });
  // }

  //showing location map
  getMap() {
    setTimeout(() => {
      let element = document.getElementById("map");
      let mylocation = new google.maps.LatLng(this.eventDetails.location_lat, this.eventDetails.location_lng);
      let map = new google.maps.Map(element, {
        center: mylocation,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false
      });

      let marker = new google.maps.Marker({
        position: new google.maps.LatLng(this.eventDetails.location_lat, this.eventDetails.location_lng),
        map: map,
      });

      google.maps.event.addListenerOnce(map, 'idle', () => {
        element.classList.add('show-map');
      });
    }, 200);
  }

  // getAddfromApi() {
  //   let mapObj = {};
  //   let clubdets = {};
  //   clubdets["clubKey"] = this.evntDetails.LocationKey;
  //   clubdets["clubName"] = this.evntDetails.Location;
  //   clubdets["firstLineAddress"] = "";
  //   clubdets["postCode"] = "";
  //   clubdets["state"] = "";
  //   mapObj["addressList"] = [];
  //   mapObj["addressList"].push(clubdets);
  //   this.fb.$post("https://activitypro-nest-261607.appspot.com/location/getplacedetails", mapObj).subscribe((data) => {
  //     if (data.status == 200 && data.type == "SUCCESS") {
  //       console.log(data.data[0]);
  //       this.evntDetails["MapLatitude"] = data.data[0].MapDetails.location.lat;
  //       this.evntDetails["MapLongitude"] = data.data[0].MapDetails.location.lng;
  //       this.evntDetails["MapUrl"] = `https://maps.google.com/?q=${this.evntDetails["MapLatitude"]},${this.evntDetails["MapLongitude"]}`;
  //       this.getMap();
  //       this.updateMapCordinates();
  //     }
  //   });
  // }

  // updateMapCordinates() {
  //   this.fb.update(this.evntDetails.LocationKey, `Location/${this.ParentClubKey}`, { MapLatitude: this.evntDetails["MapLatitude"], MapLongitude: this.evntDetails["MapLongitude"] })
  // }

  getDirection() {
    const map_url = this.eventDetails.location_map_url ? this.eventDetails.location_map_url:`https://www.google.com/maps?q=${this.eventDetails.location_lat},${this.eventDetails.location_lng}`
    const browser = this.iab.create(map_url, '_blank');
    browser.show();
    //window.open(this.eventDetails, '_blank');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventdetailsPage');
  }

  title_url: string
  async selectProfImg(imageType: string) {
    const actionSheet = this.actionSheetCtrl.create({
      buttons: [
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            this.captureImage(this.camera.PictureSourceType.CAMERA, imageType)
          },
        },
        {
          text: 'Gallery',
          icon: 'image',
          handler: () => {
            this.captureImage(this.camera.PictureSourceType.PHOTOLIBRARY, imageType)
          }
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }

  async captureImage(sourceType: PictureSourceType, imageType: string) {
    // const isBrowser = !(window as any).cordova;
    // if (isBrowser) {
    //   // Use the static base64 image for testing
    //   // this.title_url = "data:image/jpeg;base64," + "assets/images/monthly.jpeg";

    //   this.title_url = await this.convertImageToBase64('assets/images/weekly.jpeg');

    //   console.log("Using static base64 image for browser testing.");
    //   await this.uploadImage(this.title_url, imageType);
    // } else {
    const options: CameraOptions = {
      quality: 70,
      sourceType,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
    };

    try {
      const imageData = await this.camera.getPicture(options);
      this.title_url = imageData.startsWith('data:image/jpeg;base64,') ? imageData : `data:image/jpeg;base64,${imageData}`;
      this.prepareAndUpload(imageType);
      //await this.uploadImage(this.title_url, imageType);
    } catch (error) {
      console.log(`err:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error capturing image", 2500, ToastMessageType.Error);
    }
    // }
  }

  async prepareAndUpload(imageType: string) {
    try {
      this.commonService.showLoader("Uploading image...");
      //const imageData = this.title_url.split(",")[1]; // Extract base64 data
      //const imageData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wQACfsD/QGTFgAAAABJRU5ErkJggg==";
      const uniqueFileName = `${this.postgre_parentclub}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpeg`;
      // Step 1: Get presigned URL from server
      const presignedUrl = await this.imageUploadService.getPresignedUrl(uniqueFileName, 'events', 'ap-dev-events');

      console.log(`presignedurl:${presignedUrl[0].url}`)
      console.log(`cloudfront:${this.sharedService.getCloudfrontURL()}`)
      console.log(`imagedate:${this.title_url}`)

      // Step 2: Upload the image to S3 using presigned URL
      this.imageUploadService.uploadImage(presignedUrl[0].url, this.title_url).then(() => {
        this.commonService.hideLoader();
        const imageUrl = `${this.sharedService.getCloudfrontURL()}/events/${uniqueFileName}`;
        console.log(`uploadedurl:${this.sharedService.getCloudfrontURL()}/events/${uniqueFileName}`);
        this.updateProgImg(imageType, imageUrl);
      }).catch((err) => {
        console.log(`err:${JSON.stringify(err)}`);
        this.commonService.hideLoader();
        this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
      })

    } catch (error) {
      this.commonService.hideLoader();
      console.log(`err1:${JSON.stringify(error)}`);
      this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
    }
  }

  updateProgImg(imageType: string, imageUrl: string) {
    let updateData: Partial<UpdateEventInputDto> = {};
    
    if (imageType === 'event_img') {
      updateData = {
        title_img: imageUrl,
      };
    } else if (imageType === 'speaker_img') {
      updateData = {
        speaker_trainer_url: imageUrl,
      };
    }
  
    this.updateEventInfo(updateData).then(() => {
      if (imageType === 'event_img') {
        this.eventDetails.title_img_url = imageUrl;
      } else if (imageType === 'speaker_img') {
        this.eventDetails.speaker_trainer_imgurl = imageUrl;
      }
      this.commonService.toastMessage("Image updated", 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    }).catch((err) => {
      if(err && err.error && err.error.message){
        const errorMessage = err.error.message;
        this.commonService.toastMessage(errorMessage, 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }else{
        this.commonService.toastMessage('Failed to update image', 2500, ToastMessageType.Error, ToastPlacement.Bottom);
      }
    });
  }
  

  

  async convertImageToBase64(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fetch(imagePath)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to load image");
          }
          return response.blob();
        })
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(blob);
        })
        .catch((error) => reject(error));
    });
  }

  async uploadImage(base64Image: string, imageType: string) {
    this.commonService.showLoader("Uploading image...");
    try {
      // const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpeg`;
      const image_url = this.title_url.split(/[\s/]+/);
      const image_name = image_url[image_url.length - 1];

      const fileName = `${this.sharedService.getPostgreParentClubId()}/${image_name.charAt(0)}${image_name.charAt(1)}${this.commonService.randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')}.jpeg`;
      const presignedUrl = await this.imageUploadService.getPresignedUrl(fileName, 'events', 'ap-dev-events');

      const uploadSuccess = await this.imageUploadService.uploadImage(presignedUrl[0].url, base64Image);
      this.commonService.hideLoader();
      if (uploadSuccess) {
        const imageUrl = `${this.sharedService.getCloudfrontURL()}/events/${fileName}`;
        //  this.updateImageUrl(imageType, imageUrl);
        this.commonService.toastMessage("Image uploaded successfully", 2500, ToastMessageType.Success);
      } else {
        throw new Error("Image upload failed");
      }
    } catch (error) {
      this.commonService.hideLoader();
      this.commonService.toastMessage("Error uploading image", 2500, ToastMessageType.Error);
    } finally {
      this.commonService.hideLoader();
    }
  }
 
  isEditing: boolean = false; // Toggle editing state

  toggleEdit(type: string, value: string) {
    // if (this.isEditing) {

    //   const updateData: Partial<UpdateEventInputDto> = {
    //     [field]: this.eventDetails[field],
    //   };

    //   this.updateEventInfo(updateData).then(() => {
    //     this.commonService.toastMessage('Name updated successfully', 2500, ToastMessageType.Success, ToastPlacement.Bottom);
    //   }).catch((err) => {
    //     this.commonService.toastMessage(
    //       err.message || 'Failed to update name',
    //       2500,
    //       ToastMessageType.Error,
    //       ToastPlacement.Bottom
    //     );
    //   });
    // }

    // this.isEditing = !this.isEditing;

    const title = 'Edit Speaker Name';
    const inputPlaceholderMap = {
      eventName: 'Enter speaker name',
    };
    const inputTypeMap = {
      eventName: 'text',
    };

    const inputPlaceholder = inputPlaceholderMap[type];
    const inputType = inputTypeMap[type];
    const cancelButtonText = "Cancel";
    const updateButtonText = "Update";
    const default_value = value;

    this.commonService.presentDynamicAlert(
      title,
      "",
      inputPlaceholder,
      cancelButtonText,
      updateButtonText,
      default_value,
      inputType,
      async (inputValue: string) => {
        try {
          // Construct the input DTO
          const event_input: Partial<UpdateEventInputDto> = {
            speaker_trainer_name: inputValue,
          };

          // Update event information
          await this.updateEventInfo(event_input);

          // Show success message
          this.commonService.toastMessage(
            "Updated successfully",
            2500,
            ToastMessageType.Success,
            ToastPlacement.Bottom
          );

          // Update the local event name to reflect changes
          this.eventDetails.speaker_trainer_name = inputValue;
        } catch (error) {
          const errorMessage =
            error.message || "Failed to update event";
          this.commonService.toastMessage(
            errorMessage,
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
          console.error("Error updating event:", error);
        }
      }
    );


  }

}
