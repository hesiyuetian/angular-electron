import { Component, OnInit, ElementRef, Input, OnDestroy } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { service } from '../../../common/util/service'
import { regular } from '../../../common/util/regular'
import { User } from '../../../common/util/user'
import { resetData } from '../../../common/util/resetData'
import { Loadings } from '../../loadings/loadings'
import { ScokeIoService } from '../../../service/scoke-io.service'
import { DialogController } from '../../../controller/dialog';
import {Subscription} from 'rxjs';
// const environment = require('../../../common/util/environment.json');
import { CONFIG } from '../../../common/util/config'

declare var $;
@Component({
	selector: 'app-trade-top-right',
	templateUrl: './trade-top-right.component.html',
	styleUrls: ['./trade-top-right.component.scss']
})
export class TradeTopRightComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();

    /**
     * 界面模式  traditional ： 传统模式      tile ： 平铺模式
     */
    @Input() modeSel: string = 'traditional';

    /**
     *  Current Pair Info
     */
	symbol: string;
	icon: string;
    precision: any = {
        amountPrecision: 4,
        basePrecision: 4,
        pricePrecision: 4,
        minSize: 1
    };

    /**
     * change New trade
     */
	isNewTrade: boolean = false;

	// 深度合并展示类型 弹框
	depthType: String = 'all';
	sleDepthTypeFlag: boolean = false;

	// 买卖 详情
	tradType: string = 'all';
	maxBuyNum: any = 0;
	maxSellNum: any = 0;
	// 深度合并刷选弹框
	sleDepthFlag: boolean = false;
	// 深度合并可选数列
	sleDepthList: Array<any> = [
		{ key: 4, val: '0.0001' },
		{ key: 3, val: '0.001' },
		{ key: 2, val: '0.01' },
		{ key: 1, val: '0.1' }
	];
	// 深度合并选中的值
	depthVal: any = '0.0001';
	//深度数据
	buyTickerListData: any = [];
	sellTickerListData: any = [];
	// 深度列表
	deptList = {
		buy: [
			// {price: 0.2121,amount: 1212,Accumulatives: 11},
		],
		sell: []
	};
	copyDeptList = {
		buy: [
			// {price: 0.2121,amount: 1212,Accumulatives: 11},
		],
		sell: []
	};
	// 深度合并 精度(小数位)
	depthPrecision: any = 8;
	// 深度列表是否加载完成
	loadDepth: boolean = true;

	// 交叉深度
	sellCopyData: any = {};
	buyCopyData: any = {};

	// 节流开关
	throttleSwitch: boolean = true;
	// 最新价格
	tickerList: any;
	//深度滚动条延时器
	depthSetTimeOut: any;
	//ws-节流队列
    handleControlCenter: Array<any> = [];
    //ws-节流队列falg
    handleControlFlag: boolean = true;

	constructor(
		private activatedRouter: ActivatedRoute,
		private service: service,
		private load: Loadings,
		public regular: regular,
		public scoket: ScokeIoService,
		public user: User,
		public dialog: DialogController,
		public resetData: resetData,
		private el: ElementRef,
	) {
		this.activatedRouter.params.subscribe(params => {
			this.symbol = this.activatedRouter.snapshot.params['symbol'] || 'BTC_USDT';
			this.icon = this.symbol.replace(/_/g, '/');
            this.loadDepth = true;
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

				this.depthPrecision = this.precision.pricePrecision;
				this.calcDepth(this.precision.pricePrecision);
				this.changeDepth(this.precision.pricePrecision);

				this.init();
			})
		});
	}

	ngOnInit() {
       this.subWsServe()
	}

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅ws服务
     */
	subWsServe(): void {
        this.subServe.add(this.scoket.getSubObservable().subscribe(res => {
            if (res.type === 'depth') {
                this.loadDepth = false;
                if (res.result.action == 'update') {
                    this.throttleHandleControl(res.result.data);
                }else if(res.result.action == 'refresh'){
                    this.depthData(res.result)
                }

            } else if (res.type === 'ticker') {
                if (res.result.action == 'update') {
                    if (res.result.data.pair === this.symbol) {
                        this.tickerList = res.result.data;
                        this.setTitle(this.tickerList.close);
                        this.scoket.setTick(this.tickerList);
                    }
                }
            }
        }))
    }

    init() {
		Promise.all([this.getTickerList()]);
	}

    /**
     * 初始化
     */
    resetTrad(){
		this.sellCopyData = {}, this.buyCopyData = {};
		this.copyDeptList = {
			buy: [],
			sell: []
		};
		this.deptList = {
			buy: [],
			sell: []
		};
	}

	flexDeptFt(curry, all) {
		return `${(curry / all) * 100}%`
	}

    /**
     * 深度合并刷选
     * @param type
     */
	sleDepth(type?) {
		if(type === 'depthType'){
			this.sleDepthTypeFlag = !this.sleDepthTypeFlag;
		}else{
			this.sleDepthFlag = !this.sleDepthFlag;
		}
	}

    /**
     * 深度合并展示类型 选择
     * @param key
     * @param val
     */
	async changeTradType(key,val?){
		this.tradType = key;
        if(key === 'sell'){
            this.scrollBuyBottom()
        }else if(key === 'all'){
            setTimeout(()=>{this.showDepth()},10)
        }
	}

    /**
     * 展示深度视图数据
     */
    showDepth(){
        try{
            $('.sell-buy-center-con-buy .sell-buy-center-head:first')[0].scrollIntoView({
                behavior: 'auto',
                block: 'start',
                inline: 'start',
            });
        }catch(e){
            // console.log(e)
        }
    }

    /**
     * 计算深度合并列表
     * @param num
     */
	calcDepth(num) {
		num = Number(num);
		this.depthVal = this.regular.exponentiatedBy(10,-num);

		this.sleDepthList.length = 0;
		for (let i = num; i >= -2; i--) {
			this.sleDepthList.length < 3 && this.sleDepthList.push({key: i, val: this.regular.exponentiatedBy(10,-i)});
			// this.sleDepthList.push({ key: i, val: `${i}位小数` });
		}
	}

    /**
     * 深度合并list选择
     * @param key
     * @param val
     */
	changeDepth(key, val?) {
		if(this.el.nativeElement.querySelector('#depth-sel')) this.el.nativeElement.querySelector('#depth-sel').blur();
		if (val) {
			this.depthVal = val;
			// this.sleDepthFlag = false;
		}
		this.depthPrecision = key;
		let ary: any = JSON.parse(JSON.stringify(this.copyDeptList));
		this.deptList = {
			buy: this.depthD(this.depthMerge(ary.buy, key, 0), 0),
			sell: this.depthD(this.depthMerge(ary.sell, key, 1), 1)
		}
	}

    /**
     * 查询深度全量
     * @param data
     */
	depthData(data:any) {
            this.resetTrad();

            this.buyTickerListData = data.data.buys;
            this.sellTickerListData = data.data.sells;

            let buy = [].concat(JSON.parse(JSON.stringify(this.buyTickerListData)));
            let sell = [].concat(JSON.parse(JSON.stringify(this.sellTickerListData)));

            this.copyDeptList = {
                buy: this.depthD(buy, 0),
                sell: this.depthD(sell, 1)
            };

            for (let item of this.copyDeptList.buy) {
                this.buyCopyData[item.price] = `${item.v}-${item.amount}`;
            }

            for (let item of this.copyDeptList.sell) {
                this.sellCopyData[item.price] = `${item.v}-${item.amount}`;
            }

            this.deptList = {
                buy: this.depthMerge(this.copyDeptList.buy.reverse(), this.precision.pricePrecision, 0),
                sell: this.depthMerge(this.copyDeptList.sell, this.precision.pricePrecision, 1)
            };

            this.scoket.setDepth(this.deptList);
            setTimeout(()=>{ this.showDepth() },10)
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
    throttleHandleWsDepth(depthData){
        let _buy = depthData.buys, _sell = depthData.sells;
        this.resetDepth();

        // 卖    大
        for (let item of _sell) {
            // if(!this.sellCopyData[this.regular.toFixed(item.price,8)] || this.sellCopyData[this.regular.toFixed(item.price,8)] < item.v ){
            if (!this.sellCopyData[this.regular.toFixed(item.price, 8)] || (this.sellCopyData[this.regular.toFixed(item.price, 8)]).split('-')[0] < item.v) {

                // this.sellCopyData[this.regular.toFixed(item.price,8)] = item.v
                this.sellCopyData[this.regular.toFixed(item.price, 8)] = `${item.v}-${item.amount}`;

                // 处理交叉数据
                const findBuy = this.buyTickerListData.filter((ele) => {
                    return Number(ele.price) >= Number(item.price)
                });
                for (let val of findBuy) {
                    let index = this.buyTickerListData.findIndex((ele) => {
                        return Number(ele.price) == Number(val.price)
                    });
                    this.buyTickerListData[index].amount = 0;
                }

                this.sellTickerListData = this.setSdddepth(this.sellTickerListData, item);

            }
        }

        // 买    小
        for (let item of _buy) {
            // if(!this.buyCopyData[this.regular.toFixed(item.price,8)] || this.buyCopyData[this.regular.toFixed(item.price,8)] < item.v ){
            if (!this.buyCopyData[this.regular.toFixed(item.price, 8)] || (this.buyCopyData[this.regular.toFixed(item.price, 8)]).split('-')[0] < item.v) {

                // this.buyCopyData[this.regular.toFixed(item.price,8)] = item.v;

                this.buyCopyData[this.regular.toFixed(item.price, 8)] = `${item.v}-${item.amount}`;

                // 处理交叉数据
                if(item.amount > 0){
                    const findSell = this.sellTickerListData.filter((ele) => {
                        return Number(ele.price) < Number(item.price)
                    });
                    for (let val of findSell) {
                        let index = this.sellTickerListData.findIndex((ele) => {
                            return Number(ele.price) == Number(val.price)
                        });
                        this.sellTickerListData[index].amount = 0;
                    }
                }

                this.buyTickerListData = this.setSdddepth(this.buyTickerListData, item);
            }
        }

        if(_sell.length > 0){
            this.copyDeptList.sell = this.sellTickerListData = this.sellTickerListData.filter((ele) => {
                return Number(this.regular.toFixed(ele.amount, this.precision.amountPrecision)) != 0 && !!ele.price
            });

            this.deptList.sell = this.depthD(this.depthMerge(this.copyDeptList.sell, this.depthPrecision, 1).sort((pre, next) => {
                return Number(next.price) - Number(pre.price)
            }),1);
        }

        if(_buy.length > 0){
            this.copyDeptList.buy = this.buyTickerListData = this.buyTickerListData.filter((ele) => {
                return Number(this.regular.toFixed(ele.amount, this.precision.amountPrecision)) != 0 && !!ele.price
            });
            this.deptList.buy = this.depthD(this.depthMerge(this.copyDeptList.buy, this.depthPrecision, 0).sort((pre, next) => {
                return Number(next.price) - Number(pre.price)
            }),0);
        }

        this.handleControlCenter.shift();
        this.handleControlFlag = true;
        this.throttleHandleControl();

        this.throttled(1000, () => {
            this.scoket.setDepth(this.deptList)
        })
    }

    /**
     * 深度 - 滚动条初始化在底部
     */
	scrollBuyBottom() {
		clearTimeout(this.depthSetTimeOut);
		this.depthSetTimeOut = setTimeout(() => {
			document.getElementsByClassName('sell-buy-center-con-sell')[0] && (document.getElementsByClassName('sell-buy-center-con-sell')[0].scrollTop = 999);
		}, 100)
	}

    /**
     * 深度数据-计算累计
     * @param dataList
     * @param type
     */
	depthD(dataList, type) {
		let data = dataList;
		let numb:any = 0;
		if (type == 0) {
			for (let i of data) {
				numb = this.regular.toPlus(numb,i.amount || 0);
				i.Accumulatives = numb;
			}
		} else if (type == 1) {
			for (let i = data.length - 1; i >= 0; i--) {
				numb = this.regular.toPlus(numb,data[i].amount || 0);
				data[i].Accumulatives = numb;
			}
		}
		return data;
	}

    /**
     * ws添加深度数据
     * @param list
     * @param data
     */
	setSdddepth(list, data) {
		let nData = [].concat(JSON.parse(JSON.stringify(list)));
		let type = true;
		let actIndex = null;
		for (let i in nData) {
			if (Number(nData[i].price) == Number(data.price)) {

				// isNew 1: 数量增加   2: 数量减少  3： 初始化
				nData[i].isNew = data.amount > nData[i].amount ? 1 : 2;
				nData[i].amount = data.amount;

				if (this.regular.comparedTo(data.amount, '0') == 0 || Number(this.regular.toFixed(data.amount, this.precision.amountPrecision)) == 0) {
					actIndex = i;
				}
				type = false;
			}
		}

		if (!!actIndex) {
			nData.splice(Number(actIndex), 1);
		}

		if (type) {
			data.isNew = 1;
			nData.push(data)
		}

		// nData.filter(ele => {
		// 	return !isNaN(ele.price) && !!ele.price
		// })

		return nData;
	}

	isNAN(val){
		return !isNaN(val)
	}

    /**
     * 深度合并
     * @param data
     * @param level
     * @param type
     */
	depthMerge(data, level, type) {
		let newArray: Array<any> = [];
		let amountAry = [];
		data = JSON.parse(JSON.stringify(data));
		for (let i of data) {
			if(level >= 0) i.price = this.regular.toFixed(this.regular.fanToNum(i.price), level);
			else i.price = `${this.regular.toFixed(this.regular.fanToNum(i.price) / 10 ** -level,0)}${level == -1 ? '0' : level == -2 ? '00' : '000'}`;

			const findIndex = newArray.findIndex((value) => {
				return value.price == i.price;
			});

			if (findIndex !== -1) {
				const mergeData = newArray[findIndex];
				i.amount = this.regular.toPlus(i.amount,mergeData.amount || 0);
				newArray.splice(findIndex, 1);
			} else {
				i.amount = i.amount
			}

			amountAry.push(i.amount);
			newArray.push(i);
		}

		if (type === 0) {
			this.maxBuyNum = Math.max(...amountAry);
		} else {
			this.maxSellNum = Math.max(...amountAry);
		}

		newArray.filter(ele => {
			return !isNaN(ele.price) && !!ele.price
		});
		return newArray
	}

    /**
     * 深度初始化动画
     */
	resetDepth() {
		for (let item of this.buyTickerListData) {
			item.isNew = 3
		}
		for (let item of this.sellTickerListData) {
			item.isNew = 3
		}
	}

    /**
     * 查询交易对列表  当前比对详情
     */
	getTickerList() {
		const success = (data: any) => {
			if (data.status === 0) {
				const Index = data.data.findIndex(ele => {
					return ele.pair === this.symbol
				});
				this.tickerList = data.data[Index];
                this.setTitle((this.tickerList && this.tickerList.close) ? this.tickerList.close : 0);
				this.scoket.setTick(this.tickerList);
				this.setPrice(this.tickerList.close || 0);
			} else {
				this.load.tipErrorShow(data.msg);
			}
		};
		this.service.getPairsList({ pair: this.symbol }).then(res => success(res))
	}

    /**
     * throttled
     * @param delay
     * @param FN
     */
	throttled(delay: number, FN: Function) {
		if (!this.throttleSwitch) return ;
		this.throttleSwitch = false;
		setTimeout(_ => {
			FN();
			this.throttleSwitch = true;
		}, delay)
	}

    /**
     * setTitle
     * @param price
     */
    setTitle(price){
        price = this.regular.toFixed(this.tickerList.close || 0, this.precision.pricePrecision);
        document.title = `${price} ${this.icon} | ${CONFIG.name}`
	}

	setPrice(price){
		this.scoket.setPrice(price)
	}

}
