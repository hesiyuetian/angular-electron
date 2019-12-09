import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

// import { Router } from '@angular/router'; 
@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {
  @Input() onDialogClose: Function;
  @Input() config: any ;
  // config = {
  //   title: '您已“申请通过”，已在白名单中请等待开始',
  //   type: 'success' 'fail'  'ing', 'wain'
  //   label: 1 单行文字    2 两行文字加左侧对号图标

  //   可不写下面配置项
  //   width: '460',
  //   height: '66',
  //   top: '120'
  // }

  constructor(
    public translate: TranslateService
  ) { 
    
  }

  ngOnInit() {
    setTimeout(_ => {
      this.onDialogClose();
    },5000)
  }

}
