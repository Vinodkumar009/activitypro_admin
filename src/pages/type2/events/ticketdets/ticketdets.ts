import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { HttpService } from '../../../../services/http.service';
import { AppType } from '../../../../shared/constants/module.constants';
import { SharedServices } from '../../../services/sharedservice';
import { GetUserBookingDetsInputDTO, UserBookingDets } from '../model/event.model';
import { API } from '../../../../shared/constants/api_constants';
import { CommonService, ToastMessageType, ToastPlacement } from '../../../../services/common.service';
/**
 * Generated class for the TicketdetsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-ticketdets',
  templateUrl: 'ticketdets.html',
  providers: [HttpService]
})
export class TicketdetsPage {
  currencycode: string = "";
  booking_id:string = "";
  postgre_parentclub_id:string = '';
  booking_dets:UserBookingDets;
  event_name:string = "";
  user_name:string = "";
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public storage: Storage,
    private httpService: HttpService,
    public sharedService: SharedServices, 
    public commonService: CommonService,
  ) {
    this.booking_id = this.navParams.get('booking_id');
    console.log(this.booking_id);
    this.getBookingInfo()
  }

  ionViewDidLoad() {
    this.storage.get('Currency').then((val) => {
      val = JSON.parse(val);
      this.currencycode = val.CurrencyCode;
      //console.log(this.currencycode);
    });
  }

  getBookingInfo(){
    this.commonService.showLoader("Please wait")
    const bookings_input = {
      booking_id:this.booking_id,
      parentclubId:this.postgre_parentclub_id,
      device_type:this.sharedService.getPlatform() == "android" ? 1:2,
      updated_by:this.sharedService.getLoggedInId(),
      device_id:this.sharedService.getDeviceId() || "",
      app_type:AppType.ADMIN_NEW
    }    
    const bookingDetailsDTO = new GetUserBookingDetsInputDTO(bookings_input);
    console.log(bookingDetailsDTO);
    console.log("input for bookinginfo",bookingDetailsDTO)
    this.httpService.post<UserBookingDets>(`${API.GET_BOOKING_DETS}`, bookingDetailsDTO)
    .subscribe({
        next: (res) => {
          this.commonService.hideLoader();
           console.log("event user bookings",JSON.stringify(res));
           this.booking_dets = res;
           this.event_name = this.booking_dets.data.event_booking.event.event_name;
           this.user_name = this.booking_dets.data.event_booking.user.FirstName+" "+this.booking_dets.data.event_booking.user.LastName;
        },
        error: (err) => {
          this.commonService.hideLoader();
          console.error("Error fetching events:", err);
          this.commonService.toastMessage('Failed to fetch bookings',2500,ToastMessageType.Error,ToastPlacement.Bottom);
        }
    });
  }

}
