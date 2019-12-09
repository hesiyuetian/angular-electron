import { Injectable } from '@angular/core';
import io from 'socket.io-client';
import {Observable,Subject} from 'rxjs';
import { User } from '../common/util/user';
import { regular } from '../common/util/regular'
import { service } from '../common/util/service'
import { CONFIG } from '../common/util/config'
import { AuxBtService } from '../service/aux-bt.service'
import {resetData} from '../common/util/resetData';

@Injectable({
    providedIn: 'root'
})
export class ScokeIoService {
    private subject = new Subject<any>();
    private subDepthJect = new Subject<any>();
    private subTickJect = new Subject<any>();
    private subPriceJect = new Subject<any>();
    private subModeJect = new Subject<any>();
    private subTileDirectionJect = new Subject<any>();
    private subTradJect = new Subject<any>();
    socket: any;
    symbol: any;

    isClientSocket: boolean = true;
    addEventSocketFlag: boolean = true;

    //ws连接成功后首次订阅标识
    resetSocketSubscribeFlag: boolean = true;

    pairList: Array<any> = [];

    constructor(
        public user: User,
        public service: service,
        public auxBt: AuxBtService,
        public regular: regular,
        private reset: resetData,
    ) {
        this.reset.getPairs().then( (res:any) => {
            for(let item of res){
                this.pairList.push(`ticker:${item.pair}`);
            }
            this.subscribeTicker();
        })
    }

    /**
     * 初始化ws
     * @flag 是否需要订阅
     * @symbol 交易对
     */
    onCenten(flag ,pair?){
        this.addEventSocketFlag = true;
        pair && (this.symbol = pair);
        let url = CONFIG.wsUrl;
        if(this.isClientSocket){
            this.socket = io( url , { //"http://172.16.24.76:9001"
                path: '/realtime',
                reconnection: true,
                reconnectionAttempts: 41,
                reconnectionDelay: 3000,
                reconnectionDelayMax: 3000,
            });
            this.isClientSocket = false;
        }else if(flag){
            this.isTokekSubscribe()
        }
        this.addEventSocket();
        this.wsReceiveSocket();
    }

    /**
     * 监听WS状态
     */
    addEventSocket(){
        if(this.socket){
            this.socket.on('connect_timeout', function(data){
                console.log('链接超时 - connect_timeout');
            });

            this.socket.on('reconnect', (res) => {
                console.log('reconnect');
            });

            this.socket.on('disconnect', (res:any) => {
                this.resetSocketSubscribeFlag = true;
                this.socket.close();
                this.socket = null;
                if(this.addEventSocketFlag){
                    this.isClientSocket = true;
                    this.onCenten(true);
                }
            })
        }
    }

    /**
     * WS切换交易对
     * @pair 交易对，切换交易对时必须要传，方便ws断开重连
     */
    subscribe(pair?:string, isUnsubscribe?:boolean){
        if(isUnsubscribe) this.isTokekUnsubscribe(this.symbol);

        if(pair) this.symbol = pair;

        if(this.socket){
            this.isTokekSubscribe()
        }
    }

    /**
     * 登录
     */
     login(){
        // await this.service.timestamp();
        // let params = {
        //     channel: CONFIG.channel,
        //     user:  this.user.userId(),
        //     timestamp : this.service.time,
        //     sig: this.auxBt.loginSign(this.service.time,this.user.userId(),CONFIG.channel)
        // };
        this.socket.emit('login', this.user.token(), (data:any) => { })
    }

    /**
     *  订阅 登录和非登录情况
     */
    isTokekSubscribe(){
        if(this.user.token()) {
            if(this.pairList){
                this.socket.emit('subscribe',[`depth:${this.symbol}`, `trade:${this.symbol}`, `order:${this.symbol}`, `account:${this.symbol.split('_')[0]}`, `account:${this.symbol.split('_')[1]}`, ...this.pairList], res=>{ });
            }else{
                this.socket.emit('subscribe',[`depth:${this.symbol}`, `trade:${this.symbol}`, `order:${this.symbol}`, `account:${this.symbol.split('_')[0]}`, `account:${this.symbol.split('_')[1]}`], res=>{ });
            }
            this.login();
        }else{
            if(this.pairList){
                this.socket.emit('subscribe',[`depth:${this.symbol}`,`trade:${this.symbol}`, ...this.pairList], res=>{ })
            }else{
                this.socket.emit('subscribe',[`depth:${this.symbol}`,`trade:${this.symbol}`], res=>{ })
            }
        }
    }

