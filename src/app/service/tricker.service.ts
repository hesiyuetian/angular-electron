import { Injectable } from '@angular/core';
import {Observable,Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrickerService {
  private subject = new Subject<any>();
  private subTickListject = new Subject<any>();
  private tickerList = [];
  constructor() {

  }

  get(){

  }

  /**
   * 设置订阅收藏币对
   * @param type
   */
  set(type){
    this.subject.next(type);
  }

  /**
   * 监听订阅
   * @param type
   */
  getObservable(): Observable<any> {
    return this.subject.asObservable();
  }


  /**
   * 目的：K线上面的usdt计算
   * 设置订阅市场行情数据
   */
  setTickList(data){
      if(this.tickerList.length < 1){
          this.tickerList = data;
          this.subTickListject.next(data);
      }
  }

  /**
   * 监听订阅市场行情数据
   */
  getTickListObservable(): Observable<any> {
    return this.subTickListject.asObservable();
  }



}
