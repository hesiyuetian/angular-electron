import { Component, OnInit, Input, Output, ElementRef, Renderer2, EventEmitter } from '@angular/core';
import {SelectInterface} from '../../interface/select.interface'
import { SkinServiceService } from '../../service/skin-service.service'
import { User } from '../../common/util/user'
@Component({
  selector: 'app-april-select',
  templateUrl: './april-select.component.html',
  styleUrls: ['./april-select.component.scss']
})
export class AprilSelectComponent implements OnInit {
  public setLang: any;
  @Input() defaultset: any;
  @Input() height: number = 32;
  public dis: boolean = false;
  @Input() placeholder: any = '';
  @Input() list: Array<SelectInterface>;
  @Output('change') checkedBack = new EventEmitter();

  // zh   en
  public language: string = this.user.getItem('language') || 'en';
  constructor(
    private el: ElementRef,
    public skin: SkinServiceService,
    public user: User,
    private renderer2: Renderer2
  ) { 
    this.skin.getLangObservable().subscribe( res => {
      this.language = res;
      this.filter();
    })
  }

  ngOnInit() {
    setTimeout(_ => {
      this.filter();
    },500)
  }
  filter(){
    let item = this.list;
    for(let i in item){
      if(this.defaultset !== ''){
        if(item[i].val == this.defaultset)
          return this.setLang = this.language == 'en' ? item[i].enName : item[i].zhName
      }
      // else
      //   return this.setLang = item[i].name, this.defaultset = item[i].val ;
    }
  }
  sel(val,event){
    event.stopPropagation();
    this.el.nativeElement.querySelector('.select-box').blur();
    this.defaultset = val;
    this.filter();
    this.checkedBack.emit(val);
  }
}

