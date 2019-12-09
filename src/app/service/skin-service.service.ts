import { Injectable } from '@angular/core';
import {Observable,Subject} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {service} from '../common/util/service'
import { User } from '../common/util/user'
@Injectable({
  providedIn: 'root'
})
export class SkinServiceService {
  private subject = new Subject<any>();
  private subjectLang = new Subject<any>();
  public lang: string = 'en';
  constructor(
    private translate: TranslateService,
    private service: service,
    private user: User
    ) {
      // this.init()
  }

  init(){
    // this.lang = this.user.getItem('language') == 'en' ? this.user.getItem('language') : 'zh';
    // this.setLang(this.lang);
  }


  /*==========================主题===========================*/

  //  * @@@ 发布
  set(type: string) {
    this.user.setItem('theme',type);
    window.document.documentElement.setAttribute('data-theme-style', type);
    this.subject.next(type);
  }

  // *  @@@ 订阅
  getObservable(): Observable<any> {
    return this.subject.asObservable();
  }


  /*==========================语言===========================*/

  setLang(type: string){
    this.user.setItem('language',type);
    this.lang = type;
    this.subjectLang.next(type);
  }

  getLangObservable(): Observable<any> {
    return this.subjectLang.asObservable();
  }


}
