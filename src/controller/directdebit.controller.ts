export  class DirectDebitController{
    public static isProduction = false;
    private static endPoint:string;
    private static  prodPoint:string = "https://us-central1-activityprouk-b5815.cloudfunctions.net";
    private  static devPoint:string = "https://us-central1-timekare-app.cloudfunctions.net";
    private static  paymentControllersName = {
        'checkAccessToken':'/validateClubMemberForAccessToken',
        'initiateMandate':'/initiateMandates',
        'completeFlow':'/completeRedirectFlow',
        'oneOffPayment':'/oneOffPayment',
        'subscription':'/subscriptionPayment'
    }
    constructor(){
        if(DirectDebitController.isProduction){
            DirectDebitController.endPoint = DirectDebitController.prodPoint;
        }else{
            DirectDebitController.endPoint = DirectDebitController.devPoint;
        }
    }
    public static getObject(){
        return this;
    }
    public getApi(name){
        
        return DirectDebitController.endPoint+DirectDebitController.paymentControllersName[name];
    }
}