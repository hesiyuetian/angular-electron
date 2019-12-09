import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-waring-alert',
  templateUrl: './waring-alert.component.html',
  styleUrls: ['./waring-alert.component.scss']
})
export class WaringAlertComponent implements OnInit {
  @Input() onDialogClose: Function;
  @Input() config: any;

  // config = {
  //   title: '标题',
  //   btnVal: '按钮名字',
  //   link: '按钮跳转链接',
  //   label: 空或者1  警告   2 成功
  // }
  fadeFlag: string = 'fadeIn';
  constructor(
    public router: Router
  ) { }

  ngOnInit() {
    // setTimeout(()=>{
    //   this.onDialogClose();
    //   },250)//小于300
  }

  onThisDialogClose(){
    let _this = this;
    // this.fadeFlag = 'fadeOut';
    // setTimeout(function(){
        _this.onDialogClose();
    // },250)//小于300
  }

  go(){
    this.onDialogClose();
    this.router.navigateByUrl(this.config.link);
  }

}
  