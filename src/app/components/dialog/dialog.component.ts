import { Component, OnInit, Input} from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  @Input() onDialogClose: Function;
  @Input() config: any;
  fadeFlag: string = 'fadeIn';
  constructor() { }

  ngOnInit() {
  }
  onButtonClick(callback:Function){
    callback(this.onDialogClose);
  }
  onThisDialogClose(){
    let _this = this;
    this.fadeFlag = 'fadeOut';
    setTimeout(function(){
        _this.onDialogClose();
    },250)//小于300
  }
}
