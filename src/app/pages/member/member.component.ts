import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {regular} from '../../common/util/regular';
import {resetData} from '../../common/util/resetData';
import {AuxBtService} from '../../service/aux-bt.service';
import {Loadings} from '../../components/loadings/loadings';
import {TranslateService} from '@ngx-translate/core';
import {User} from '../../common/util/user';

@Component({
    selector: 'app-member',
    templateUrl: './member.component.html',
    styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit {
    public loadFlag: boolean = true;

    public hasTag: boolean = false;
    public time: number = 5;

    // 余额是否满足注册会员
    public blance: boolean = false;

    //域名
    public name: string;
    public nameErrorGrade: number = 0;  // 域名错误等级  -2: 字符长度满足    -1: 通过      0: 默认      1：字符超过12个     2: 域名被占用

    // pwd
    public pwd: string;
    public pwdFlag: boolean = false;

    private deo_time: any;

    constructor(
        public regular: regular,
        public router: Router,
        public user: User,
        public auxBt: AuxBtService,
        public load: Loadings,
        public translate: TranslateService,
        public reset: resetData
    ) {

    }

    ngOnInit() {
        this.checkPrime();
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
            this.loadFlag = false;

        });
    }

    /**
     * 检验是否注册过域名
     */
    checkPrime(){
        this.auxBt.HasFatherNameTag(this.user.userId()).then( (res:any) => {
            this.hasTag = res;
            if(res === false) this.checkBlance();
            else{

                let interval = setInterval(() => {
                    this.time -= 1;
                    if(this.time == 0){
                        clearInterval(interval);
                        window.history.go(-1);
                    }
                },1000)
            } this.loadFlag = false;
        })
    }

    /**
     * Input keyUp事件
     * @type   pwd: 密码     name: 域名
     */
    checkKeyup(type: string) {
        if (type === 'pwd') {
            this.pwd.length > 0 ? this.pwdFlag = true : this.pwdFlag = false;
        } else {
            this.name = this.regular.stringAndNumber(this.name);
            if (this.name.length > 12) {
                this.nameErrorGrade = 1;
            } else if (this.name.length == 0) {
                this.nameErrorGrade = 0;
            } else {
                this.nameErrorGrade = -2;
            }
        }
    }

    /**
     * 检验域名是否存在
     */
    regName() {
        this.name = this.regular.stringAndNumber(this.name);
        this.auxBt.getAdressInfo(this.name).then((res: any) => {
            const obj = res.filter(ele => {
                return ele.type === 'uint8';
            })[0];

            if (obj.value === '0') {
                this.isRegular();
            } else {
                this.nameErrorGrade = 2;
            }
        });
    }

    /**
     * isRegular
     */
    isRegular() {
        if (this.auxBt.isExpirTime()) {
            this.nameErrorGrade = -1;
        } else {
            this.register();
        }
    }

    /**
     * pwd - 注册
     */
    register(pwd?) {
        this.auxBt.regiterPrime(this.name, pwd).then((res: any) => {
            this.load.loadingShow();
            if (res.error.code != 0) {
                this.load.hide();
                this.load.tipErrorShow(res.error.message);
            } else {
                this.deoInter(res.result);
            }
        });
    }

    /**
     * 注册结果查询
     * @param res
     */
    deoInter(res) {
        let num = 0;
        clearInterval(this.deo_time);
        this.deo_time = setInterval(() => {
            this.auxBt.client.GetEventLog(res).then(res => {
                num++;
                if (res.result && res.result.error_code === 0) {
                    clearInterval(this.deo_time);
                    this.load.tipSuccessShow(this.translate.instant('member.regiterSuccess'));
                    return this.router.navigateByUrl('/assets_records/list');
                } else {
                    if (num > 8) {
                        this.load.hide();
                        clearInterval(this.deo_time);
                        this.load.tipSuccessShow(this.translate.instant('member.selectRegiterError'));
                    }
                }
            })
        }, 1000)
    }

    /**
     * link
     */
    link(url) {
        if (url === 'return') {
            return window.history.go(-1);
        }
        this.router.navigateByUrl(url);
    }
}
