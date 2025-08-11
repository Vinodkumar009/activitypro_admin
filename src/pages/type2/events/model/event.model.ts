import { ParentclubAccountType } from "../../../../shared/constants/module.constants";

export abstract class CommonRestInputTypeDefs_V1 {
    parentclubId?: string;
    clubId?: string;
    activityId?: string;
    memberId?: string;
    action_type?: number;
    device_type?: number;
    app_type?: number;
    device_id?: string;
    updated_by?: string;
  }

  export class GetEventDetsInputDTO extends CommonRestInputTypeDefs_V1 {
    readonly event_id: string;
  
    constructor(data: Partial<GetEventDetsInputDTO>) {
      super();
      Object.assign(this, data);
    }
  }
  
  //booking list input
  export class GetBookingListInputDTO extends CommonRestInputTypeDefs_V1 {
    readonly booking_id: string;
    readonly event_id: string;
    parentclub_key?: string;
  
    constructor(data: Partial<GetBookingListInputDTO>) {
      super();
      Object.assign(this, data);
    }
  }

  //booking dets input
  export class GetUserBookingDetsInputDTO extends CommonRestInputTypeDefs_V1 {
    
    readonly event_id: string;
  
    constructor(data: Partial<GetUserBookingDetsInputDTO>) {
      super();
      Object.assign(this, data);
    }
  }



  export class UpdateEventInputDto extends CommonRestInputTypeDefs_V1{
    readonly event_name: string;
    event_status: number; //public/private/draft
    event_type_id: string;//charity/event
    location_type: number;
    location_id: string;
    location_map_url:string;
    is_active:boolean;
    is_paid:boolean;
    speaker_trainer_avail:boolean;
    readonly location_name: string;
    readonly start_date: string;
    readonly end_date: string;
    readonly start_time: string;
    readonly end_time: string;
    readonly title_name: string;
    readonly is_title_event:boolean
    readonly title_img: string;
    readonly contact_name: string;
    readonly contact_no: string;
    readonly contact_email: string;
    readonly capacity: number;//give default to 200
    readonly description: string;
    readonly summary: string;
    readonly speaker_trainer_name: string;
    readonly speaker_trainer_url: string;
    readonly booking_until: string;
    readonly minimum_booking_count: number;
    readonly payment_method_id: string;
    readonly booking_btn_text: string;
    readonly cancel_btn_text: string;
    readonly event_tag: string;
    readonly other_info: string;
    readonly refund_policy: string;
    readonly booking_instruction: string;
    readonly website: string;
    readonly instagram: string;
    readonly twitter: string;
    readonly facebook: string;
    readonly doc_title: string;
    readonly doc_description: string;
    readonly club_id:string
    readonly document: string;//check is there other type supports instead of string
    readonly updated_by: string;

    constructor(data: Partial<UpdateEventInputDto>) {
        super();
        Object.assign(this, data);
    }
  }
  

  export class BookingStatsInputDTO extends CommonRestInputTypeDefs_V1 {
    readonly event_id: string;
    constructor(data: Partial<BookingStatsInputDTO>) {
      super();
      Object.assign(this, data);
    }
  }


  /****** output DTO's starts here *****/
  
  export class EventStats {
    event_id: string;
    total_bookings: number;
    total_event_capacity: number;
    total_amount: string;
  }


