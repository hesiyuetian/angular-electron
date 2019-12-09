import { Component, OnInit, Input, } from '@angular/core';

@Component({
  selector: 'app-conter-alert',
  templateUrl: './conter-alert.component.html',
  styleUrls: ['./conter-alert.component.scss']
})
export class ConterAlertComponent implements OnInit {
  @Input() config: any ;
  @Input() onDialogClose: Function;
  fadeFlag: string = 'fadeIn';
  constructor() { }

  ngOnInit() {
  }

  sure() {
    // this.config.
  }

  close(){
    let _this = this;
    this.fadeFlag = 'fadeOut';
    setTimeout(function(){
        _this.onDialogClose();
    },250)//小于300
}

}
