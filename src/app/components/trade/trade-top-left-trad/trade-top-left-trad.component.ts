import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FilterNumberPipe } from '../../../pipes/fiter-number.pipe'
import BigNumber from "bignumber.js";
import { service } from '../../../common/util/service'
import { regular } from '../../../common/util/regular'
import { User } from '../../../common/util/user'
import { resetData } from '../../../common/util/resetData'
import { Loadings } from '../../loadings/loadings'
import { ScokeIoService } from '../../../service/scoke-io.service'
import { AuxBtService } from '../../../service/aux-bt.service'
import { DialogController } from '../../../controller/dialog'
import { ConterAlertComponent } from '../../../components/alert/conter-alert/conter-alert.component'
import { DialogPwdComponent } from '../../../components/dialog-pwd/dialog-pwd.component'
import { TranslateService } from '@ngx-translate/core'
import { CONFIG } from '../../../common/util/config'
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-trade-top-left-trad',
	templateUrl: './trade-top-left-trad.component.html',
	styleUrls: ['./trade-top-left-trad.component.scss']
})
export class TradeTopLeftTradComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();

    /**
     * 界面模式  traditional ： 传统模式      tile ： 平铺模式
     */
    @Input() modeSel: string = 'traditional';

    side = 'buy';

    /**
     * 当前币对 信息
     */
	symbol: string;
    defaultPair: string;
    precision: any = {
		amountPrecision: 4,
		basePrecision: 4,
		pricePrecision: 4,
		minSize: 1
	};

    /**
     * Buy Message
     */
	buyPrice: any;
	buyNum: any;
	buyOdexFee: number;
	buyTipFlag: boolean = false;

    /**
     * Sell Message
     */
	sellPrice: any;
	sellNum: any;
	sellOdexFee: number;
	sellTipFlag: boolean = false;

    /**
     * Asset Balance
     */
	baseBalance: any;
    quoteBalance: any;

	constructor(
		private activatedRouter: ActivatedRoute,
        private router: Router,
        private service: service,
		public regular: regular,
        private load: Loadings,
        public scoket: ScokeIoService,
        public user: User,
        public reset: resetData,
        public auxBt: AuxBtService,
		public translate: TranslateService,
        public dialog: DialogController,
	) {
		this.activatedRouter.params.subscribe(params => {
            let UrlParams = this.activatedRouter.snapshot.params['symbol'];
            this.symbol = this.activatedRouter.snapshot.params['symbol'] || 'BTC_USDT';
            this.reset.getPairs().then( (res:any) => {
                for(let i in res){
                    if(!this.defaultPair && res[i].listed){
                        this.defaultPair = res[i].pair;
                    }
                    if(res[i].pair === 'BTC_USDT') this.defaultPair = 'BTC_USDT';
                    if(res[i].pair === UrlParams && res[i].listed){
						this.precision = {
							amountPrecision: res[i].amount_precision,
							basePrecision: res[i].base_precision,
							pricePrecision: res[i].price_precision,
							minSize: this.regular.fanToNum(res[i].min_amount)
                        };
                        return this.init();
                    }else if( Number(i) == res.length -1){
                        this.router.navigateByUrl('trade/' + this.defaultPair);
                    }
                }
			})
        });
    }

    ngOnInit() {
        this.subWsServe();
        this.subWsPriceServe();
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅ws服务
     */
    subWsServe(): void {
        this.subServe.add(this.scoket.getSubObservable().subscribe(res => {
            if (res.type === 'account' && res.result.action === 'update') {
                switch (res.result.data.symbol) {
                    case this.symbol.split("_")[0]: this.quoteBalance = res.result.data.available ; break;
                    case this.symbol.split("_")[1]: this.baseBalance = res.result.data.available ; break;
                }
            }
        }))
    }

    /**
     * 订阅ws价格服务
     */
    subWsPriceServe(): void {
        this.subServe.add(this.scoket.getPriceObservable().subscribe( res => {
            if(res != '---'){
                this.buyPrice = this.regular.toFixed(res,this.precision.pricePrecision);
                this.sellPrice = this.regular.toFixed(res,this.precision.pricePrecision);
            }
        }))
    }

    init(){
        Promise.all([this.resetTrad(),this.user.token() && this.getBalanceToken()]) ;
	}

	alert(config){
        this.dialog.createFromComponent(ConterAlertComponent,config)
    }

    /**
     * 初始化
     */
    resetTrad(){
        this.buyPrice = '', this.buyNum = '' , this.buyTipFlag = false;
        this.sellPrice = '', this.sellNum = '', this.sellTipFlag = false;
    }

    /**
     * 查询余额
     */
    getBalanceToken(){
        let params = {
            symbol: `${this.symbol.split('_')[0]},${this.symbol.split('_')[1]}`,
        };
        const success = data => {
            if(data.status === 0){
                this.baseBalance= data.data[1].available;
                this.quoteBalance= data.data[0].available;
            }else{
                this.load.tipErrorShow(data.msg);
            }
        };
        this.service.getBalance(params).then( res => success(res) )
    }

    /**
     * 设置买卖价格
     * @param price
     */
    setPrice(price){
        if(price != '---'){
            this.buyPrice = this.regular.toFixed(price,this.precision.pricePrecision);
            this.sellPrice = this.regular.toFixed(price,this.precision.pricePrecision);
        }
    }

    /**
     * 输入限制 onkeydown
     * @param event
     */
    onInputKeyDown(event) {
        let inputKey = (event && event.key) || '0';
        if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '。', 'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete'].indexOf(inputKey) === -1) {
            event.preventDefault();
            return;
        }
    }

    /**
     * 输入限制 ngModelChange
     * @param params
     * @param event
     * @param decimalPointNumber
     */
    onModelChange(params, event, decimalPointNumber: number = 8) {
        setTimeout(() => {
            this[params] = new FilterNumberPipe().transform(event, decimalPointNumber);
        }, 0);
    }

    /**
     * 微调整数量
     * @param params
     * @param action  plus/minus
     * @param value
     */
    onNumberChange(params: string, action: string, value: string) {
        if (value) {
            let len: number = 0;
            let v: number = 0;
            if (value.split('.').length > 1) {
                len = value.split('.')[1].length;
                v = new BigNumber(value).shiftedBy(len).toNumber();
            } else {
                v = new BigNumber(value).toNumber();
            }
            action === 'plus' ? v++ : v > 0 ? v-- : '';
            this[params] = new BigNumber(v).shiftedBy(-len).toFixed(len, 1);
        }
    }

    /**
     * 买入 比例计算
     * @param rale
     */
    raleBuy(rale){
        if(Number(this.buyPrice) == 0){
            this.buyNum = 0
        }else{
            let allNumber = this.regular.toDividedBy(this.baseBalance,this.buyPrice,8);
            this.buyNum = this.regular.toBigsells([allNumber,rale],this.precision.amountPrecision)
        }
    }

    /**
     * 卖出 比例计算
     * @param rale
     */
    raleSell(rale){
        if(!this.quoteBalance) this.sellNum = 0
        else this.sellNum = this.regular.toBigsells([this.quoteBalance,rale],this.precision.amountPrecision)
    }

    /**
     * 买入
     */
    buy() {
        if(!this.buyPrice){
            return this.load.tipErrorShow(this.translate.instant('common.noPrice'))
        }else if(this.buyPrice == 0 ){
            return this.load.tipErrorShow(this.translate.instant('common.noTradBuy'))
        }else if(!this.buyNum){
            return this.load.tipErrorShow(this.translate.instant('common.noAmount'))
        }else if(Number(this.buyNum) < Number(this.precision.minSize) ){
            return this.buyTipFlag = true
        }else{
            this.buyTipFlag = false
        }

        let params = {
            side: 'buy',
            salt: new Date().getTime(),
            price: this.buyPrice,
            amount: this.buyNum,
            user: this.user.userId(),
            maker_fee_rate: CONFIG.maker_fee_rate,
            taker_fee_rate: CONFIG.taker_fee_rate,
        };

        this.buyNum = null;
        if(this.regular.comparedTo(this.regular.toBigsells([params.amount,this.buyPrice],8), this.baseBalance) != 1){
            this.trade(params)
        }else{
            const config = {
                tip: this.translate.instant('common.noBlance'),
                ok: this.translate.instant('common.deposit'),
                callbackSure: ()=>{
                    this.router.navigateByUrl('/assets_records')
                },
                callbackCancel: ()=>{ },
            };
            this.alert(config);
        }
    }

    /**
     * 卖出
     */
    sell() {
        if(!this.sellPrice){
            return this.load.tipErrorShow(this.translate.instant('common.noPrice'))
        }else if(this.sellPrice == 0){
            return this.load.tipErrorShow(this.translate.instant('common.noTradSell'))
        }else if(!this.sellNum){
            return this.load.tipErrorShow(this.translate.instant('common.noAmount'))
        }else if(Number(this.sellNum) < Number(this.precision.minSize)){
            return this.sellTipFlag = true
        }else{
            this.sellTipFlag = false
        }
        let params = {
            side: 'sell',
            salt: new Date().getTime().toString(),
            price: this.sellPrice,
            amount: this.sellNum,
            user: this.user.userId(),
            maker_fee_rate: CONFIG.maker_fee_rate,
            taker_fee_rate: CONFIG.taker_fee_rate,
        };

        this.sellNum = null;
        if(this.regular.comparedTo(params.amount,this.quoteBalance) != 1){
            this.trade(params)
        }else{
            const config = {
                tip: this.translate.instant('common.noBlance'),
                ok: this.translate.instant('common.deposit'),
                callbackSure: ()=>{
                    this.router.navigateByUrl('/assets_records')
                },
                callbackCancel: ()=>{ },
            };
            this.alert(config);
        }
    }

    /**
     * 委托下单
     * @param params
     */
    trade(params){
        const success = data => {
            this.load.hide();
            if(data.status === 0){
                this.dialog.destroy();
                this.load.tipSuccessShow(this.translate.instant('common.tradeSuccess'));
            }else{
                this.load.tipErrorShow(data.msg);
            }
        };

        this.reset.getPairs().then( (res:any) => {
            let coins = res.filter((ele) => {
                return ele.pair === this.symbol
            });

            params.chain_id = CONFIG.chain_id;
            params.pair = coins[0].pair_address;
            params.expire = 0;
            params.channel = CONFIG.channel;

            const depoSig = (res) => {
                this.load.loadingShow();
                params.sig = this.auxBt.orderSign(params,res);
                params.sig && ( this.dialog.destroy(), this.service.create(params).then( res => { success(res) }) )
            };

            this.regularPwd(depoSig);
        })

    }

    /**
     * 交易确认密码
     * @param FN
     */
    regularPwd(FN){
        const time = this.auxBt.isExpirTime();
        if(time){
            let option = {
                callback: res => {
                    FN(res);
                }
            };
            this.dialog.createFromComponent(DialogPwdComponent,option);
        }else FN();
    }

    toNumbers(data){
        return Number(data)
    }

    login(){
        this.router.navigateByUrl(`/user/login?forward=/trade/${this.symbol}`)
    }
}
