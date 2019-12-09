import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sensitive'
})
export class SensitivePipe implements PipeTransform {

  transform(value: any) {
    if(value){
      /* 部分隐藏处理
      ** value 需要处理的字符串
      ** frontLen 保留的前几位
      ** endLen 保留的后几位
      ** cha 替换的字符串
      */
      let frontLen: number = 8, endLen: number = 4, cha: string = '.';
      var len = 6;
      var xing = '';
      for (var i = 0; i < len; i++) {
        xing += cha;
      }
      return value.substring(0, frontLen) + xing + value.substring(value.length - endLen);
    }
    else
      return ''
  }

}
