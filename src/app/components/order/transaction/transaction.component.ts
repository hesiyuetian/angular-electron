import { Component, OnInit } from '@angular/core';
import { service } from '../../../common/util/service';
import { regular } from '../../../common/util/regular';
import { resetData } from '../../../common/util/resetData'
import { TranslateService } from "@ngx-translate/core";
import { FormatPipe } from '../../../pipes/format.pipe'
import { Loadings } from '../../loadings/loadings'
import { AuxBtService } from '../../../service/aux-bt.service'
import { SkinServiceService } from '../../../service/skin-service.service'

@Component({
	selector: 'app-transaction',
	templateUrl: './transaction.component.html',
	styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
	minDate: String = '';
	maxDate: String = '';
	startDate: String = '';
	endDate: String = '';
	side: any = '';
	status: String = '';

	quoteSymbol: String = '';

	loadTrade: boolean = true;
	currentPage: number = 1;
	totalRow: number = 1;

    /**
     * 交易历史详情 dialog
     */
    transFlag: boolean = false;
    transInfo: any = {};

	// 订单列表
	historyList: Array<any> = [ ];
	// 所有交易对列表
	pairsList: Array<any> = [
		{code: 9999, zhName: '全部', enName: 'All' },
	];
	// 所有交易对精度对象
	pairObj: Object = {};

	directionList: Array<any> = [
        { val: 33, zhName: "全部", enName: 'All' },
        { val: 0, zhName: "买", enName: 'Buy' },
		{ val: 1, zhName: "卖", enName: 'Sell' },
	];

	statusList: Array<any> = [
        { val: 33, zhName: "全部", enName: 'All' },
        { val: 1, zhName: "等待上链", enName: 'Wait' },
		{ val: 2, zhName: "上链超时", enName: 'Time Out' },
		{ val: 3, zhName: "待确认", enName: 'Pending' },
		{ val: 4, zhName: "确认成功", enName: 'Success' },
		{ val: 5, zhName: "上链失败", enName: 'Failed' },
	];

	constructor(
		private service: service,
		private skin: SkinServiceService,
		public regular: regular,
		public reset: resetData,
		public translate: TranslateService,
		public load: Loadings,
		public auxBt: AuxBtService,
	) {
		this.skin.getLangObservable().subscribe((res)=>{
			this.regular.setTitle(this.translate.instant('Title.tradHistory'))
        })
	}

	ngOnInit() {
		this.init();
	}
	init(){
		setTimeout(() => {
			this.regular.setTitle(this.translate.instant('Title.tradHistory'))
		});
		this.resetDate();
		this.getPairsList();
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
		this.load.loadingShow();

		let params = {
			"begin": this.startDate,
			"end": this.endDate,
			"page_num": page,
			"page_size": 10,
			"pair": this.quoteSymbol,
			"side": this.side,
			"status": this.status,
		};

		const success = data => {
			this.load.hide();
			this.loadTrade = false;
			if(data.status === 0){
				this.totalRow = data.data.total;
				for(let item of data.data.list){
					item.amountPrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[0] || 4);
					item.priciPrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[1] || 4)
				}
				this.historyList = data.data.list;
			}else this.load.tipErrorShow(data.msg)
		};
		this.service.transactionHistory(params).then(res => success(res))
	}

    /**
     * 获取交易对
     */
	async getPairsList(){
		let data;
		await this.reset.getPairs().then(res => { data = JSON.parse(JSON.stringify(res)) })
		for(let item of data){
			item.pair = item.pair.replace(/_/g, '/');
			this.pairObj[item.pair] = (item.amount_precision || 0) +'_'+ (item.price_precision || 0);
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

	checkedBack(val,type){
		this[type] = val != 33 ? val : '';
		this.search()
	}

	requer(val){
		this.quoteSymbol = val.code != 9999 ? val.code.replace(/\//g, '_') : '';
		this.search()
	}

    openDetail(info){
        this.transInfo = info;
        this.transFlag = true;
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
