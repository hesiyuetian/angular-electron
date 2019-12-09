import { Component, OnInit } from '@angular/core';
import { service } from '../../../common/util/service';
import { resetData } from '../../../common/util/resetData';
import { regular } from '../../../common/util/regular';
import { TranslateService } from '@ngx-translate/core';
import { FormatPipe } from '../../../pipes/format.pipe'
import { Loadings } from '../../loadings/loadings'
import { SkinServiceService } from '../../../service/skin-service.service'

@Component({
	selector: 'app-hostory-list',
	templateUrl: './hostory-list.component.html',
	styleUrls: ['./hostory-list.component.scss']
})
export class HostoryListComponent implements OnInit {
	minDate: String = '';
	maxDate: String = '';
	startDate: String = '';
	endDate: String = '';
	//1-充值 ， 2-提币， 3-币币
	direction: string = '';
	symbol: string = '';

	detailType: any = 'withdraw' // withdraw
	isDetail: boolean = false;
	loadTrade: boolean = true;

	//分页
	pageSize: number = 10;
	pageNum: number = 1;
	total: number;//Deposit Withdraw
	directionList: Array<any> = [
        { val: 33, zhName: "全部", enName: 'All' },
        { val: 1, zhName: "充值", enName: 'Deposit' },
		{ val: 2, zhName: "提币", enName: 'Withdraw' },
	]
	coinList: Array<any> = [
		{code: 9999, zhName: '全部', enName: 'All' }
	];
	coinListObj: object = {};

	historyList: Array<any> = [];
	detailInfo: Object;
	constructor(
		private service: service,
		private reset: resetData,
		private skin: SkinServiceService,
		public regular: regular,
		public load: Loadings,
		public translate: TranslateService,
	) {
		this.skin.getLangObservable().subscribe((res)=>{
			this.regular.setTitle(this.translate.instant('Title.assetHistory'))
        })
	}

	ngOnInit() {
		this.resetDate();
		this.getCoins();
		this.assetHistory();
		setTimeout(() => {
			this.regular.setTitle(this.translate.instant('Title.assetHistory'))
		})
	}

	resetDate(){
		this.minDate = this.regular.fun_month(-3);
		this.maxDate = new FormatPipe().transform(new Date(),4);
		this.startDate = new FormatPipe().transform(this.regular.fun_date(-7),4);
		this.endDate = new FormatPipe().transform(new Date(),4);
	}

    /**
     * 获取币种列表
     */
	async getCoins(){
		let data:any;
		await this.reset.getCoins().then( res => {
			data = res;
		});
		for(let item of data){
			this.coinListObj[item.symbol] = item;
			this.coinList.push({code: item.symbol, zhName: item.symbol, enName: item.symbol })
		}
	}

    /**
     * 详情
     * @param type
     * @param item
     */
	seeDetail(type,item) {
		this.isDetail = true;
		this.detailType = type == 2 ? 'withdraw' : 'deposit';
		this.detailInfo = item;
		this.detailInfo['haveOutAsset'] = this.coinListObj[item.symbol].haveOutAsset;
		this.detailInfo['is_tag'] = this.coinListObj[item.symbol].is_tag;
	}


	search(){
		this.pageNum = 1;
		this.assetHistory()
	}

    /**
     * 资产充值/提现记录
     */
	assetHistory() {
		// this.loadTrade = true;
		this.load.loadingShow();
		let data = {
			begin: this.startDate,
			end: this.endDate,
			symbol: this.symbol,
			type: this.direction,

			page_size: this.pageSize,
			page_num: this.pageNum,
		};
		this.service.assetHistory(data).then((res: any) => {
			this.loadTrade = false;
			this.load.hide();
			if (res.status == 0) {
				this.historyList = res.data.list;
				this.total = res.data.total;
			}
		})
	}

    /**
     * 分页
     * @param event
     */
	onCurrentPageChange(event) {
		this.pageNum = event;
		this.assetHistory();
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
		this.direction = val != 33 ? val : '';
		this.search()
	}
	requer(val){
		this.symbol = val.code != 9999 ? val.code : '';
		this.search()
	}

	toPrecision(symbol,val){
		try{
			return this.regular.toFixed(val, this.coinListObj[symbol].decimal || 0)
		}catch(error){

		}
	}

}
