import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { service } from '../../../common/util/service'
import { regular } from '../../../common/util/regular'
import { User } from '../../../common/util/user'
import { resetData } from '../../../common/util/resetData'
import { Loadings } from '../../loadings/loadings'
import { ScokeIoService } from '../../../service/scoke-io.service'
import { DialogController } from '../../../controller/dialog'
import {Subscription} from 'rxjs';
@Component({
    selector: 'app-new-trade',
    templateUrl: './new-trade.component.html',
    styleUrls: ['./new-trade.component.scss']
})
export class NewTradeComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    // 当前币对
    symbol: string;
    // 当前币对精度
    precision: any = {
        amountPrecision: 4,
        basePrecision: 4,
        pricePrecision: 4,
        minSize: 1
    };
    // 最新交易列表
    newTradList: Array<any> = [];
    // 交易列表是否加载完成
    loadTrade: boolean = true;

    //ws-节流队列
    handleControlCenter: Array<any> = [];
    //ws-节流队列falg
    handleControlFlag: boolean = true;

    constructor(
        private activatedRouter: ActivatedRoute,
        public regular: regular,
        public scoket: ScokeIoService,
        public user: User,
        public resetData: resetData,
        public dialog: DialogController,
    ) {
        this.activatedRouter.params.subscribe(params => {
            this.symbol = this.activatedRouter.snapshot.params['symbol'] || 'BTC_USDT';
            this.resetData.getPairs().then( (res:any) => {
                for(let item of res){
                    if(item.pair === this.symbol){

                        this.precision = {
                            amountPrecision: item.amount_precision,
                            basePrecision: item.base_precision,
                            pricePrecision: item.price_precision,
                            minSize: this.regular.fanToNum(item.min_amount)
                        };
                        break;
                    }
                }
                this.init();
            })
        });
    }

    ngOnInit() {
        this.subWsServe();
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅ws服务
     */
    subWsServe(): void{
        this.subServe.add(this.scoket.getSubObservable().subscribe(res => {
            if (res.type === 'trade') {
                if (res.result.action == 'insert') {
                    this.throttleHandleControl(res.result.data)
                }else if(res.result.action === 'refresh'){
                    this.newTrade(res.result)
                }
            }
        }))
    }

    /**
     *  ws-节流控制
     *  @param data ws最新交易数据
     */
    throttleHandleControl(data?){
        if(data){
            this.handleControlCenter.push(data);
        }
        if(this.handleControlCenter.length > 0 && this.handleControlFlag){
            this.handleControlFlag = false;
            this.throttleHandleWsDepth(this.handleControlCenter[0])
        }
    }

    /**
     * 节流处理ws推送数据
     * @param newOrder 最新交易数据
     */
    throttleHandleWsDepth(newOrder){
        for (let val of this.newTradList) {
            val.isnew = false;
        }

        for (let item of newOrder) {
            item.isnew = true;
        }

        this.newTradList = [...newOrder, ...this.newTradList];

        if (this.newTradList.length && this.newTradList.length > 100) {
            this.newTradList = this.newTradList.slice(0, 100);
        }

        this.handleControlCenter.shift();
        this.handleControlFlag = true;
        this.throttleHandleControl();
    }

    init() {
        this.loadTrade = true;
    }

    /**
     * 最新交易
     */
    newTrade(data:any) {
        this.loadTrade = false;
        this.newTradList = data.data;

        if (this.newTradList.length && this.newTradList.length > 100) this.newTradList.slice(0, 100);
    }
}
