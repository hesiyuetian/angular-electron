import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'format'
})
export class FormatPipe implements PipeTransform {
  transform(time: any, status: any): any {
    var t = time
    var commonTime = new Date(t)
    var y:any =
      commonTime.getFullYear() >= 10
        ? commonTime.getFullYear()
        : '0' + commonTime.getFullYear()
    var month:any =
      commonTime.getMonth() + 1 >= 10
        ? commonTime.getMonth() + 1
        : '0' + (commonTime.getMonth() + 1)
    var d:any =
      commonTime.getDate() >= 10
        ? commonTime.getDate()
        : '0' + commonTime.getDate()
    var h:any =
      commonTime.getHours() >= 10
        ? commonTime.getHours()
        : '0' + commonTime.getHours()
    var m:any =
      commonTime.getMinutes() >= 10
        ? commonTime.getMinutes()
        : '0' + commonTime.getMinutes()
    var s:any =
      commonTime.getSeconds() >= 10
        ? commonTime.getSeconds()
        : '0' + commonTime.getSeconds()
    if (status === 1) {
      return h + ':' + m + ':' + s
    } else if (status === 2) {
      return y + '-' + month + '-' + d + ' ' + h + ':' + m
    } else if (status === 3) {
      return y + '-' + month + '-' + d + ' ' + h + ':' + m + ':' + s
    } else if (status === 4) {
      return y + '-' + month + '-' + d
    }else if (status === 5 ) {  // 本地时间转UTC时间  timestamp
        return Date.UTC(y, month, d, h, m, s);
    }else if (status === 6 ) {  // 本地时间转UTC时间  timestamp
        return month + '-' + d
    }
  }
}
