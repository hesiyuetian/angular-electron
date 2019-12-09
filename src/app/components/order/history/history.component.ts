import {Component, OnDestroy, OnInit} from '@angular/core';
import { service } from '../../../common/util/service'
import { User } from '../../../common/util/user'
import { regular } from '../../../common/util/regular'
import { resetData } from '../../../common/util/resetData'
import { Loadings } from '../../loadings/loadings'
import { TranslateService } from "@ngx-translate/core";
import { FormatPipe } from '../../../pipes/format.pipe'
import { AuxBtService } from '../../../service/aux-bt.service'
import { SkinServiceService } from '../../../service/skin-service.service'
import {Subscription} from 'rxjs';

@Component({
	selector: 'app-history',
	templateUrl: './history.component.html',
	styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
	minDate: String = '';
	maxDate: String = '';
	startDate: String = '';
	endDate: String = '';

	status: String = '';
	quoteSymbol: String = '';

	loadTrade: boolean = true;
	currentPage: number = 1;
	totalRow: number = 1;

	actIndex: any = null;

	// 订单列表
	historyList: Array<any> = [];
	// 所有交易对列表
	pairsList: Array<any> = [
		{code: 9999, zhName: '全部', enName: 'All' },
	];
	// 所有交易对精度对象
	pairObj: Object = {};
	detailDetailList: Array<any> = [];
	directionList: Array<any> = [
        { val: 33, zhName: "全部", enName: 'All' },
        { val: 0, zhName: "买", enName: 'Buy' },
		{ val: 1, zhName: "卖", enName: 'Sell' },
	];

	constructor(
		public regular: regular,
		private service: service,
		private load: Loadings,
		private skin: SkinServiceService,
		public user: User,
		public reset: resetData,
		public translate: TranslateService,
		public auxBt: AuxBtService,
	) {

	}

	ngOnInit() {
	    this.subLangServe();
		this.init()
	}

	ngOnDestroy(): void {
	    this.subServe.unsubscribe()
    }

    /**
     * 订阅theme服务
     */
    subLangServe(): void{
        this.subServe.add(this.skin.getLangObservable().subscribe((res)=>{
            this.regular.setTitle(this.translate.instant('Title.orderHistory'))
        }))
    }

    init() {
		setTimeout(() => {
			this.regular.setTitle(this.translate.instant('Title.orderHistory'))
		});

		this.resetDate();
		this.getPairsList()
	}

	resetDate(){
		this.minDate = this.regular.fun_month(-3);
		this.maxDate = new FormatPipe().transform(new Date(),4);
		this.startDate = new FormatPipe().transform(this.regular.fun_date(-7),4);
		this.endDate = new FormatPipe().transform(new Date(),4)
	}

    /**
     * 搜索
     */
	search(){
		this.currentPage = 1;
		this.getOrderList();
	}

    /**
     * 获取委托单列表
     * @param page
     */
	getOrderList(page: any = 1) {
		this.actIndex = null;
		this.load.loadingShow();

		let sList = '3,4,6';
		let params = {
			"begin": this.startDate,
			"end": this.endDate,
			"page_num": page,
			"page_size": 10,
			"pair": this.quoteSymbol,
			"side": this.status,
			"status": sList,
		};

		const success = data => {
			this.load.hide();
			this.loadTrade = false;
			if(data.status ===0){
				this.totalRow = data.data.total;
				for(let item of data.data.list){
					item.amountPrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[0] || 4);
					item.priciPrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[1] || 4);
					item.basePrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[2] || 4)
				}
				this.historyList = data.data.list;
			}else this.load.tipErrorShow(data.msg)

		};
		this.service.list(params).then(res => success(res))
	}

    /**
     * 获取交易对
     */
	async getPairsList(){
		let data;
		await this.reset.getPairs().then(res => { data = JSON.parse(JSON.stringify(res)) })
		for(let item of data){
			item.pair = item.pair.replace(/_/g, '/');
			this.pairObj[item.pair] = (item.amount_precision || 0) +'_'+ (item.price_precision || 0)+'_'+(item.price_precision || 0);
			this.pairsList.push({code: item.pair, zhName: item.pair, enName: item.pair })
		}
		this.getOrderList();
	}

	onCurrentPageChange(page) {
		this.currentPage = page;
		this.getOrderList(page)
	}

	startChangeDate(date){
		this.startDate = date;
		this.search()
	}
	endChangeDate(date){
		this.endDate = date;
		this.search()
	}
	checkedBack(val){
		this.status = val != 33 ? val : '';
		this.search()
	}
	requer(val){
		this.quoteSymbol = val.code != 9999 ? val.code.replace(/\//g, '_') : '';
		this.search()
	}

    /**
     * 订单详情
     * @param index
     * @param orderId
     */
	detail(index, orderId) {
		if(this.actIndex === index) return this.actIndex = null;
		let data = {
			order_id: orderId,
		};
		this.service.tradeList(data).then((res: any) => {
			if (res.status == 0) {
				this.detailDetailList = res.data.result;
				this.actIndex = index;
			}
		})
	}

    /**
     * 交易对切割
     * @param pair
     * @param index
     */
    pairSplit(pair,index){
        return pair.split('_')[index]
    }

}
