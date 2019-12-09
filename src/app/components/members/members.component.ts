import {Component, Input, OnInit} from '@angular/core';
import {User} from '../../common/util/user';
import {regular} from '../../common/util/regular';
import {AuxBtService} from '../../service/aux-bt.service';
import {resetData} from '../../common/util/resetData';
import {Router} from '@angular/router';
import {Loadings} from '../loadings/loadings';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-members',
    templateUrl: './members.component.html',
    styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {
    pwd: string;
    pwdFlag: boolean = false;
    private deo_time: any;
    public isExpir: boolean = this.auxBt.isExpirTime();

    /**
     * payer
     */
    payerStatus: boolean = false;
    payerType: string = 'selfResource';
    payerInfo = {
        amount: 0,
        tx: ''
    };

    /**
     * 是否已经是会员
     */
    public hasTag: boolean = false;

    /**
     * 余额是否满足注册会员
     */
    public blance: boolean = true;

    @Input() config;
    @Input() onDialogClose;

    constructor(
        public load: Loadings,
        public user: User,
        public translate: TranslateService,
        public router: Router,
        public regular: regular,
        public auxBt: AuxBtService,
        public reset: resetData
    ) {

    }

    ngOnInit() {
        this.checkPrime()
    }

    /**
     * setAccountPrime
     */
    setAccountPrime(isPrimeUser:boolean): void{
        let accountObj = JSON.parse(this.user.getItem('account'));
        accountObj.is_prime = isPrimeUser;
        this.user.setItem('account', JSON.stringify(accountObj))
    }


    /**
     * 检验是否注册过域名
     */
    checkPrime(){
        this.auxBt.IsPrimeUser(this.user.userId()).then( (res:any) => {
            this.hasTag = JSON.parse(res).isPrimeUser;
            if(this.hasTag == false) this.checkBlance();
            else this.setAccountPrime(this.hasTag)
        })
    }

    /**
     * 检验余额是否满足
     */
    async checkBlance() {
        // BtInfo信息
        let btInfo = null, balance;
        await this.reset.getCoins().then((res: any) => {
            btInfo = res.filter(res => {
                return res.symbol === 'BT';
            })[0];
        });
        this.auxBt.getBlanace(btInfo.contract_address).then((res: any) => {
            balance = this.regular.toFixed(res.result / (10 ** btInfo.decimal) || 0, btInfo.decimal);
            this.blance = balance >= 10 ? true : false;
            if(this.blance) this.calcRegiterPrime(this.payerType);
        });
    }

    /**
     * pwd - 注册
     */
    register() {
        this.auxBt.regiterPrime(this.payerInfo.tx, this.pwd).then((res: any) => {
            this.load.loadingShow();
            if (res.error.code != 0) {
                this.load.hide();
                console.log(res.error)
                if(res.error.code === 1012) this.load.tipErrorShow(this.translate.instant("common.notEnoughNet"));
                else this.load.tipErrorShow(res.error.message);
            } else {
                const config = {
                    hash: res.result,
                    success: res => {
                        this.close();
                        this.setAccountPrime(true);
                        this.load.tipSuccessShow(this.translate.instant('member.regiterSuccess'));
                        this.router.navigateByUrl('/assets_records/list');
                    },
                    error: res => {
                        this.close();
                    }
                };
                this.auxBt.deoInterEventLog(config)
            }
        });
    }

    /**
     * calcRegiterPrime
     * * @param payerType
     */
    calcRegiterPrime(payerType): void{
        this.auxBt.calcRegiterPrime(payerType, this.user.userId()).then( res => {
            this.payerInfo = res;
        })
    }

    /**
     * selectPayer
     */
    selectPayer(type: string): void{
        this.payerStatus = false;
        this.payerType = type;
        this.calcRegiterPrime(type);
    }

    focusInput(flag?: boolean) {
        if (!this.pwd) {
            this.pwdFlag = !!flag;
        }
    }

    close() {
        this.onDialogClose();
        this.config.close && this.config.close();
    }

    /**
     * link
     */
    link(url) {
        this.router.navigateByUrl(url);
        this.close();
    }

}
