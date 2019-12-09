import {Component, OnInit, OnDestroy} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {User} from '../../../common/util/user';
import {service} from '../../../common/util/service';
import {resetData} from '../../../common/util/resetData';
import {Loadings} from '../../../components/loadings/loadings';
import {regular} from '../../../common/util/regular';
import {FilterNumberPipe} from '../../../pipes/fiter-number.pipe'
import {SkinServiceService} from '../../../service/skin-service.service'
import {AuxBtService} from '../../../service/aux-bt.service'
import { CONFIG } from '../../../common/util/config'


declare var QRCode;

@Component({
    selector: 'app-asset-list',
    templateUrl: './asset-list.component.html',
    styleUrls: ['./asset-list.component.scss']
})
export class AssetListComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    config= CONFIG;

    // sub Dialog
    sub_flag: any = false;

    sub_address: any = '';
    sub_amountLeft: any = '';
    sub_amountRight: any = '';
    sub_des: any = '';
    sub_pwd: any = '';

    deo_amountLeft: any = '';
    deo_amountRight: any = '';
    deo_pwd: any = '';

    sub_addressF: any = false;
    have_tagF: any = false;
    sub_amountLeftF: Boolean = false;
    sub_amountRightF: Boolean = false;
    sub_desF: Boolean = false;
    sub_pwdF: Boolean = false;
    deo_pwdF: Boolean = false;
    deo_amountLeftF: Boolean = false;
    deo_amountRightF: Boolean = false;

    // 是否满足最小提币数量
    minWithdrawFlag: boolean = true;

    // sub Dialog
    add_flag: any = false;
    dep_flag: string = 'step1';

    // assetDetail
    assetDetail: boolean = false;

    // 托管方信息切换
    changeType: string = 'detail';

    assetList: Array<any> = [];
    assetsDetail: object = {};

    symbolInfo: any = {
        logo: '',
        name: '',
        symbol: '',
        withdrawBalance: 0,  // 提现  ==> 账户(交易所账户)余额
        withdrawFeeRate: 0,  //提现 ==> 提现手续费
        precision: 0,  // 提现、无链外资产充值 ==> 精度
        balance: 0,  //无链外资产充值 ==> 账户(token)余额
        minWithdraw: 0, //最小提币数量
        have_tag: ''  // tag标签
    };

    /**
     * payer
     */
    payerStatus: boolean = false;
    payerType: string = 'proxy';
    payerThrottleTime: any;
    BtContractAddres: string;
    payerInfo = {
        amount: 0,
        tx: ''
    };

    // tag标签
    have_tag: string;
    // 资产合约
    contractAddress: string;
    // 提现钱包地址 (托管方映射地址)
    withdrawAddress: String;
    // 充值地址
    depositAddress: String;
    // 是否有托管方
    haveOutAsset: String;
    // 行情数据
    tickerListObj: Object = {};
    tickerList: Array<any> = [];
    // 币种信息
    coinsData: Array<any> = [];

    constructor(
        private service: service,
        private load: Loadings,
        private user: User,
        public regular: regular,
        public auxBt: AuxBtService,
        public translate: TranslateService,
        private reset: resetData,
        private skin: SkinServiceService,
    ) {


    }

    ngOnInit() {
        this.subThemeServe();
        setTimeout(() => {
            this.regular.setTitle(this.translate.instant('Title.assetList'))
        });
        this.load.loadingShow();
        Promise.all([this.getPairsList()])
    }

    ngOnDestroy() {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅theme服务
     */
    subThemeServe(): void{
        this.subServe.add(this.skin.getLangObservable().subscribe((res) => {
            this.regular.setTitle(this.translate.instant('Title.assetList'))
        }))
    }

    focusInput(val, type?) {
        if (!this[val]) this[`${val}F`] = !!type
    }

    /**
     * getPairsList
     * 获取行情数据 - new
     */
    getPairsList() {
        let data = {};
        this.service.getPairsList(data).then((res: any) => {
            if (res.status == 0) {
                for(let item of res.data){
                    this.tickerListObj[item.pair] = item.close
                }
                this.reset.caleUSDT(res.data);
                this.tickerList = res.data;
                this.getAssetList();
            }
        })
    }

    /**
     * getAssetList
     * 获取资产列表
     */
    getAssetList() {
        const success = data => {
            this.load.hide();
            if (data.status === 0) {
                this.getCoins(data.data);
            } else {
                this.load.tipErrorShow(data.msg)
            }
        };
        this.service.assetList().then(res => success(res))
    }

    /**
     * 获取币种列表
     * @param assetList
     */
    async getCoins(assetList) {
        this.assetList = [];
        await this.reset.getCoins().then((res: any) => {
            this.coinsData = res;
        });

        for (let list of assetList) {
            for (let item of this.coinsData) {
                if (list.symbol === item.symbol) {

                    list['precision'] = item.decimal;
                    list['minWithdraw'] = item.min_withdraw;
                    list['withdrawFeeRate'] = item.withdraw_fee_rate;

                    list['contractAddress'] = item.contract_address;
                    list['logo'] = item.logo;
                    list['symbolName'] = item.name;
                    list['haveOutAsset'] = item.is_backed;
                    list['can_deposit'] = item.can_deposit;
                    list['can_withdraw'] = item.can_withdraw;
                    list['is_tag'] = item.is_tag;
                }
            }
            this.assetList.push(list);
        }
        this.setAsyncAsset();
    }

    /**
     * setAsyncAsset
     * 异步处理资产数据
     */
    async setAsyncAsset() {
        for (let val of this.assetList) {
            for (let item of this.coinsData) {
                if (val.symbol === item.symbol) {
                    if(val.symbol === 'BT') this.BtContractAddres = val.contractAddress;
                    !val.haveOutAsset && await this.auxBt.getBlanace(val.contractAddress).then((res: any) => {
                        val.balance = this.regular.toFixed(res.result / (10 ** item.decimal) || 0, item.decimal)
                    });
                    val.usdtVal = this.reset.raleUsdt(val.symbol, val.available, this.tickerListObj);
                    val.btcVal = this.regNaN(this.reset.matchPair(val.symbol, val.available, val.usdtVal, this.tickerListObj));
                }
            }
        }
    }

    /**
     * isNaN
     * @param val
     */
    regNaN(val) {
        if (isNaN(val)) return "0.00000000";
        else return val
    }

    /**
     * getDetail
     * 获取资产详情
     * @param symbol
     */
    getDetail(symbol) {
        return new Promise((resove, reject) => {
            const success = data => {
                if (data.status === 0) {
                    const findIndex = this.assetList.findIndex((cur) => {
                        return cur.symbol === symbol
                    });
                    this.assetList[findIndex]['detailInfo'] = data.data;

                    // 异步处理链上查询
                    this.auxBt.getTokenInfo(data.data.contract_address).then((res: any) => {
                        this.assetList[findIndex]['detailInfo']['currentSupply'] = this.regular.toFixed(res.Supply / (10 ** res.Decimal) || res.TotalSupply / (10 ** res.Decimal), 0)
                        this.assetList[findIndex]['detailInfo']['totalSupply'] = this.regular.toFixed(res.TotalSupply / (10 ** res.Decimal) || 0, 0)
                    });
                    resove(data.data);
                } else {
                    this.load.tipErrorShow(data.msg)
                }
            };
            this.service.assetDetail({symbol: symbol}).then(res => success(res))
        })
    }

    /**
     * 设置对应资产列表的详情数据
     * @param obj
     */
    setDetailInfo(obj) {
        return new Promise((resove, reject) => {
            if (!obj.detailInfo) {
                this.getDetail(obj.symbol).then(res => {
                    resove(res)
                });
            } else {
                resove(obj.detailInfo)
            }
        })
    }

    /**
     * 查看详情
     * @param obj
     */
    seeDeatil(obj) {
        this.symbolInfo = {
            logo: obj.logo,
            name: obj.symbolName,
            symbol: obj.symbol,
        };
        this.changeType = 'detail';
        if (!obj.detailInfo) {
            this.load.loadingShow();
            this.getDetail(obj.symbol).then((res: any) => {
                this.load.hide(), this.assetsDetail = res
            })
        } else {
            this.assetsDetail = obj.detailInfo;
        }
        this.assetDetail = true;
    }

    /**
     * 提币操作
     * @param obj
     */
    withdraw(obj) {
        this.resData();
        this.setDetailInfo(obj).then((res: any) => {
            this.load.hide();
            this.symbolInfo = {
                logo: obj.logo,
                name: obj.symbolName,
                symbol: obj.symbol,
                withdrawBalance: obj.available,
                withdrawFeeRate: obj.withdrawFeeRate,
                precision: obj.precision,
                minWithdraw: obj.minWithdraw,
                have_tag: obj.detailInfo.custodian_address_tag,
                is_tag: obj.is_tag
            };

            this.haveOutAsset = res.is_backed;
            this.contractAddress = res.contract_address;

            if (this.haveOutAsset && !res.custodian_withdraw_address) return this.load.tipErrorShow(this.translate.instant('common.withdrawError'));

            try {
                this.withdrawAddress = this.haveOutAsset ? res.custodian_withdraw_address : this.user.getObject('account').userId;
                if (!this.haveOutAsset) this.sub_address = this.user.getObject('account').userId;
                this.sub_flag = "step1";
            } catch (error) {
                return this.load.tipErrorShow(this.translate.instant('common.withdrawError'));
            }

        })
    }

    /**
     * 提币上链
     * @param step
     */
    sub_send(step?: String) {
        let time = this.auxBt.isExpirTime();
        if (step === 'step2' && time) {
            return this.sub_flag = 'step3';
        }

        const userId = this.user.getObject('account').userId;
        const option: any = {
            amount: this.regular.toBigsell([this.sub_amountLeft, (10 ** this.symbolInfo.precision)]).toString(),
            asset: this.contractAddress,
            extra: '',
            extras: {
                recipientAddress: this.haveOutAsset ? this.sub_address : '',
                addressTag: this.have_tag || '',
                custodianFee: this.haveOutAsset ? '0' : "0",
            },
            remark: this.sub_des,
            from: userId,
            salt: Math.round(new Date().getTime() / 1000).toString(),
            sig: '',
            transaction_fee: this.regular.toFixed(this.symbolInfo.withdrawFeeRate * this.sub_amountLeft, this.symbolInfo.precision),
            fee: 0, //要乘以精度次方
            to: this.withdrawAddress
        };

        option.extra = JSON.stringify(option.extras);
        option.fee = this.regular.toBigsell([Number(option.transaction_fee), (10 ** this.symbolInfo.precision)]).toString();
        delete option.extras;
        delete option.transaction_fee;

        const success = (data: any) => {
            this.load.hide();
            if (data.status === 0) {
                this.setTokenBlanace();
                this.assetUpata(1);
            } else {
                this.load.tipErrorShow(data.msg)
            }
        };

        if (this.sub_pwd || step === 'step2') {
            this.load.loadingShow();
            setTimeout(() => {
                option.sig = this.auxBt.withdrawSig(option, this.sub_pwd);
                option.sig && this.service.withdraw(option).then(res => success(res))
            }, 10)
        }
    }

    qurTableCount() {
        return (
                !this.haveOutAsset &&
                this.sub_amountLeft > 0 && this.regular.comparedTo(this.sub_amountLeft, this.symbolInfo.minWithdraw) != -1
            ) ||
            (
                this.haveOutAsset &&
                !!this.sub_address &&
                this.sub_amountLeft > 0 && this.regular.comparedTo(this.sub_amountLeft, this.symbolInfo.minWithdraw) != -1
            )
    }

    /**
     * 充值上链
     * @param step
     */
    deo_send(step?: string) {
        let time = this.auxBt.isExpirTime();

        if (step === 'step3' && time) {
            return this.dep_flag = step
        }

        if (this.deo_pwd || step === 'step3') {
            this.load.loadingShow();
            setTimeout(() => {
                this.auxBt.deposit(this.payerInfo.tx, this.deo_pwd).then((res: any) => {
                    if (res.error.code != 0){
                        return this.load.tipErrorShow(res.error.message || '');
                    } else {
                        const config = {
                            hash: res.result,
                            success: res => {
                                this.setTokenBlanace(this.BtContractAddres);
                                this.setTokenBlanace();
                                this.assetUpata(2);
                            },
                            error: res => { }
                        };
                        this.auxBt.deoInterEventLog(config);
                        // this.deoInter(res);
                    }
                })
            }, 10)
        }
    }

    /**
     * depositPayer
     */
    depositPayer(): void{
        this.dep_flag = "step2";
        this.payerInfo.tx = '';

        // 构建交易tx
        const userId = this.user.getObject('account').userId;
        const option = {
            payer: userId,
            asset: this.contractAddress,
            from: userId,
            to: userId,
            value: this.regular.toBigsell([this.deo_amountLeft, (10 ** this.symbolInfo.precision)]).toString(),
            payerTx: this.payerInfo.tx,
            payerType: this.payerType
        };
        this.auxBt.depositPayer(option).then((res:any) => {
            this.payerInfo = res;
        })
    }

    /**
     * selectPayer
     * @param type
     */
    selectPayer(type: string): void{
        this.payerStatus = false;
        this.payerType = type;
    }

    /**
     * 资产列表更新
     * @param type  1 ==>  提币    2 ==> 充值  3 ==> Get Test Coin
     */
    assetUpata(type, symbol?:string) {

        const success = data => {
            if (data.status === 0) {
                this.setExchangeBlanace(data.data, symbol);
                this.load.hide();
                if (type === 1) this.load.tipSuccessShow(this.translate.instant('common.withdrawSuccess')), this.sub_flag = false;
                else if(type === 2) this.load.tipSuccessShow(this.translate.instant('common.depositSuccess')), this.add_flag = false, this.dep_flag = 'step1';
                else this.load.tipSuccessShow(this.translate.instant('assets.list.giveSuccess'));
            } else {
                this.load.tipErrorShow(data.msg)
            }
        };
        this.service.getBalance({symbol: symbol || this.symbolInfo.symbol}).then(res => {
            success(res)
        })
    }

    /**
     * 查询并修改token余额
     */
    async setTokenBlanace(contractAddress?:string) {
        const _contractAddress = contractAddress ? contractAddress :  this.contractAddress;
        await this.auxBt.getBlanace(_contractAddress).then((res: any) => {
            const fIndex: any = this.assetList.findIndex((ele) => {
                return ele.contractAddress === this.contractAddress;
            });
            this.assetList[fIndex].balance = this.regular.toFixed(res.result / (10 ** this.assetList[fIndex].precision) || 0, this.assetList[fIndex].precision)
        })
    }

    /**
     * 查询并修改交易所账户余额
     * @param data
     * @param symbol
     */
    setExchangeBlanace(data, symbol?:string) {
        const fIndex: any = this.assetList.findIndex((ele) => {
            return ele.symbol === (symbol || this.symbolInfo.symbol);
        });
        this.assetList[fIndex].available = data[0].available;
        this.assetList[fIndex].on_orders = data[0].on_orders;
    }

    /**
     * 充值表单数据
     */
    resData(): void {
        this.minWithdrawFlag = true;
        this.sub_address = '';
        this.sub_amountLeft = '';
        this.sub_amountRight = '';
        this.sub_des = '';
        this.sub_pwd = '';

        this.deo_amountLeft = '';
        this.deo_amountRight = '';
        this.deo_pwd = '';

        this.sub_addressF = false;
        this.sub_amountLeftF = false;
        this.sub_amountRightF = false;
        this.sub_desF = false;
        this.sub_pwdF = false;
        this.deo_pwdF = false;
        this.deo_amountLeftF = false;
        this.deo_amountRightF = false;

        this.payerInfo.tx = '';
    }

    change(type): void {
        this.changeType = type;
    }

    deoClose() {
        this.add_flag = false;
        this.dep_flag = 'step1';
        this.payerStatus = false;
    }

    /**
     * 充值
     * @param obj
     */
    deposit(obj): void {
        this.resData();
        this.setDetailInfo(obj).then((res: any) => {
            this.load.hide();
            this.symbolInfo = {
                logo: obj.logo,
                name: obj.symbolName,
                symbol: obj.symbol,
                precision: obj.precision,
                balance: obj.balance || 0,
                have_tag: obj.detailInfo.custodian_address_tag,
                is_tag: obj.is_tag
            };

            this.haveOutAsset = res.is_backed;
            this.contractAddress = res.contract_address;
            if (this.haveOutAsset && !res.custodian_deposit_address) return this.load.tipErrorShow(this.translate.instant('common.depositError'));
            if (this.haveOutAsset && obj.is_tag && !!!obj.detailInfo.custodian_address_tag) return this.load.tipErrorShow(this.translate.instant('common.tagError'));

            this.add_flag = true;
            if (this.haveOutAsset) {
                this.depositAddress = res.custodian_deposit_address;
                this.setQrCode(this.depositAddress)
            }

        })
    }

    /**
     * 生成二维码
     * @param title
     */
    setQrCode(title?: String): void {
        setTimeout(() => {
            var qrcode = new QRCode(document.getElementById("qr-code"), {
                width: 130,
                height: 130
            });
            qrcode.clear();
            qrcode.makeCode(title);
        }, 300)
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
     * 输入限制
     * @param params
     * @param event
     * @param decimalPointNumber
     * @param balance
     */
    onModelChange(params, event, decimalPointNumber: number = 8, balance) {
        setTimeout(() => {
            const number = new FilterNumberPipe().transform(event, decimalPointNumber);
            const maxNumber = this.regular.toFixed(balance, decimalPointNumber);
            this[params] = Number(number) > Number(maxNumber) ? maxNumber : number;
        }, 0);
    }

    /**
     * getTestNetCoin
     * @param symbol
     */
    getNetCoin(symbol: string){
        this.load.loadingShow();
        this.service.getFaucet({symbol: symbol}).then( (res:any) => {
            this.load.hide();
            if(res.status === 0){
                this.assetUpata(3, symbol);
            }else {
                this.load.tipErrorShow(res.msg)
            }
        })
    }

    verifyMinWithdraw(curVal, minWithdraw) {
        this.minWithdrawFlag = this.regular.comparedTo(curVal, minWithdraw) != -1
    }

    toNumber(data) {
        return this.regular.fanToNum(data || 0)
    }

    pow(num, val){
        return num ** val
    }
}
