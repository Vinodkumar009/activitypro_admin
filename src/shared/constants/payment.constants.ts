export enum PaymentTypes {
    CASH = 0,
    //ONLINE = 1,
    BACS = 2,
    CHILDCAREVOUCHER = 3,
    //WALLET = 4,
    CHEQUE = 5,
  }

  export enum PaymentStatus {
    DUE = 0,
    PAID = 1,
    PENDINGVERIFICATION = 3,
  }

  export const PaymentStatusText = {
    0 : "Due",
    1 : "Paid",
    3 : "Pending Verification",
  }

  export const PaymentPaidStatusText = {
    0 : "Cash",
    1 : "Online",
    2 : "BACS" ,
    3 : "Childcare Voucher",
    4 : "Wallet",
    5 : "Cheque" 
   }

  export enum PaymentMethod {
    CASH = 0,
    ONLINE = 1,
    BACS = 2,
    CHILDCAREVOUCHER = 3,
    WALLET = 4,
    CHEQUE = 5,
  }

  export enum SubscriptionStatus {
    ENROLLED = 0,
    SUBSCRIBED = 1,
    CANCELLED = 2,
    PAYMENT_FAILED = 3,
  }


  export enum PaymentSetupType {
    SSESSIONMANAGEMENT = "Session Management",
    COURTBOOKING = "Court Booking",
    EVENTS = "Events",
    MEMBERSHIP = "Membership"
  }

  

  
  