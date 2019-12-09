import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { service } from '../../../common/util/service'
import { User } from '../../../common/util/user'
import { resetData } from '../../../common/util/resetData'
import { Loadings } from '../../loadings/loadings'
import { TranslateService } from "@ngx-translate/core";

import { ScokeIoService } from '../../../service/scoke-io.service';
import { SkinServiceService } from '../../../service/skin-service.service';
import { DialogController } from '../../../controller/dialog';
import { regular } from '../../../common/util/regular';
import { AuxBtService } from '../../../service/aux-bt.service'
import { ConterAlertComponent } from '../../../components/alert/conter-alert/conter-alert.component'
import {Subscription} from 'rxjs';
@Component({
    selector: 'app-foot',
    templateUrl: './foot.component.html',
    styleUrls: ['./foot.component.scss']
})
export class FootComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();

    // 皮肤
    theme: string;

    forward: any;
    symbol: any;
    // 当前币对精度
    precision: any = {
        amountPrecision: 4,
        basePrecision: 4,
        pricePrecision: 4,
        minSize: 1
    };
    muneIndex: number = 0;
    orderList: Array<any> = [];
    loadTrade: boolean = true;

    detailKey: any = null;
    orderId: String = '';
    detailDetailList: Array<any> = [];

    //ws-节流队列
    handleControlCenter: Array<any> = [];
    //ws-节流队列falg
    handleControlFlag: boolean = true;

    constructor(
        private service: service,
        private activatedRouter: ActivatedRoute,
        private skin: SkinServiceService,
        private load: Loadings,
        public user: User,
        public resetData: resetData,
        private scoket: ScokeIoService,
        public translate: TranslateService,
        public dialog: DialogController,
        public regular: regular,
        public router: Router,
        public auxBt: AuxBtService
    ) {
        this.theme = window.document.documentElement.getAttribute('data-theme-style');

        this.activatedRouter.params.subscribe(params => {
            this.symbol = this.activatedRouter.snapshot.params['symbol'] || 'BTC_USDT';
            this.forward = `/user/login?forward=/trade/${this.symbol}`;
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
        this.subSkinServe()
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅ws服务
     */
    subWsServe(): void{
        this.subServe.add(this.scoket.getSubObservable().subscribe(res => {
            if (res.type === 'order' && res.result.action === 'update' && this.muneIndex == 0) {
                this.throttleHandleControl(res.result.data)
            }
        }))
    }

    /**
     * 订阅skin服务
     */
    subSkinServe(): void {
        this.subServe.add(this.skin.getObservable().subscribe(res => {
            this.theme = res
        }))
    }

    /**
     *  ws深度-节流控制
     *  @param data ws深度数据
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
     * 节流处理ws推送的深度数据
     * @param data 深度数据
     */
    throttleHandleWsDepth(orderData){
        for(let item of orderData){
            const findex = this.orderList.findIndex((ele) => {
                return ele.order_id === item.order_id;
            });
            if(findex != -1){
                if(item.status == 3 || item.status == 4 || item.status == 6){
                    this.orderList.splice(findex,1);
                }else{
                    this.orderList[findex].filled_amount = item.filled_amount;
                    this.orderList[findex].amount = item.amount;
                    this.orderList[findex].price = item.price;
                    this.orderList[findex].status = item.status;
                }
            }else if(item.status != 3 && item.status != 4 && item.status != 6){
                this.orderList.unshift(item);
            }
        }

        if(this.detailKey != null){
            const finDex = this.orderList.findIndex((ele) => {
                return ele.order_id === this.orderId;
            });

            if(finDex != -1 && (this.orderList[finDex].status == 2 || this.orderList[finDex].status == 3)){
                this.detailKey = finDex;
            }else this.detailKey = null;
        }

        this.handleControlCenter.shift();
        this.handleControlFlag = true;
        this.throttleHandleControl();
    }

    init() {
        if(this.user.token()){
            this.loadTrade = true;
            this.getOrderList();
        }
    }

    /**
     * 切换委托单/历史订单方法
     * @param number
     */
    change(number) {
        this.detailKey = null;
        this.orderList = [];
        if (this.user.token()) this.loadTrade = true;
        this.muneIndex = number;
        this.user.token() && this.getOrderList()
    }

    /**
     * 获取委托单列表
     * @param page
     */
    getOrderList(page: any = 1) {
        let sList = this.muneIndex == 0 ? '0, 1, 2, 5' : '3, 4, 6';
        let params = {
            "begin": '',
            "end": '',
            "side": '',
            "page_num": page,
            "page_size": 20,
            "status": sList,
            "pair": this.symbol,
        };

        const success = data => {
            this.loadTrade = false;
            if(data.status === 0){
                this.orderList = data.data.list;
            }else this.load.tipErrorShow(data.msg)
        };
        this.service.list(params).then(res => success(res))
    }

    cancel(orderId) {
		const config = {
			tip: this.translate.instant('tradeFoot.cancelOrder'),
			ok: this.translate.instant('common.send'),
			callbackSure: ()=>{
				this.cancelOrder(orderId)
			},
			callbackCancel: ()=>{ },
		  };

		if(this.auxBt.isExpirTime()) this.cancelOrder(orderId);
        else this.dialog.createFromComponent(ConterAlertComponent,config)
	}

    /**
     * 撤单
     * @param ids
     */
    cancelOrder(ids) {
        let params = {
            ids: ids,
            sig: ''
        };
        const success = data => {
            if (data.status === 0) {
                this.dialog.destroy();
                this.load.tipSuccessShow(this.translate.instant('common.cancleSuccess'));
                this.init();
            } else {
                this.load.tipErrorShow(data.msg);
            }
        };

        const unLockAccount = data => {
            params.sig = this.auxBt.cancelOrderSign(params, data);
            params.sig && this.service.cancel(params).then(res => success(res))
        };

        this.auxBt.regularPwd(unLockAccount)
    }

    /**
     * 订单详情
     * @param orderId
     * @param index
     */
    orderDetial(orderId, index) {
        if(this.detailKey === index) return this.detailKey = null;

        this.orderId = orderId;
        let data = {
            order_id: orderId,
        };
        this.service.tradeList(data).then((res: any) => {
            if (res.status == 0) {
                this.detailDetailList = res.data.result;
                this.detailKey = index;
            }
        })
    }

    link() {
        if(this.user.token()) this.router.navigateByUrl('/order')
        else this.unLogin()
    }

	unLogin() {
		const config = {
			tip: this.translate.instant('common.unLogin'),
			tipKey: this.translate.instant('common.unLoginTip'),
			ok: this.translate.instant('Header.login'),
			callbackSure: () => {
				this.router.navigateByUrl(`/user/login?forward=/trade/${this.symbol}`)
			},
			callbackCancel: () => { },
		}
		this.dialog.createFromComponent(ConterAlertComponent, config)
	}

    /**
     * 交易对切割
     * @param pair
     * @param index
     */
    pairSplit(pair,index){
        return pair.split('_')[index]
    }

    /**
     * test
     * @param val
     */
    alert(val){
        this.load.txid(val)
    }
}
