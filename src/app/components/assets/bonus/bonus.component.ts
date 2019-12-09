import {Component, OnInit} from '@angular/core';
import {AuxBtService} from '../../../service/aux-bt.service';
import {User} from '../../../common/util/user';
import {resetData} from '../../../common/util/resetData';
import {regular} from '../../../common/util/regular';
import {DialogController} from '../../../controller/dialog';
import { DialogPwdComponent } from '../../../components/dialog-pwd/dialog-pwd.component'
import {Loadings} from '../../loadings/loadings';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SkinServiceService} from '../../../service/skin-service.service';

@Component({
    selector: 'app-bonus',
    templateUrl: './bonus.component.html',
    styleUrls: ['./bonus.component.scss']
})
export class BonusComponent implements OnInit {
    public xtarInfo: object ={decimal: 8};
    public bonusList: Array<any> = [
        {name: 'stake', value: '0'},
        {name: 'TBC', value: '0'},
        {name: 'TodayBonus', value: '1000.00000000'},
        {name: 'TotalBonus', value: ''},
        {name: 'Lockups', value: ''},
        {name: 'Available', value: ''}
    ];
    public showRules: boolean= true;

    txid_time: any;
    theme:string;

    constructor(
        private auxBt: AuxBtService,
        private user: User,
        private router: Router,
        private skin: SkinServiceService,
        private load: Loadings,
        public regular: regular,
        public translate: TranslateService,
        public dialog: DialogController,
        public reset: resetData
    ) {
        this.theme = window.document.documentElement.getAttribute('data-theme-style');
        this.skin.getObservable().subscribe( res => { this.theme = res });
    }

    ngOnInit() {
        this.getCoin();
        Promise.all([this.getDayBonus(),this.getBonus(),this.getBxaTokenInfo()])
    }

    /**
     * 获取BT详情
     */
    getCoin():void {
        this.reset.getCoins().then((res: any) => {
            this.xtarInfo = res.filter(res => { return res.symbol === 'BT'})[0]
        });
    }

    /**
     * 获取挖矿奖励信息
     */
    getBonus():void {
        this.auxBt.getBonus(this.user.userId()).then((res: any) => {
            this.bonusList[3].value = res.lockedBonus + res.unlockedBonus;
            this.bonusList[4].value = res.lockedBonus;
            this.bonusList[5].value = res.unlockedBonus;
        })
    }

    /**
     * 查询用户用于挖矿的抵押详情
     */
    getBxaTokenInfo():void {
        this.auxBt.getMineInfo(this.user.userId()).then((res: any) => {
            let mineInfo: Array<any> = JSON.parse(res).mineInfo;
            this.bonusList[0].value = mineInfo[0].stake || 0;
        })
    }

    /**
     * getDayBonus
     * @param num
     * @param val
     */
    getDayBonus():void {
        this.auxBt.getDayBonus(this.user.userId()).then( (res:any) =>{
            this.bonusList[1].value = res[0] || 0;
            this.bonusList[2].value = res[1] || 0;
        })
    }

    /**
     * 申请解锁奖励
     */
    claimBonus():void {
        const callback = pwd =>{
            this.load.loadingShow();
            this.auxBt.claimBonus(this.user.userId(),pwd).then( (res:any) =>{

                if (res.error.code != 0) return this.load.tipErrorShow(res.error.message || '');
                else this.deoInter(res.result);
                console.log(res.result,'res')
            })
        };

        this.regularPwd(callback);
    }

    /**
     * 提取结果查询
     * @param res txid
     */
    deoInter(res) {
        let num = 0;
        clearInterval(this.txid_time);
        this.txid_time = setInterval(() => {
            this.auxBt.client.GetEventLog(res.result).then(res => {
                num++;
                if (res.result && res.result.error_code === 0) {
                    clearInterval(this.txid_time);
                    this.load.hide();
                    return this.dialog.destroy();
                } else {
                    if (num > 8) {
                        this.load.hide();
                        this.dialog.destroy();
                        clearInterval(this.txid_time);
                        this.load.tipSuccessShow(this.translate.instant('common.selectExtractError'));
                    }
                }
            })
        }, 1000)
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
                },
                close: res => {

                }
            };
            this.dialog.createFromComponent(DialogPwdComponent,option);
        }else FN();
    }

    /**
     * 奖励规则关闭
     */
    closeRules(){
        this.showRules = !this.showRules
    }

    link(val){
        this.router.navigateByUrl(val)
    }

    pow(num, val){
        return num ** val
    }
}
