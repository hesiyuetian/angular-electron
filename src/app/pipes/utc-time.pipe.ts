import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'utcTolocal'
})
export class UtcTolocal implements PipeTransform{
    transform(value: string) {
        if(!value) return value;

        //转化为utc时间格式
        // let utcTime = value.replace(' ', 'T')+'Z';

        let newDate = new Date(value);
        let YY = newDate.getFullYear() + '-';
        let MM = (newDate.getMonth() + 1 < 10 ? '0' + (newDate.getMonth() + 1) : newDate.getMonth() + 1) + '-';
        let DD = (newDate.getDate() < 10 ? '0' + (newDate.getDate()) : newDate.getDate());
        let hh = (newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours()) + ':';
        let mm = (newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes()) + ':';
        let ss = (newDate.getSeconds() < 10 ? '0' + newDate.getSeconds() : newDate.getSeconds());

        return YY + MM + DD +" "+hh + mm + ss
       
    }
}
