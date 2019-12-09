import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SkinServiceService } from '../../service/skin-service.service'
// import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-no-data',
  templateUrl: './no-data.component.html',
  styleUrls: ['./no-data.component.scss']
})
export class NoDataComponent implements OnInit {
  public theme: String;
  @Input() tip: string;
  @Input() btnVal: string;
  @Output('back') back = new EventEmitter();

  constructor(
    private translate: TranslateService,
    private skin: SkinServiceService,
  ) { 
    this.theme = window.document.documentElement.getAttribute('data-theme-style');

    this.skin.getObservable().subscribe( res => {
      this.theme = res
    })
  }

  ngOnInit() {
  }

  go(){
    this.back.emit();
  }

}
