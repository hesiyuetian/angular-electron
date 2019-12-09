import { Pipe, PipeTransform } from '@angular/core';
import BigNumber from 'bignumber.js';

@Pipe({
  name: 'fiterNumber'
})

// event                目标源
// decimalPointNumber   目标源保留多少位根据第三个参数判断是否保留多少位数
// isDecimalNumber      为true则保留 decimalPointNumber 位;  为false则判断小数点第一位< 5 ? 0 : 5;

export class FilterNumberPipe implements PipeTransform {
    transform(event: any, decimalPointNumber: number, isDecimalNumber: boolean = true) {
        // const target = new BigNumber(event);
        // if (target.isNaN()) {
        //     return null;
        // }

        event = event.replace('。', '.');
        event = event.replace(/[^\d\.]/g, '');
        event === '.' ? event = '' : '';
        const _split = event.split('.');
        if (_split.length && _split.length > 2) {
            let tempStr = '';
            for (const i in _split) {
                tempStr += _split[i];
                i === '0' ? tempStr += '.' : '';
            }
            event = tempStr;
        }

        // 判断小数点后的长度,并做限制
        const _float = event.split('.');
        if (_float.length && _float.length === 2) {
            _float[0] === '' ? _float[0] = '0' : '';
            if (isDecimalNumber) {
                event = _float[0] + '.' + _float[1].slice(0, decimalPointNumber);
            } else {
                let _onePoint = _float[1].slice(0, 1);
                if (_float[1] !== '') {
                    _onePoint = _float[1].slice(0, 1) < '5' ? '0' : '5';
                }
                event = _float[0] + '.' + _onePoint;
            }
        }

        return event;
    }

}