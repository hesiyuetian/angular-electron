import { Component, OnInit } from '@angular/core';
import { service } from '../../../common/util/service'
import { User } from '../../../common/util/user'
import { regular } from '../../../common/util/regular'
import { resetData } from '../../../common/util/resetData'
import { Loadings } from '../../loadings/loadings'
import { TranslateService } from "@ngx-translate/core";
import { FormatPipe } from '../../../pipes/format.pipe'
import { SkinServiceService } from '../../../service/skin-service.service'
import { ConterAlertComponent } from '../../alert/conter-alert/conter-alert.component'
import { DialogController } from '../../../controller/dialog'
import {AuxBtService} from '../../../service/aux-bt.service';

@Component({
	selector: 'app-open',
	templateUrl: './open.component.html',
	styleUrls: ['./open.component.scss']
})
export class OpenComponent implements OnInit {
	minDate: String = '';
	maxDate: String = '';
	startDate: String = '';
	endDate: String = '';

	status: String = '';
	quoteSymbol: String = '';

	loadTrade: boolean = true;

	directionList: Array<any> = [
        { val: 33, zhName: "全部", enName: 'All' },
        { val: 0, zhName: "买", enName: 'Buy' },
		{ val: 1, zhName: "卖", enName: 'Sell' },
	];

	currentPage: number = 1;
	totalRow: number = 1;
	// 订单列表
	orderList: Array<any> = [];
	// 所有交易对列表
	pairsList: Array<any> = [
		{code: 9999, zhName: '全部', enName: 'All' },
	];
	// 所有交易对精度对象
	pairObj: Object = {};
	constructor(
		private service: service,
		private skin: SkinServiceService,
		public user: User,
		public dialog: DialogController,
		public reset: resetData,
		public regular: regular,
		private load: Loadings,
		public translate: TranslateService,
        public auxBt: AuxBtService
    ) {
		this.skin.getLangObservable().subscribe((res)=>{
			this.regular.setTitle(this.translate.instant('Title.openOrder'))
        })
	}

	ngOnInit() {
		setTimeout(() => {
			this.regular.setTitle(this.translate.instant('Title.openOrder'))
		});
		this.init();
	}

	init(){
		this.resetDate();
		this.getPairsList();
	}

	resetDate(){
		this.minDate = this.regular.fun_month(-3);
		this.maxDate = new FormatPipe().transform(new Date(),4);
		this.startDate = new FormatPipe().transform(this.regular.fun_date(-7),4);
		this.endDate = new FormatPipe().transform(new Date(),4)
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
		let sList = '0, 1, 2, 5';
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
			if(data.status === 0){
				this.totalRow = data.data.total;
				for(let item of data.data.list){
                    item.amountPrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[0] || 4);
					item.priciPrecision = Number(this.pairObj[`${item.pair.replace(/_/g, '/')}`].split("_")[1] || 4)
				}
				this.orderList = data.data.list;
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
			this.pairObj[item.pair] = (item.amount_precision || 0) +'_'+ (item.price_precision || 0);
			this.pairsList.push({code: item.pair, zhName: item.pair, enName: item.pair })
		}
		this.getOrderList();
	}

	onCurrentPageChange(page){
        this.currentPage = page;
        this.getOrderList(page)
    }

    /**
     * 撤单
     * @param orderId
     */
	cancelOrder(orderId) {
		let params = {
			ids: orderId,
            sig: ''
		};
		const success = data => {
			if (data.status === 0) {
                this.dialog.destroy();
				this.load.tipSuccessShow(this.translate.instant('common.cancleSuccess'));
				this.search();
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
     * 交易对切割
     * @param pair
     * @param index
     */
    pairSplit(pair,index){
        return pair.split('_')[index]
    }
}
