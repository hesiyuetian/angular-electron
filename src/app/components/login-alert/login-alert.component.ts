import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { BtService } from '../../common/util/bt.service';
import { SettingService } from '../../service/setting.service';
import { User } from '../../common/util/user';
import { Loadings } from '../../components/loadings/loadings';
import { TranslateService } from '@ngx-translate/core';
import { regular } from '../../common/util/regular';

@Component({
  selector: 'app-login-alert',
  templateUrl: './login-alert.component.html',
  styleUrls: ['./login-alert.component.scss', '../../skin.scss']
})
export class LoginAlertComponent implements OnInit {

    @Input() config;//必留参数
    @Input() onDialogClose: Function;//必留参数
    fadeFlag: string = 'fadeIn';

    passwordFocusS: boolean = false;
    passwordStatus: string = 'password';
    password: any;

    newPasswordFocusS1: boolean = false;
    newPasswordFocusS2: boolean = false;
    newPassword1: any;
    newPassword2: any;

    changeStatue: boolean = false;
    changeAlert: boolean = false;
    changePri: string;

    type: any;

    word: any;
    wordPri: any;
    wordKetStore: any;

    //密码强度
    passwordTotalStrength: Array<any> = [
        { status: '' },
        { status: '' },
        { status: '' },
        { status: '' }
    ];
    //密码安全度
    passwordSecurity: any = -1;

    // waring图片默认和划过标识
    waringFlag: boolean = true
    // down图片默认和划过标识
    downFlag: boolean = true

    theme:string = this.user.getItem('theme')

    constructor(
        private Bt: BtService,
        private settingService: SettingService,
        private user: User,
        private router: Router,
        private load: Loadings,
        public translate: TranslateService,
        private reg: regular,
    ) { }

    ngOnInit() {
        this.type = this.config.keyStore.type;
        this.setPasswordColor();
    }

    /**
     * 输入框动画
     * @param type
     * @param status
     */
    putStatue(type, status){
        if(type == 'span'){
            let dom:any = document.getElementsByClassName('put-focus');
            dom[status].focus();
        }else{
            if(type == 'password'){ this.passwordFocusS = this.password ? true : status }
            else if(type == 'newPassword1'){ this.newPasswordFocusS1 = this.newPassword1 ? true : status }
            else if(type == 'newPassword2'){ this.newPasswordFocusS2 = this.newPassword2 ? true : status }
        }
    }

    enterValue(){

    }
    btnStatus(type){
        if(type == 'change'){
            if(!this.newPassword1){
                return
            }
            this.passwordL();
            if(this.password && this.newPassword1 && this.newPassword1.length >= 8 && this.passwordSecurity >= 3 && (this.newPassword1 == this.newPassword2)){
                this.changeStatue = true;
            }else{
                this.changeStatue = false;
            }
        }
    }

    setInputType(value){
        this.passwordStatus = value;
    }

    /**
     * type == 2 下载助记词
     */
    submit(){
        if(this.password){
            const keyStore = JSON.stringify(this.config.keyStore.keyStore);
            let account;
            if(this.type == 'key'){
                account = this.Bt.load(keyStore, this.password);
                if(account.status != 0){
                    this.load.tipErrorShow(this.translate.instant('Login.keyStoreError'));
                    return
                }
            }else if(this.type == 'mnemonic'){
                let wordAccount:any = this.Bt.load(keyStore, this.password);
                if(wordAccount.status == 0){
                    this.word = this.Bt.entropyToMnemonic(wordAccount.msg.crypto.privateKey);
                    this.wordPri = this.Bt.ethereumCreatePri(this.word);
                    this.wordKetStore = this.Bt.create(3, this.password, this.wordPri).msg.toJson();

                }else{
                    this.load.tipErrorShow(this.translate.instant('Login.keyStoreError'));
                    return
                }
            }

            if(this.config.type == "mnemonic"){
                let word = this.type == 'mnemonic' ? this.word : null;
                let data = {
                    type: 'mnemonic',
                    data: word
                }
                this.settingService.set(data);
            }else if(this.config.type == "privateKey"){
                let privateKey = this.type == 'key' ? account.msg.crypto.privateKey : this.wordPri ;
                let data = {
                    type: 'privateKey',
                    data: privateKey
                }
                this.settingService.set(data);
            }else if(this.config.type == "keyStore"){
                let newKeyStore = this.type == 'key' ? keyStore : this.wordKetStore;
                let userName = this.user.getItem('user_login_keystore')
                let name = JSON.parse(userName).name + '_' + JSON.parse(newKeyStore).public_key + '_keystroe';
                this.download(name, newKeyStore);
            }else if(this.config.type == "change"){
                let privateKey = this.type == 'key' ? account.msg.crypto.privateKey : this.wordPri ;
                this.changePri = privateKey;
                this.changeAlert = true;
                this.changePassword(3, privateKey);
            }
            if(this.config.type != "change"){
                this.close();
            }
        }
    }
    dowLoadKeyStore(){
        this.changePassword(3, this.changePri, true);
        this.close();
    }

    /**
     * 重置密码
     * @param type
     * @param privateKey
     * @param isdownKeyDown
     */
    changePassword(type, privateKey, isdownKeyDown?){
        let account = this.Bt.resetPassword(type, this.newPassword1, privateKey).msg;
        let userName = this.user.getItem('user_login_keystore')
        let name = JSON.parse(userName).name + '_' + account.crypto.publicKey + '_keystroe'
        isdownKeyDown && this.download(name, account.toJson());
        let acc = JSON.parse(this.user.getItem('user_login_keystore'));
        if(this.type == 'key'){
            acc.keyStore = JSON.parse(account.toJson());
        }else if(this.type == 'mnemonic'){
            let wordPrivate = this.Bt.mnemonicToEntropy(this.word);
            let wordAccount = this.Bt.resetPassword(type, this.newPassword1, wordPrivate).msg;
            acc.keyStore = JSON.parse(wordAccount.toJson());
        }

        this.user.resetLocalOneKey(acc);
        this.user.setItem('user_login_keystore', JSON.stringify(acc))
        this.config.type == "change" && this.config.callback();
    }

    /**
     * 下载文件
     * @param filename
     * @param text
     */
    download(filename: string, text: string) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        // if(this.config.type == "change"){
        //     this.router.navigateByUrl('/user/login');
        // }


    }

    /**
     * 判断密码强度
     */
    passwordL(){
        this.passwordSecurity = this.reg.verificationPassword(this.newPassword1);
        this.setPasswordColor();
    }

    /**
     * 初始化密码强度条颜色
     */
    resPasswordTotal(){
        this.passwordTotalStrength = [
            {status:''},
            {status:''},
            {status:''},
            {status:''}
        ]
    }

    /**
     * 设置密码强度条颜色
     */
    setPasswordColor(){
        this.resPasswordTotal();
        for(let i=0; i<this.passwordTotalStrength.length; i++){
            if(i == 0 && this.passwordSecurity >= 0){ this.passwordTotalStrength[i].status = 'passwordColor0'}
            if(i == 1 && this.passwordSecurity >= 2){ this.passwordTotalStrength[i].status = 'passwordColor0'}
            if(i == 2 && this.passwordSecurity >= 3){ this.passwordTotalStrength[i].status = 'passwordColor1'}
            if(i == 3 && this.passwordSecurity >= 4){ this.passwordTotalStrength[i].status = 'passwordColor2'}
        }
    }

    close(){
        let _this = this;
        this.fadeFlag = 'fadeOut';
        setTimeout(function(){
            _this.onDialogClose();
        },250)//小于300
    }

    changeWaring(type,flag){
        this[type] = flag;
    }

}
