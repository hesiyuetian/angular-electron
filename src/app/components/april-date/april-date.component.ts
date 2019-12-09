import { Component, OnInit, Input, Output, ElementRef, Renderer2, EventEmitter} from '@angular/core';
import { MonthPipe } from '../../pipes/month.pipe'
import { FormatPipe }  from '../../pipes/format.pipe'
import { User } from '../../common/util/user'
declare var $;
@Component({
  selector: 'app-april-date',
  templateUrl: './april-date.component.html',
  styleUrls: ['./april-date.component.scss']
})
export class AprilDateComponent implements OnInit {
  @Input() defaultDate: any = new FormatPipe().transform(new Date(),4); 
  @Input() maxDate: string ; 
  @Input() minDate: string ;
  @Input() width: number = 100 ;
  @Input() height: number = 32 ;
  @Input() left: string ;
  @Input() color: string = '#606266';
  @Input() background: string = '#fff';
  @Input() locale: string = 'zh';
  @Input() isAuthMsp: boolean = false;
//   @Input() changeDate: Function = ()=>{};
  @Output('change') changeDate = new EventEmitter();

  @Input() date: any = '';
  daynamearr = ["日", "一", "二", "三", "四", "五", "六"];

  dayarr = [];
  year: number;
  month: number;
  day:any = '';
  wek:any = [];
  dis: boolean =false;
  
  toYear:any = new Date().getFullYear();
  toMonth:any = new Date().getMonth() + 1;
  toDay:any = new Date().getDate();
  defaultYear:any = '';
  defaultMonth:any = '';
  defaultDay:any = '';

  defaultI:any = null;
  defaultInd:any = null;

  private iconTop: number = -5;
  private timer: any;

  constructor(
    private el: ElementRef,
    private user: User,
    private renderer2: Renderer2
  ) {
    this.reset();
    window.onresize = _ => {
        clearTimeout(this.timer);
        this.timer = setTimeout(_ =>{
          this.listener();
        }, 300);  
    };
  }

  ngOnInit() {
    //   this.locale = this.user.getItem('language')
  }

  getLanguage(){
      return this.user.getItem('language')
  }

  reset(){
    this.date = this.date ? this.date : this.defaultDate;

    this.defaultYear = this.getDateYear(this.date);
    this.defaultMonth = this.getDateMonth(this.date);
    this.defaultDay = this.getDateDay(this.date);
    this.year = this.getDateYear(this.date);
    this.month = this.getDateMonth(this.date);
    this.day = this.getDateDay(this.date);
    this.daynamearr = this.getLanguage() === 'en' ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["日", "一", "二", "三", "四", "五", "六"] ,
    this.calculation();
  }
  getDateYear(date){
    return new Date(date.replace(/-/g, '/')).getFullYear()
  }
  getDateMonth(date){
      return new Date(date.replace(/-/g, '/')).getMonth() + 1
  }
  getDateDay(date){
      return new Date(date.replace(/-/g, '/')).getDate()
  }
  maxLimit(day){
      if(this.maxDate){
          if(this.year > this.getDateYear(this.maxDate))
              return true
          else if(this.year <= this.getDateYear(this.maxDate) && this.month > this.getDateMonth(this.maxDate))
              return true
          else if(day > this.getDateDay(this.maxDate)){
              if(this.month < this.getDateMonth(this.maxDate)){
                  return false
              }else{
                  return true
              }
          }else 
              return false
      }else{
          return false
      }
  }
  minLimit(day){
      if(this.minDate){
          if(this.year < this.getDateYear(this.minDate))
              return true
          else if(this.month < this.getDateMonth(this.minDate))
              return true
          else if(day < this.getDateDay(this.minDate)){
              if(this.getDateMonth(this.minDate) < this.month){
                  return false
              }else{
                  return true
              }
          }else 
              return false
      }else{
          return false
      }
  }
  calculation(){
      this.dayarr = [];
      this.wek = [];
      var themonth1stday = (new Date(this.year,this.month - 1,1)).getDay();
      var y:number = this.month == 12 ? this.year + 1:this.year;
      var m:number = this.month == 12 ? 1 :this.month;
      let _t:any = new Date(y,m,1)
      var themonthdaysamount = new Date(_t - 1).getDate();
      let _p:any = new Date(this.year,this.month - 1,1);
      var prevmonthlastday = new Date(_p - 1).getDate();
      while(themonth1stday-- > 0){
          this.dayarr.unshift({
              "day":prevmonthlastday--,
              "prevmonth":true,
          });
      };
      var count = 0;
      while (themonthdaysamount--){
          this.dayarr.push({
              "day":++count,
              "prevmonth": (this.maxLimit(count) || this.minLimit(count)) ? true : false
          });
      }
      var c = 42 - this.dayarr.length;
      var count2 = 1
      while (c-- > 0){
          this.dayarr.push({
              "day":count2++,
              "prevmonth": true,
              
          });
      }
      this.theweek();
  }
  theweek(){
      var _arr = [];
      for (var i=0;i<6;i++) {
          var _week = [];
          for (var j=0;j<7;j++) {
              _week.push(this.dayarr[i*7 + j]);
          }
          _arr.push(_week)
      }
      this.wek = _arr;
  }
  yeared(type){
      if(type=='pre'){
          this.year--
      }else{
          this.year++
      }
      this.calculation();
  }
  monted(type){
      if(type=='pre'){
          if(this.month-1 <= 0){
              this.month = 12
              this.year--
          }
          else
              this.month--
      }else{
          if(this.month++ < 12)
              this.month
          else{
              this.year++
              this.month = 1
          }
      }
      this.calculation();
  }
  cancel(){
      this.date = '';
      this.changeDate.emit(this.date)
  }
  infocus(){
      this.dis = true;
      this.reset();
      this.listener();
  }
  inblur(){
      this.dis = false;
  }
  infoc(){
      this.dis = true;
  }
  setD(type,val){
      if(!type){
          let f = this.year+'-'+this.month+'-'+val;
          this.date = new FormatPipe().transform(f,4);
          this.changeDate.emit(this.date)
          this.el.nativeElement.querySelector('#april-pc-data-time-s').blur();
      }
  }
  over(i,ind){
      this.defaultI = i;
      this.defaultInd = ind;
  }
  leave(){
      this.defaultI = null;
      this.defaultInd = null;
  }
  listener(){
    try{
        let _h = $(window).height() - $("#april-pc-data-time-s").offset().top - $(document).scrollTop();
        if( _h < 380 && this.isAuthMsp){
            this.height = -360;
            this.iconTop = 329;
        }
    }
    catch{
        // console.log('error')
    }
  }


}
