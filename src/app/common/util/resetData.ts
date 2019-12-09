import {Injectable} from '@angular/core';
import {User} from './user';
import {service} from './service';
import {regular} from './regular';

@Injectable()
export class resetData {
    public pairPromise: any;
    public coinPromise: any;
    public raleUSDTObject: object = {
        BTC: 0,
        ETH: 0,
        USDT: 0,
    };
    public USD: number = 1;
    constructor(
        private service: service,
        private user: User,
        private regular: regular
    ) {
        this.pairs();
        this.coins();
        this.getUsd();
    }


    /**
     * 获取所有交易对
     */
    pairs(): void {
        this.pairPromise = new Promise((resolve, reject) => {
            this.service.pairs()
                .then((res: any) => {
                    if (res.status === 0) {
                        resolve(res.data);
                        if (!this.user.getItem('defaultSymbol') && res.data.length > 0) {
                            this.user.setItem('defaultSymbol', res.data[0].pair);
                        }
                    }
                })
        });
    }

    async getPairs(): Promise<any> {
        return await this.pairPromise;
    }

    /**
     * 获取所有币种
     */
    coins(): void {
        this.coinPromise = new Promise((resolve, reject) => {
            this.service.coins().then((res: any) => {
                if (res.status === 0) {
                    resolve(res.data);
                }
            });
        });
    }

    async getCoins(): Promise<any> {
        return await this.coinPromise;
    }

    /**
     * caleUSDT
     * @param tickerListObj
     */
    caleUSDT(tickerListObj: object): void{
        this.raleUSDTObject = {
            BTC: this.regular.toBigsells([tickerListObj['BTC_USDT'] ? tickerListObj['BTC_USDT'].close : 0, this.USD], 4),
            ETH: this.regular.toBigsells([tickerListObj['ETH_USDT'] ? tickerListObj['ETH_USDT'].close : 0, this.USD], 4),
            USDT: this.regular.toBigsells([1, this.USD], 4) || 1.003
        };
    }

    /**
     * 匹配币种  获取并计算该币对应BTC的价格
     * @param symbol  币种
     * @param available  可用余额
     * @param usdtVal  usdt价值
     * @param tickerListObj  行情对象
     */
    matchPair(symbol: string, available: string, usdtVal: number, tickerListObj:any): string {
        if(symbol === "BTC") return this.regular.toFixed(available, 8);
        if(tickerListObj['BTC_USDT'] == 0) return "0.00000000";
        return tickerListObj['BTC_USDT'] ? this.regular.toDividedByAry([usdtVal, tickerListObj['BTC_USDT']], 8) : "0.00000000"
    }

    /**
     * 计算symbol ==> USD的价格
     * @param symbol  币种
     * @param tickerListObj  行情对象
     * @param available 可用余额
     */
    raleUsdt(symbol, available, tickerListObj:any): string {
        if(symbol === "USDT"){
            return this.regular.toBigsells([this.raleUSDTObject[symbol], available], 4)
        }else{
            if(tickerListObj[`${symbol}_USDT`]){
                return this.regular.toBigsells([this.raleUSDTObject['USDT'], tickerListObj[`${symbol}_USDT`], available], 4)
            }else if(tickerListObj[`${symbol}_BTC`]){
                return this.regular.toBigsells([this.raleUSDTObject['BTC'], tickerListObj[`${symbol}_BTC`], available], 4)
            }else if(tickerListObj[`${symbol}_ETH`]){
                return this.regular.toBigsells([this.raleUSDTObject['ETH'], tickerListObj[`${symbol}_ETH`], available], 4)
            }else return "0.0000"
        }
    }

    /**
     * getUsd
     * 获取 BTC ==> USDT的价格
     */
    getUsd(): Promise<any> {
        return this.service.getUsdtToUsd().then(res => {
            this.USD = res.data.USD || 1;
        })
    }

}
