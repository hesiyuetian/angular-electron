import {Component, OnDestroy, OnInit} from '@angular/core';
import { User } from '../../common/util/user';
import { DialogController } from '../../controller/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { regular } from '../../common/util/regular';

import { LoginAlertComponent } from '../../components/login-alert/login-alert.component';
import { SettingService } from '../../service/setting.service';
import { SkinServiceService } from '../../service/skin-service.service';
import { AuxBtService } from '../../service/aux-bt.service'
import { CONFIG } from '../../common/util/config'
import {Subscription} from 'rxjs';
import {Loadings} from '../../components/loadings/loadings';
@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    step: any = 1;

    languageStatus: boolean = false;
    setTimeStatus: boolean = false;
    themeStatus: boolean = false;

    users: any;
    address: string = '1345';
    language: string;
    setTime: string = '5 min';
    theme: string = 'Light';

    mnemonicList: Array<any>= [];
    privateKey: any = 'privateKeyprivateKeyprivateKeyprivateKeyprivateKeyprivateKey';
    publicKey: any;
    //获取当前区块高度
    currentHeight: any;

    sdkUrl: any = CONFIG.sdkUrl;

    //show dialog type
    dialogFlag: string = '';  // mnemonic、privateKey

    constructor(
        public user: User,
        private dialog: DialogController,
        private settingService: SettingService,
        private skin: SkinServiceService,
        private auxBt: AuxBtService,
        private regular: regular,
        public translate: TranslateService,
        public router: Router,
        private load: Loadings,
    ) {
        this.theme = this.user.getItem('theme') || 'Light';
    }

    ngOnInit() {
        this.subLangServe();
        this.subSettingServe();
        setTimeout( _ => {
            this.init();
        }, 200)
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe()
    }

    /**
     * 订阅Lang服务
     */
    subLangServe(): void{
        this.subServe.add(this.skin.getLangObservable().subscribe((res)=>{
            this.regular.setTitle(this.translate.instant('Title.seeting'))
        }))
    }

    /**
     * 订阅setting服务
     */
    subSettingServe(): void{
        this.subServe.add(this.settingService.getObservable().subscribe((res)=>{
            if(res.type == 'mnemonic'){
                this.mnemonicList = res.data.split(' ');
                this.dialogFlag = 'mnemonic';
            }else if(res.type == 'privateKey'){
                this.privateKey = res.data;
                this.dialogFlag = 'privateKey';
            }
            else if(res.type == 'change'){}
        }))
    }

    init(){
        this.language = (this.user.getItem('language') == 'zh') ? '简体中文' : 'English' ;
        this.publicKey = this.user.getItemlocalCrypt('publicKey');
        this.getKeyStore();
        this.getCurrentHeight();
        setTimeout( () => {
			this.regular.setTitle(this.translate.instant('Title.seeting'))
        })
    }

    /**
     * 获取当前区块高度
     */
    getCurrentHeight(): void{
        this.auxBt.getCurrentHeight().then(res => {
            this.currentHeight = res
        });
    }
    setStep(step){
        this.step = step;
    }

    /**
     * 获取本地keyStore
     */
    getKeyStore(){
        let list = this.user.getItem('user_login_keystore');
        if(list){ this.users = JSON.parse(list) }
    }

    /**
     * 多语言，时间，主题色 下拉框状态
     * @param type
     * @param status
     */
    select(type, status){
        if(type == 'language'){ this.languageStatus = status }
        else if(type == 'setTime'){ this.setTimeStatus = status }
        else if(type == 'theme'){ this.themeStatus = status }
    }

    /**
     * 多语言，时间，主题色 选择
     * @param type
     * @param value
     */
    selectContent(type, value ){
        if(type == 'language'){ this.setLanguage(value) }
        else if(type == 'setTime'){ this.setTime = value }
        else if(type == 'theme'){
            this.theme = value;
            this.skin.set(value);
        }

        this.languageStatus = false;
        this.setTimeStatus = false;
        this.themeStatus = false;
    }

    /**
     * 设置多语言
     * @param language
     */
    setLanguage(language){
        this.language = language == 'zh' ? '简体中文' : 'English'
        this.skin.setLang(language);
    }

    /**
     * 登出
     */
    logOut(){
        this.router.navigateByUrl('/user/login');
    }

    /**
     * 复制助记词
     */
    mnemonicCopy(){
        this.regular.copyTextToClipboard(this.mnemonicList.join(' '));
        this.load.tipSuccessShow(this.translate.instant('createWallet.copySuccess'))
    }

    /**
     * 弹窗
     * @param type
     */
    isShow(type){
        let tip2;
        if(type == 'mnemonic'){ tip2 = this.translate.instant('LoginAlert.mnemonicTip');  }
        else if(type == 'privateKey'){ tip2 = this.translate.instant('LoginAlert.privateTip'); }
        else if(type == 'keyStore'){
            tip2 = this.translate.instant('LoginAlert.keyTip');
            this.getKeyStore();
        }
        let config = {
            type: type,
            keyStore: this.users,
            tip1: this.translate.instant('LoginAlert.warn'),
            tip2: tip2,
            tip3: this.translate.instant('LoginAlert.changePwd'),
            callback: ()=>{
                this.getKeyStore();
            }
        };
        this.dialog.createFromComponent(LoginAlertComponent, config);
    }
}
