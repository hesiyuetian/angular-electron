import { Component, OnInit, Input, Output, ElementRef, Renderer2, EventEmitter } from '@angular/core';
declare var $;
@Component({
  selector: 'app-april-time',
  templateUrl: './april-time.component.html',
  styleUrls: ['./april-time.component.scss']
})
export class AprilTimeComponent implements OnInit {
  @Input() height: number = 35 ;
  @Input() color: string = '#606266';
  @Input() background: string = '#fff';
  @Input() isAuthMsp: boolean = false;
  @Output('change') checkedBack = new EventEmitter();

  public tileList = [];
  public startTime: string = '00:00';
  public endTime: string = "23:30";

  public minutes: number = 0;
  public hourse: number = 0;
  
  public times: string = '';
  public dis: boolean = false;
  public timer: any;

  public iconTop: number = -5;
  constructor(
    private el: ElementRef,
    private renderer2: Renderer2
  ) { 
    this.init()

    window.onresize = _ => {
        clearTimeout(this.timer);
        this.timer = setTimeout(_ =>{
          this.listener();
        }, 300);  
    };
  }

  ngOnInit() {
  }
  init(){
    let startHourArray=this.startTime.split(':');
    let endHourArray=this.endTime.split(':');
    let startMove=parseInt(startHourArray[1])==30?1:0
    let endAdd=parseInt(endHourArray[1])==30?1:0
    let hourLong:number=((parseInt(endHourArray[0]))-parseInt(startHourArray[0]))*2-startMove+endAdd+1;

    this.minutes = Number(this.startTime.split(':')[1]);
    this.hourse = Number(this.startTime.split(':')[0]);

    for( var i = 0 ; i < hourLong ; i++){
      this.tileList.push(this.setHour(i,Number(startHourArray[1])))
    }
  }
  setHour(i,startHourArray){
    this.minutes = startHourArray + i * 30;
    if(this.minutes % 60 == 0 && this.minutes != 0){
      this.hourse += 1;
      this.minutes = 0;
    }else if(this.minutes == 0){
      this.minutes = 0;
    }else{
      this.minutes = 30;
    }
    return {
      txt: `${this.formot(this.hourse)}:${this.formot(this.minutes)}`
    }
  }
  formot(val){
    return val.toString().length == 1 ? `0${val}` : val
  }
  changeTime(time){
    this.times = time
    this.checkedBack.emit(time);
    this.el.nativeElement.querySelector('#april-time').blur();
  }

  listener(){
    try{
      let _h = $(window).height() - $("#april-time").offset().top - $(document).scrollTop();
      if( _h < 400 && this.isAuthMsp){
        this.height = -360;
        this.iconTop = 333;
      }
    }
    catch{
        console.log('error')
    }
  }
  
}
