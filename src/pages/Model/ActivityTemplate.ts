
//import {IonicPage } from 'ionic-angular';
export class TemplateDetails{
    ActivityCode =""
    ActivityKey = "";
    ActivityName = "";
    TemplateName = "";
    Summary = "";
    IsActive:boolean =true;
}
export class Visible{
    DisplayText = "";
    IsActive:boolean = false;
    Order:number=Order.getOrderNumber();
    IsShow:boolean = true;
    Rating:number = 0;
    Key:string="";
    Comments:string = "";
    constructor(displayText){
        this.DisplayText = displayText;
    }
    setIsActive(data){
        this.IsActive = data;
    }
}
// only use to get ordernumber of visible items 
// dont export the Order class
class Order{
    static  OrderNumber:number = 0;
   static  getOrderNumber():number{
        if(this.OrderNumber >= DisplayText.displayText.length){
            Order.OrderNumber = 0;
        }
        this.OrderNumber = this.OrderNumber+1;
        return this.OrderNumber;
    }
}
// display text items
// any changes it reflects createtemplate page   
export class DisplayText{
   static displayText:string[] = [
       'Technical',
       'Physical',
       'Tactical',
       'Emotional',
       'FocusTournament',
       'Additional Item1',
       'Additional Item2',
       'Additional Item3',
       'Additional Item4',
       'Additional Item5',
       'Additional Item6',
       'Additional Item7',
       'Additional Item8',
       'Additional Item9',
       'Additional Item10'];
}
