import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'txt'
})
export class Txt implements PipeTransform{
    transform(value: string) {
        if(!value) return value;
        let numb = value;
        if(value.indexOf('.') != -1){
            for(let i=numb.length; i--; i<=0){
                if(numb.substring(i, i+1) == '.'){
                    break;
                }else{
                    if(numb.substring(i, i+1) == '0'){
                        numb = numb.substring(0, i);
                    }else{
                        break;
                    }
                }
            }
        }
        return numb;
    }
}