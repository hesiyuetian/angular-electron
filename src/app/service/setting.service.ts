import { Injectable } from '@angular/core';
import {Observable,Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private subject = new Subject<any>();
  constructor() {

  }
  
  get(){

  }

  /**
   * 监听订阅
   * @param type 
   */
  getObservable(): Observable<any> {
    return this.subject.asObservable();
  }

  /**
   * 设置订阅
   * @param type 
   */
  set(type){
    this.subject.next(type);
  }
  

  

}