    /**
     *  取消订阅 登录和非登录情况
     */
    isTokekUnsubscribe(symbol){
        let params:Array<any>;
        if(this.user.token())
            params = [`depth:${symbol}`,`trade:${symbol}`, `order:${symbol}`, `account:${symbol.split('_')[0]}`, `account:${symbol.split('_')[1]}`];
        else
            params = [`depth:${symbol}`,`trade:${symbol}`];

        this.socket.emit('unsubscribe', params, res=>{ })
    }

    /**
     * 订阅ticker
     */
    subscribeTicker() {
        if(this.socket){
            this.socket.emit('subscribe',[...this.pairList], res=>{ })
        }
    }

    /**
     * 取消订阅ticker
     */
    unsubscribeTicker() {
        this.socket.emit('unsubscribe',[...this.pairList], res=>{ })
    }


    /**
     * 监听
     */
    wsReceiveSocket() {
        this.socket.on('connect', res => {
            this.subscribeTicker();
            if(this.symbol && this.resetSocketSubscribeFlag){
                console.log('connect--监听', this.resetSocketSubscribeFlag);
                this.isTokekSubscribe();
                this.resetSocketSubscribeFlag = false;
            }

            this.socket.on("trade",res=>{ /*  Trade - 最新交易 */
                if(res.data.length > 0 && res.data[0].pair !== this.symbol)  return ;
                let data = { type:'trade', result: null};
                data.result = res;
                this.subject.next(data);
            });

            this.socket.on("depth",res=>{ /*  Depth - 深度数据 */
                let copyData = JSON.parse(JSON.stringify(res));
                if(copyData.data.pair !== this.symbol) return ;
                let data = { type:'depth', result: null};
                copyData.data.buys = this.regular.makeDepth(copyData.data.buys);
                copyData.data.sells = this.regular.makeDepth(copyData.data.sells);
                data.result = copyData;
                this.subject.next(data);
            });

            this.socket.on("ticker",res=>{    /*  Ticker - 最新价格 */
                let data = { type:'ticker', result: null};
                data.result = res;
                this.subject.next(data);
            });

            this.socket.on("order",res=>{    /*  order - 订单数据 */
                let data = { type:'order', result: null};
                data.result = res;
                this.subject.next(data);
            });

            this.socket.on("account",res=>{    /*  account - 交易对余额 */
                let data = { type:'account', result: null};
                data.result = res;
                this.subject.next(data);
            });

        })
    }

    /**
     * 关闭WS
     */
    wsCloseSocket() {
        if(this.socket){
            let params:Array<any>;
            if(this.symbol){
                if(this.user.token())
                    params = [`depth:${this.symbol}`,`trade:${this.symbol}`, `order: ${this.symbol}`, `account:${this.symbol.split('_')[0]}`, `account:${this.symbol.split('_')[1]}`, ...this.pairList];
                else
                    params = [`depth:${this.symbol}`,`trade:${this.symbol}`, ...this.pairList];
            }else{
                params = [...this.pairList];
            }


            this.socket.emit('unsubscribe', params, res=>{

            });
        }
    }

    getSubObservable(): Observable<any> {
        return this.subject.asObservable();
    }
    /*==========================WS_End===========================*/






    /*==========================深度图推送深度数据===========================*/

    // 绘制深度图
    setDepth(data){
        this.subDepthJect.next(data);
    }

    // *  @@@ 订阅
    getObservable(): Observable<any> {
        return this.subDepthJect.asObservable();
    }



    /*==========================深度价格===========================*/


    setTick(data){
        this.subTickJect.next(data);
    }

    // *  @@@ 订阅
    getTickObservable(): Observable<any> {
        return this.subTickJect.asObservable();
    }



    /*==========================深度价格(该币对最新价格)===========================*/

    // 深度价格
    setPrice(data){
        this.subPriceJect.next(data);
    }

    // *  @@@ 订阅
    getPriceObservable(): Observable<any> {
        return this.subPriceJect.asObservable();
    }


    /*==========================切换交易页面的UI展示模式===========================*/

    // 切换交易页面的UI展示模式
    setMode(data:any){
        this.subModeJect.next(data);
    }

    // *  @@@ 订阅
    getModeObservable(): Observable<any> {
        return this.subModeJect.asObservable();
    }



    /*==========================tile UI展示模式下 k线深度图向左向右展开按钮===========================*/

    // k线深度图向左向右展开按钮
    setTileDirection(data:any){
        // data = {
        //     type: type,  // leftDirec: 左边按钮    rightDirec: 右边按钮
        //     direc: direc   // true: (leftDirec -> 向左    rightDirec -> 向右)     false: (leftDirec -> 向右    rightDirec -> 向左)
        // }
        this.subTileDirectionJect.next(data);
    }

    // *  @@@ 订阅
    getTileDirectionObservable(): Observable<any> {
        return this.subTileDirectionJect.asObservable();
    }
}
