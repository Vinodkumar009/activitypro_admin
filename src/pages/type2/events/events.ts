import { Component, ViewChild } from "@angular/core";
import {
  IonicPage,
  Content,
  NavController,
  NavParams,
  Platform,
  ToastController,
  FabContainer,
} from "ionic-angular";
import { Storage } from "@ionic/storage";
import { HttpClient } from "@angular/common/http";
import { CommonService, ToastMessageType, ToastPlacement } from "../../../services/common.service";
import { SharedServices } from "../../services/sharedservice";
import { FirebaseService } from "../../../services/firebase.service";
import * as moment from "moment";
import * as _ from "lodash";
import { first } from "rxjs/operators";
import { HttpService } from "../../../services/http.service";
import { AppType } from "../../../shared/constants/module.constants";
import { EventEntity } from "./model/event.model";
/**
 * Generated class for the EventsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-events",
  templateUrl: "events.html",
  providers: [HttpService]
})
export class EventsPage {
  navigate;
  isShowPaymentModal: boolean = false;
  selectedType: boolean = true;
  eventType: boolean = false;
  isEventsFound: boolean = true;
  paidCount: number = 0;
  nestUrl: string = "";
  Events: Array<any> = [];
  TempEvents: Array<any> = [];
  ParentClubKey: string = "";
  currencycode: string = "";
  IsStorageEvents: boolean = false;
  isAndroid: boolean = true;
  isClearStorage: boolean = false;
  //this code for migrating event module in post-gres
  eventsDto = {
    parentclubId: "",
    clubId: "",
    activityId: "",
    memberId: "",
    action_type: 1,
    device_type: 0,
    app_type: 0,
    device_id: "",
    updated_by: "",
   
  }
  events:EventEntity[]=[]

  constructor(public navCtrl: NavController, public platform: Platform, public navParams: NavParams, public toastCtrl: ToastController, public commonService: CommonService, public fb: FirebaseService, public storage: Storage, public sharedService: SharedServices, public http: HttpClient,
    private httpService: HttpService,
    ) {
      this.nestUrl = this.sharedService.getnestURL();
      this.isAndroid = platform.is('android');
     
      storage.get('Currency').then((currency) => {
        let currencydets = JSON.parse(currency);
        //console.log(currencydets);
        this.currencycode = currencydets.CurrencySymbol;
      });
      this.eventsDto.app_type= AppType.ADMIN_NEW;
      //this.getData();
  }

  ionViewWillEnter() {
    console.log("call view enter method")
    this.eventsDto.parentclubId=this.sharedService.getPostgreParentClubId();
    console.log("call view enter parentclub id");
    this.getParentClubEvents();
    // this.commonService.category.pipe(first()).subscribe((data) => {
    //   console.log(`ionviewenter:${data}`);
    //   this.isClearStorage = data == "events" ? true : false;
    //   if (this.isClearStorage) {
    //     this.getData();
    //   }
    // });
  }

  getData() {
    this.storage.get("userObj").then((val) => {
      val = JSON.parse(val);
      if (val.$key != "") {
        this.ParentClubKey = val.UserInfo[0].ParentClubKey;
        //this.getClubList();
        //this.getEvents();
        this.getParentClubEvents();
      }
    });
  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad EventsPage");
  }

  clubs: Array<any> = [];
  //------------------- get data for clubs , activity ------------------------------------
  getClubList() {
    this.fb
      .getAllWithQuery("/Club/Type2/" + this.ParentClubKey, {
        orderByChild: "IsActive",
        equalTo: true,
      })
      .subscribe((data) => {
        this.clubs = data;
        this.checkPaymentSetup();
        console.log("club", this.clubs);
      });
  }

  //payment activity details
  checkPaymentSetup() {
    this.fb.getAll(`Activity/${this.ParentClubKey}`).subscribe(
      (res) => {
        //console.log(res);
        let showmodal: boolean = true;
        for (let i = 0; i < this.clubs.length; i++) {
          for (let j = 0; j < res.length; j++) {
            if (this.clubs[i].$key === res[j].$key) {
              for (let key in res[j]) {
                if (key != "$key") {
                  res[j][key].PaymentSetup =
                    this.commonService.convertFbObjectToArray(
                      res[j][key].PaymentSetup
                    );
                  //console.log(res[j][key].PaymentSetup);
                  for (let l = 0; l < res[j][key].PaymentSetup.length; l++) {
                    //RealEx
                    if (res[j][key].PaymentSetup[l].IsActive) {
                      if (
                        (res[j][key].PaymentSetup[l].PaymentGatewayName ==
                          "StripeConnect" ||
                          res[j][key].PaymentSetup[l].PaymentGatewayName ==
                            "RealEx") &&
                        res[j][key].PaymentSetup[l].SetupType == "Events"
                      ) {
                        showmodal = false;
                        this.isShowPaymentModal = false;
                      }
                    }
                  }
                }
              }
            }
          }
        }
        this.isShowPaymentModal = showmodal;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  //custom component for payment setup redirect
  GotoPaymentSetup() {
    this.isShowPaymentModal = false;
    let setup = {
      SetupName: "Events",
      DisplayName: "Events",
      ImageUrl:
        "https://firebasestorage.googleapis.com/v0/b/activityprouk-b5815/o/ActivityPro%2FActivityIcons%2Feventcalendar.svg?alt=media&token=294cf1f3-bb52-4b16-bfe5-64b45d9971f4",
    };
    this.navCtrl.push("StripeconnectsetuplistPage", { setupDetails: setup });
  }

  skip() {
    this.isShowPaymentModal = false;
  }
  checkLocalStorage() {}

  //Creating Event

  // doRefresh(event) {
  //   console.log('Begin async operation');
  //   setTimeout(() => {
  //     this.getEvents();
  //     event.complete();
  //   }, 3000)

  // }

  getEvents() {
    this.commonService.showLoader("Please wait...");
    let reqObj = {
      parentCLubKey: this.ParentClubKey,
      loggedInType: "admin",
      loggedInKey: "",
      filterType: this.selectedType ? "present" : "past",
    };
    this.Events = [];
    if (this.isClearStorage) {
      this.isClearStorage = false;
      this.commonService.updateCategory("");
    }
    //this.nestUrl = "http://localhost:3000";
    //this.fb.$post(`${this.nodeUrl}/event/listevents`, Obj).subscribe((data) => {
      this.fb.$post(`${this.nestUrl}/events/history`, reqObj).subscribe((data) => {
     
      this.IsStorageEvents = true;
      this.manipulateEvents(data.events);
    }, (err) => {
      this.commonService.hideLoader();
      console.log("err", err);
      //this.showToast("There is some problem,Please try again",2500);
    });
  }

  manipulateEvents(data: Array<any>) {
    this.Events = [];
    let monthArray = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC",
    ];
    for (let i = 0; i < data.length; i++) {
      if (data[i].IsActive) {
        let ticketsCount = 0;
        data["Member"] = this.commonService.convertFbObjectToArray(
          data["Member"]
        );
        this.paidCount = this.paidCount + data["Member"].length;
        data[i].TicketType = this.commonService.convertFbObjectToArray(
          data[i].TicketType
        );

        var start_date = moment(data[i].EventStartDate, "YYYY-MM-DD HH:mm");
        var end_date = moment(data[i].EventEndDate, "YYYY-MM-DD HH:mm");
        var duration = moment.duration(end_date.diff(start_date));
        var hours = duration.asHours();
        console.log(hours);

        if (data[i].Member) {
          _.forIn(data[i].Member, (member, Memberkey) => {
            _.forIn(member, (session, SesKey) => {
              _.forIn(session.TicketType, (tickettype, typeKey) => {
                _.forIn(tickettype, (ticket, ticketKey) => {
                  if (ticketKey != "TicketType") {
                    ticketsCount = ticketsCount + parseInt(ticket.TicketCount);
                  }
                });
              });
            });
          });
        }
        //data[i]["rem_tkts"] = data[i].Capacity - ticketsCount;
        data[i]["TicketsCount"] = ticketsCount;

        data[i].StartTime = moment(
          data[i].EventStartDate + "," + data[i].StartTime,
          "YYYY-MM-DD, hh:mm"
        ).format("hh:mm A");
        data[i].EndTime = moment(
          data[i].EventEndDate + "," + data[i].EndTime,
          "YYYY-MM-DD, hh:mm"
        ).format("hh:mm A");
        let startday = data[i].EventStartDate.split("-");
        data[i]["StartDay"] = startday[2];
        data[i]["StartMonth"] = monthArray[parseInt(startday[1]) - 1];

        let endday = data[i].EventEndDate.split("-");
        data[i]["EndDay"] = endday[2];
        data[i]["EndMonth"] = monthArray[parseInt(endday[1]) - 1];
        //console.log(data[i].TicketType);
        if (data[i].TicketType) {
          let costArry = [];
          data[i].TicketType.forEach((ticket: any) => {
            ticket.Categories = this.commonService.convertFbObjectToArray(
              ticket.Categories
            );
            let [fromcost, tocost] = this.findMinMax(ticket.Categories);
            costArry.push(fromcost, tocost);
          });

          data[i]["FromCost"] = Math.min(...costArry); // to get the small cost from array
          data[i]["ToCost"] = Math.max(...costArry); // to get the highest cost from array
        }

        this.Events.push(data[i]);
      }
    }
    this.isEventsFound = this.Events.length > 0 ? true : false;
    this.commonService.hideLoader();
    this.TempEvents = JSON.parse(JSON.stringify(this.Events));
    //this.getActiveTabEvents();
  }

  // getActiveTabEvents() {
  //   this.Events = [];
  //   if (!this.eventType) {
  //     this.Events = this.TempEvents.filter((event) => {
  //       //console.log(`${new Date(event.EventEndDate).getTime()}:${new Date(this.commonService.getTodaysDate()).getTime()}`);
  //       return new Date(event.EventEndDate).getTime() > new Date(this.commonService.getTodaysDate()).getTime()
  //     })
  //     this.isEventsFound = this.Events.length > 0 ? true : false;
  //   } else {
  //     this.Events = this.TempEvents.filter((event) => {
  //       return new Date(event.EventEndDate).getTime() <= new Date(this.commonService.getTodaysDate()).getTime()
  //     });
  //     this.isEventsFound = this.Events.length > 0 ? true : false;
  //   }
  //   this.Events = this.Events.sort(function (a, b) {
  //     return new Date(a.EventStartDate).getTime() - new Date(b.EventStartDate).getTime();
  //   });
  //   console.log(this.Events);

  //   if (!this.IsStorageEvents) {
  //     this.IsStorageEvents = false;
  //     this.getEvents();
  //   }
  // }

  //finding min&max ticket prices from array
  findMinMax(catarray: Array<any>) {
    //console.log(catarray);
    var lowest = Number.POSITIVE_INFINITY;
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i = catarray.length - 1; i >= 0; i--) {
      tmp = catarray[i].Cost || 0;
      if (tmp < lowest) lowest = tmp;
      if (tmp > highest) highest = tmp;
    }
    return [lowest, highest];
  }

  //Tabs Toggle b/w active&past
  changeType(val) {
    console.log("value of val:",val);
    this.selectedType = val;
    this.eventType = !val;
    //this.getActiveTabEvents();
   // this.eventsDto.action_type==val?1:0;
    // if(val==0){
    // this.eventsDto.action_type=1;
    // }else{
    //   this.eventsDto.action_type=0;
    // }
    if(this.selectedType == true){
      this.eventsDto.action_type=1
    }else{
      this.eventsDto.action_type=0
    }
    this.getParentClubEvents();
    //this.getEvents();
  }

  GotoDets(event: EventEntity) {
    //console.log(event);
    this.navCtrl.push("EventdetailsPage", { event_id: event.id});
  }

  GotoAdd(fab: FabContainer) {
    fab.close();
    this.navCtrl.push("AddeventPage");
  }
  GotoAddCaption(fab: FabContainer) {
    fab.close();
    this.navCtrl.push("AddcaptionPage");
  }

  showToast(m: string, howLongShow: number, value?: number) {
    let toast = this.toastCtrl.create({
      message: m,
      duration: howLongShow,
      cssClass: !value ? "error" : "success",
      position: "bottom",
    });
    toast.present();
  }


  getParentClubEvents(){
    console.log("input for events",this.eventsDto)
    this.httpService.post<{ data: {events:EventEntity[]} }>('events/get_parentclub_events', this.eventsDto)
    .subscribe({
        next: (res) => {
           this.events = res.data.events;
           this.isEventsFound = this.events.length > 0 ? true : false;
           console.log("resonse for parentclub events",JSON.stringify(res.data));
        },
        error: (err) => {
          console.error("Error fetching events:", err);
          this.commonService.toastMessage(
            'Failed to fetch events',
            2500,
            ToastMessageType.Error,
            ToastPlacement.Bottom
          );
        }
      });
  }
}