export interface Member {
    Id: string;
    FirstName: string;
    LastName: string;
  }
  
  export interface Ticket {
    id: string;
    member: Member;
  }
  
  export interface Event {
    id: string;
    event_name: string;
    start_date: string;
    end_date: string;
    event_date: string;
    transformed_end_date: string;
    transformed_start_date: string;
    event_complete_date: string;
  }

  export class BookingUser{
    Id: string;
    FirstName: string;
    LastName: string;
    FirebaseKey: string
  }
  
  export interface User {
    // Id: string;
    // FirstName: string;
    // LastName: string;
    // FirebaseKey: string;
    user_id:string;
    FirebaseKey:string;
    first_name:string;
    last_name:string;
    media_consent:string;
    medical_condition:string;
    dob:string;
    is_enable:boolean;
    is_child:boolean;
    gender:string;
    phone_number:string;
    email:string;
    parent_email:string;
    parent_phone_number:string;
    parent_id:string;
  }
  
  export interface BookingData {
    id: string;
    no_of_tickets_booked: number;
    total_amount:number;
    formatted_payment_date:string;
    user: User;
    event: Event;
    tickets: Ticket[];
    booked_for: string;
  }
  
  export interface UserBookings {
    status: number;
    message: string;
    data: BookingData[];
  }
  

  export interface EventBooking {
    id: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    deleted_at: string | null;
    updated_by: string;
    is_active: boolean;
    total_amount: string;
    stripe_connected_account: string | null;
    stripe_customer_id: string | null;
    capacity_left: number | null;
    enrollment_date: string;
    admin_fees: string | null;
    stripe_application_fee: string | null;
    code: string | null;
    payment_date: string | null;
    total_discount: string | null;
    payment_status: number;
    last_notified: string | null;
    no_of_tickets_booked: number;
    user: BookingUser;
    event: Event;
    transaction: Transaction;
    formatted_payment_date: string;
  }
  
  export interface Transaction {
    id: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    deleted_at: string | null;
    updated_by: string;
    is_active: boolean;
    discount_amount: string;
    total_fee: string;
    amount_paid: string;
    order_id: string | null;
    payment_date: string;
    amount_pay_status: number;
    paidby: number;
    paidby_text:string,
    formatted_payment_date:string;
    transaction_no: string;
    user_comments: string | null;
    admin_comments: string | null;
    hosted_invoice_url: string | null;
    invoice_pdf: string | null;
    system_comments: string | null;
    admin_fees: string;
    stripe_fees: string;
    invoice_id: string | null;
    tickets_bought: number;
    Discount_Type: string;
  }
  
  export interface TicketDetails {
    ticket_category_id: string;
    currency: string;
    per_ticket_price: string;
    ticket_quantity: number;
    total_amount: string;
    ticket_category: string;
  }
  
  export interface TicketType {
    ticket_type_id: string;
    ticket_type: string;
    tickets: TicketDetails[];
  }
  
  export interface  UserBookingDets{
    status: number;
    message: string;
    data: {
      event_booking: EventBooking;
      transaction: Transaction;
      tickets: TicketType[];
    };
  }




  /********* the bewlow datamodel created by prince *********/
  export interface EventsResponseDto {
    message: string;
    data: {
      events: EventEntity[]
      caption: EventCaptionEntity;
    }
  }
  
  
  export interface EventEntity {
    id: string
    parentclub: Parentclub,
    club: Club,
    event_name: string;
    event_location: string;
    location_type: number;
    location_id: string;
    event_url: string;//which we used for for web to redirect to particular event dets
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
  
    // @Column('varchar',{ nullable:false })
    // title: string;
    title_img_url: string;
    summary: string;
    is_speaker_trainer_avail: boolean;
    is_title_event: boolean;
    speaker_trainer_name: string;
    speaker_trainer_imgurl: string;
    description: string;
    confirm_btn_text: string;
    cancel_btn_text: string;
    booking_until: string;
    capacity: number;
    capacity_left: number;
    minimum_booking: number;
    stripe_account: string;
    lunch_dinner_avail: boolean;
    lunch_dinner_paid: boolean;
    lunch_dinner_price: number;
    snacks_avail: boolean;
    snacks_paid: boolean;
    snacks_price: number;
    softdrinks_avail: boolean;
    ticket_count:number;
    softdrinks_paid: boolean;
    softdrinks_price: number;
    is_parking_avail: boolean;
    is_parking_paid: boolean;
    parking_price: number;
    contact_name: string;
    contact_no: string;
    contact_email: string;
    event_tag: string;
    other_info: string;
    refund_policy: string;
    booking_instructions: string;
    facebook_url: string;
    instagram: string;
    website_url: string;
    twitter_url: string;
    doc_title: string;
    doc_description: string;
    doc_attachment_url: string;
    can_show_qr: boolean;
    status: number;
    ticket_type_ctgs: [];
    event_sponsors: [];
    discounts: [];
    event_type: EventType;
    event_date: string,
    transformed_end_date: string,
    transformed_start_date: string,
    min_max_amount: string
    is_paid: boolean
  }
  
  
  export interface EventCaptionEntity {
  
    parentclub: Parentclub;
  
  
    caption_header: string;
  
  
    caption_message: string;
  
  
    caption_img_url: string;
  }
  
  export class Parentclub {
    Id: string
    ParentClubName: string
  }
  export class Club {
    Id: string
    ClubName: string
    FirebaseId:string;
  }
  export class EventType {
    id: string
    name: string
  }
  
  
  // Main Event Data Model
  export interface EventDetail {
    event_info: EventInfo;
    tickets: Ticket[];
    discounts: Discount[];
    sponsors: Sponsor[];
    addons: Addon[];
  }
  
  // Event Information
  export interface EventInfo {
    id: string;
    event_name: string;
    status:number;
    address:string;
    event_location: string;
    location_type: number;
    location_id: string;
    location_map_url
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    is_title_event:boolean;
    title_img_url: string;
    summary: string;
    is_speaker_trainer_avail: boolean;
    speaker_trainer_name: string;
    speaker_trainer_imgurl:string;
    description: string;
    capacity: number;
    capacity_left: number;
    contact_name: string;
    contact_email: string;
    event_tag: string;
    other_info: string;
    refund_policy: string;
    booking_instructions: string;
    facebook_url: string;
    instagram: string;
    website_url: string;
    twitter_url: string;
    doc_title: string;
    doc_description: string;
    doc_attachment_url: string;
    parentclub: ParentClub;
    club: Club;
    event_type_global: EventTypeGlobal;
    event_sponsors: EventSponsor[];
    event_date: string;
    transformed_end_date: string;
    transformed_start_date: string;
    event_complete_date: string;
    location_lat: string;
    location_lng: string;
    location: string;
    min_max_amount: string;
    is_paid: boolean;
    minimum_booking:number;
    payment_method_id:string;
    booking_until:string;
    discount_apply_strategy:number;
    images_info: { img_url: string, description: string }[];
  }
  
  // Parent Club
  export interface ParentClub {
    Id: string;
    ParentClubName: string;
    FireBaseId: string;
  }
  
  // Club
  export interface Club {
    Id: string;
    ClubName: string;
  }
  
  // Event Type
  export interface EventTypeGlobal {
    id: string;
    name: string;
  }
  
  // Event Sponsors
  export interface EventSponsor {
    id: string;
    name: string;
    sponsor_info: string;
    sponsor_img_url: string;
  }
  
  // Ticket Data
  export interface EventTicket {
    is_selected?:boolean;
    is_available?:boolean;
    ticket_id:string;
    ticket_type: TicketType;
    categories: TicketCategory[];
  }
  
  // Ticket Type
  export interface TicketType {
    id: string;
    name: string;
    sequence: number;
  }
  
  // Ticket Category
  export class TicketCategory {
    ticket_id: string;
    category_id: string;
    name: string;
    price: number;
    fee: string;
    currency: string;
    extra_column: number;
    capacity: number;
    capacity_left: number;
    category_identifier:string;
    constructor(data: Partial<TicketCategory>) {
      Object.assign(this, data);
    }

  }
  
  // Discounts
  export class Discount {
    // Define discount properties if any (currently no structure is provided)
      id:string;
      name: string;
      valid_from: string;
      valid_til: string;
      discount_percent: number;
      discount_amount: number;
      used_count:number;
      quota:number;

      constructor(data: Partial<Discount>) {
        Object.assign(this, data);
      }

  }

  export class CouponDiscount {
    // Define discount properties if any (currently no structure is provided)
      id:string;
      name: string;
      code:string;
      valid_from: string;
      valid_til: string;
      discount_percent: number;
      discount_amount: number;
      used_count:number;
      quota:number;

      constructor(data: Partial<CouponDiscount>) {
        Object.assign(this, data);
      }
  }
  
  // Sponsors
  export interface Sponsor {
    id: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    deleted_at: string | null;
    updated_by: string;
    is_active: boolean;
    name: string;
    sponsor_info: string;
    sponsor_img_url: string;
  }
  
  // Add-ons
  export class Addon {
    id: string;
    pricing: number;
    quantity: number;
    status:number;
    is_paid:boolean;
    quantity_left: number | null;
    sequence: number | null;
    add_on_config: AddonConfig;

    constructor(data: Partial<Addon>) {
      Object.assign(this, data);
    }

  }
  
  // Add-on Configuration
  export interface AddonConfig {
    id: string;
    name: string;
    sequnce: number;
  }
  
  
  export interface SocialMedia {
    facebookUrl: string;
    instagramUrl: string;
    websiteUrl: string;
    twitterUrl: string;
  }
  
  export interface EventDocument {
    title: string;
    descriptionUrl: string;
    attachmentUrl: string;
  }
  
  export interface ParentClub {
    id: string;
    name: string;
    firebaseId: string;
  }
  
  export interface Club {
    id: string;
    name: string;
  }
  
  export interface EventType {
    id: string;
    name: string;
  }
  
  export interface EventSponsor {
    id: string;
    name: string;
    info: string;
    imgUrl: string;
  }
  
  export class CommonEventInputType{
    parentclubId: string
    clubId: string
    activityId: string
    memberId: string
    action_type: number
    device_type: number
    app_type: number
    device_id: string
    updated_by: string
  }
  
  export interface ExtendedEventInputType extends CommonEventInputType {
    caption_id: string;
    caption_header: string;
    caption_message: string;
    caption_url: string;
  }
  
  
  export interface GetCaption{
    id: string
    caption_header: string
    caption_message: string
    caption_img_url: string
    parentclub: {
        Id:string
        ParentClubName: string
    }
  }
  
  
  export interface CreateEventInputDto extends CommonEventInputType{
    created_by: string;
    name: string;
    event_type_id: string;  // originally labeled as Number, but seems to be a string (e.g., "charity/event")
    location_type: number;
    location_id: string;
    location: string;
    location_map_url:string
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    title_name: string;
    title_img: string;              // Optional property
    contact_name: string;           // Optional property
    contact_no: string;             // Optional property
    contact_email: string;          // Optional property
    capacity: number ;          // Default value is 200
    description?: string;            // Optional property
    speaker_trainer_name: string;   // Optional property
    speaker_trainer_url: string;    // Optional property
    summary:string;
    speaker_avail:boolean;
    event_images:string[]
    // constructor(data?: Partial<CreateEventInputDto>) {
    //     if (data) {
    //         Object.assign(this, data);
    //     }
    // }
  }
  
  
  export interface EventTypes {
    id: string;
    created_at: string;        // Use Date if you plan to manipulate as a Date object
    created_by: string;
    updated_at: string;
    updated_by: string;
    deleted_at: string | null; // Nullable type for deleted_at
    is_active: boolean;
    name: string;
  
  }
  
  export interface  EventLocation{
    id: string,
    name: string,
    type: number,
    map_url: string
  }
  

  export class UpdateTicketTypeDto extends CommonRestInputTypeDefs_V1{
    ticket_id:string; //can be ticket_type_id/ticket_type_category_id/
    label:string;
    constructor(data: Partial<UpdateTicketTypeDto>) {
      super();
      Object.assign(this, data);
    }
  }



  export class ParentclubStripeAccounts{
    payment_method_id:string;
    setup_name:string;
    currency_symbol:string;
    account_name:string;
  }

  export class EventTicketsDto {
    ticket_id: string;
    category_id:string;
    capacity: number;
    price: number;
    fee: number;
    label:string;
  }

  export class UpdateEventTicketDto extends CommonRestInputTypeDefs_V1{
    event_id: string;
    is_paid:boolean;
    stripe_acc_id:string;
    ticket_info: EventTicketsDto[];
    constructor(data: Partial<UpdateEventInputDto>) {
        super();
        Object.assign(this, data);
    }
  }

  export class UpdateAddOnInputDto extends CommonRestInputTypeDefs_V1{
    event_id:string;
    addon_id:string;
    is_paid:boolean;
    status:number;
    price:number;
    quantiy:number
    constructor(data: Partial<UpdateAddOnInputDto>) {
      super()
        Object.assign(this, data);
    }
  }

  export class EventDiscountInputDTO extends CommonRestInputTypeDefs_V1 {
    readonly event_id: string;
    readonly discount_id: string;
    readonly name: string;
    readonly valid_from: string;
    readonly valid_til: string;
    readonly amount: number
    readonly percentage: number;

    constructor(data: Partial<EventDiscountInputDTO>) {
      super();
      Object.assign(this, data);
    }
  }

  export class EventDiscountCouponInputDTO extends CommonRestInputTypeDefs_V1 {
    readonly event_id: string;
    readonly discount_id: string;
    readonly name: string;
    readonly valid_from: string;
    readonly valid_til: string;
    readonly amount: number
    readonly percentage: number;
    readonly code:string;
    readonly quota:number;

    constructor(data: Partial<EventDiscountInputDTO>) {
      super();
      Object.assign(this, data);
    }
  }



  export class PrintBookingReport {
    //StartDate: string;        // ISO string or formatted date
    //EndDate: string;          // ISO string or formatted date
    FirstName: string;
    VenueName:string;
    LastName: string;
    EventName: string;
    NoOfTickets: number;
    //MedicalCondition: string;
    //Age: string;              // Can be a formatted date or calculated age
    //Gender: string;           // Ensure consistent values (e.g., "Male", "Female", etc.)
    //PaymentStatus: string;    // Fixed or dynamic string like "Paid"
    //PhoneNumber: string;      // Support numeric or formatted strings
    //EmailID: string;
    PaymentDate:string;
    PaidAmount:string;
    DiscountAmount:string
  }


  export class ReportModel extends CommonRestInputTypeDefs_V1{ 
    parentclub_image:string;
    parentclub_name:string;
    club_name: string;
    to_address:string;
    from_address:string;
    cc_address:string;
    subject:string;
    reply_to_address:string;
    memer_list:PrintBookingReport[];
    msg_body: string;
    attachment_name: string;
  
    constructor(data: Partial<ReportModel>) {
      super();
      Object.assign(this, data);
    }
  
  }