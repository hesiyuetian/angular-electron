import {Component, OnInit, Renderer2, Input, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import BigNumber from 'bignumber.js';
import { service } from '../../../common/util/service'
import { ScokeIoService } from '../../../service/scoke-io.service'
import { SkinServiceService } from '../../../service/skin-service.service'
import { regular } from '../../../common/util/regular'
import { User } from '../../../common/util/user';
import { TranslateService } from '@ngx-translate/core'
import { TrickerService } from '../../../service/tricker.service';
import { DialogController } from '../../../controller/dialog'
import { ConterAlertComponent } from '../../../components/alert/conter-alert/conter-alert.component'
import { Loadings } from '../../../components/loadings/loadings';
import { resetData } from '../../../common/util/resetData'
import {Subscription} from 'rxjs';
import { DialogPwdComponent } from '../../../components/dialog-pwd/dialog-pwd.component'
import {AuxBtService} from '../../../service/aux-bt.service';
@Component({
	selector: 'app-trade-symbol',
	templateUrl: './trade-symbol.component.html',
	styleUrls: ['./trade-symbol.component.scss']
})
export class TradeSymbolComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
	// 当前的币种
    symbol: string = '';

	collectPairList: any;
	//交易对全部列表
	tickerList: any;
	//默认选中基础货币
	active: any;
	//基础货币列表
	symbolList: any;
	//交易对列表
	marketShowList: any = [];
	marketList: any;
	tickerListObj: object = {};


	//收藏交易对
	kind: string = '';

	// 排序list下标
	step: string;
	// 目标排序方向
	type: boolean;

	//搜索
	tokenName: string;
	//交易对loading状态
	tickerLoadStatus: boolean = true;
	// 修改交易对信息，控制不发送交易对精度，只有在初始化时才发送精度
	initStatus: boolean = true;
	//防止频繁点击收藏
	isFavStatus: boolean = true;

	// 所有交易对精度对象
	pairObj: Object = {};
	constructor(
		private renderer: Renderer2,
		private router: Router,
		private activatedRouter: ActivatedRoute,
		private skin: SkinServiceService,
		public scoket: ScokeIoService,
		private service: service,
		private user: User,
		public regular: regular,
		public translate: TranslateService,
		private trickerService: TrickerService,
		public dialog: DialogController,
		private load: Loadings,
		private reset: resetData,
        public auxBt: AuxBtService,
	) {
		this.activatedRouter.params.subscribe(params => {
            this.symbol = this.activatedRouter.snapshot.params['symbol'] || 'BTC_USDT';
			this.active = this.symbol.split('_')[1];
			this.init();
		});
	}

    ngOnInit() {
        this.subWsServe();
        this.subTrickerServe();
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅ws服务
     */
    subWsServe(): void {
        this.subServe.add(this.scoket.getSubObservable().subscribe(res => {
            if (res.type === 'ticker' && !!res.result.data.pair) {
                this.setWSPrice(res.result.data)
            }
        }))
    }

    /**
     * 订阅tricker服务
     */
    subTrickerServe(): void {
        this.subServe.add(this.trickerService.getObservable().subscribe((res)=>{
            if(res){
                this.collectPairList = res.data;
                this.analysisTicker();
            }
        }))
    }

    init(){
		this.user.token() && this.getCollectPair();
        !this.user.token() && this.getPairsList();
	}

    /**
     * ws推送价格
     * @param data
     */
	setWSPrice(data) {
		if (!this.tickerList || this.tickerList.length == 0) {
			return
		}
        this.tickerListObj[data.pair] = {
            close: data.close,
            change: data.change,
        };
        this.reset.caleUSDT(this.tickerListObj);
		this.subTickList(this.tickerList);
	}

    /**
     * 排序
     * @param type
     */
	tickerSort(type) {
		this.step = type;
		this.type = this.kind != type ? false : true;
		this.sort(type, this.type);
		this.kind = !this.type ? type : '';
	}

	sort(type, direction) {
		if (!this.marketShowList) return;
		this.marketShowList.sort((pre, next) => {
			let result: boolean;
			if (type == 'pair') {
				result = pre[type] > next[type];
			} else {
				result = new BigNumber(pre[type]).isGreaterThan(new BigNumber(next[type])) ||
						(new BigNumber(pre[type]).isEqualTo(new BigNumber(next[type])) &&
						pre['tokenName'] > next['tokenName']);
			}
			if (result) {
				return direction ? 1 : -1;
			} else {
				return direction ? -1 : 1;
			}
		})
	}

    /**
     * 发布行情数据
     * @param data
     */
	subTickList(data){
		this.trickerService.setTickList(data);
	}

    /**
     * 获取交易对
     */
	async getPairsList(){
		let data;
		await this.reset.getPairs().then(res => { data = JSON.parse(JSON.stringify(res)) });
		for(let item of data){
			this.pairObj[item.pair] = (item.amount_precision || 0) +'_'+ (item.price_precision || 0);
		}
		this.getTickersList();
	}

    /**
     * 获取交易对 - new
     */
	getTickersList() {
		let data = {};
		this.service.getPairsList(data).then((res: any) => {
			if (res.status == 0) {
				for(let item of res.data){
					item['amountPrecision'] = Number(this.pairObj[`${item.pair}`].split("_")[0] || 4);
					item['priciPrecision'] = Number(this.pairObj[`${item.pair}`].split("_")[1] || 4);
                    this.tickerListObj[item.pair] = {
                        close: item.close,
                        change: item.change,
                    }
				}
                this.reset.caleUSDT(this.tickerListObj);
				this.subTickList(res.data);
				this.tickerLoadStatus = false;
				this.tickerList = res.data;
				this.getSymbolList(res.data);
				this.analysisTicker();
			}
		})
	}

    /**
     * 解析获取基础货币列表
     * @param data
     */
	getSymbolList(data){
		this.symbolList = [];
		let quoteList = [];
		for(let item of data){
			quoteList.push(item.pair.split('_')[1]);
		}
		this.symbolList = quoteList.filter((ele,index,self)=>{
			return self.indexOf(ele) === index;
		})
	}

    /**
     * 解析处理展示的交易对
     */
	analysisTicker() {
		this.marketList = [], this.marketShowList = [];
		if (this.tickerList && this.tickerList.length > 0) {
			this.active = this.active ? this.active : this.tickerList[0].symbol;
			for (let i of this.tickerList) {

				if(this.user.token() && this.collectPairList && this.collectPairList.length > 0){
					let Index = this.collectPairList.findIndex(ele => {
						return ele === i.pair
					});
					i.collected = Index == -1 ? 1 : 0;
				}else i.collected = 1;

				if(this.active === 'optional' && i.collected === 0){
					this.marketList.push(i);
					if (this.tokenName) {
						this.onTokenNameChange();
					} else {
						this.marketShowList = this.marketList;
					}
				}else if (this.active == i.pair.split('_')[1]) {
					this.marketList.push(i);
					if (this.tokenName) {
						this.onTokenNameChange();
					} else {
						this.marketShowList = this.marketList;
					}
				}
			}

		}
	}

    /**
     * 切换自选与BaseToken
     * @param val
     */
	activated(val) {
		this.step = '';
		this.active = val;
		this.analysisTicker();
	}

    /**
     * 获取收藏列表
     */
	getCollectPair() {
		let data = {};
		this.service.getCollectPair(data).then((res: any) => {
			if (res.status == 0) {
				this.collectPairList = res.data;
				this.subCollectList(res.data);
				this.getPairsList();
			}
		})
	}

    /**
     * 选中自选
     * @param i
     * @param active
     */
	check(i, active) {
		if (this.user.token()) {
		    this.checkTicker(i.pair, active)
		} else {
			this.unLogin();
		}
	}

	alert(config) {
		this.dialog.createFromComponent(ConterAlertComponent, config)
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
		};
		this.alert(config);
	}

    /**
     * 收藏选中的交易对
     * @param ticker
     * @param active
     */
	checkTicker(ticker, active) {
		if(this.isFavStatus){
			this.isFavStatus = false;
			let data = {
				pair: ticker,
				collect: active,
                sig: ''
			};

			const success = (res:any) => {
                this.isFavStatus = true;
                if(res.status === 0){
                    this.dialog.destroy();
                    this.collectPairList = res.data;
                    this.subCollectList(res.data);
                    this.analysisTicker();
                }else{
                    this.load.tipErrorShow(res.msg)
                }
            };

			const unLockAccount = (res:any) => {
                data.sig = this.auxBt.collectSign(data,res);
                data.sig && this.service.collectPair(data).then( res => { success(res) })
            };

			const close = res => {
                this.isFavStatus = true;
            };

			this.auxBt.regularPwd(unLockAccount, close)
		}
	}

    /**
     * 广播收藏的交易对list
     * @param data
     */
	subCollectList(data) {
        let json = {
            type: 'set',
            data: data,
        };
		this.trickerService.set(json);
    }

    /**
     * 点击交易对时
     * @param info
     * @param symbol
     */
	onSymbolClick(info:any, symbol: string) {
		this.active = symbol.split('_')[1];
		this.router.navigateByUrl('trade/' + symbol);
		this.user.setItem('defaultSymbol', symbol);
	}

    /**
     * 搜索交易对
     */
	onTokenNameChange() {
		this.marketShowList = this.marketList.filter(data => {
			return data.pair.toLocaleLowerCase().indexOf(this.tokenName.toLocaleLowerCase().replace("/","_")) !== -1;
		})
	}
}
