import { Component, OnInit, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import { BtService } from '../../../common/util/bt.service';
import { User } from '../../../common/util/user';
import { service } from '../../../common/util/service';
import { Loadings } from '../../../components/loadings/loadings';
import { regular } from '../../../common/util/regular';
import { TranslateService } from '@ngx-translate/core';
import {AuxBtService} from '../../../service/aux-bt.service';
import fileSaver from 'file-saver'

@Component({
  selector: 'app-unlock',
  templateUrl: './unlock.component.html',
  styleUrls: ['./unlock.component.scss']
})
export class UnlockComponent implements OnInit {
    //
    step: any = "k1";
    //用户名
    userName: string;
    //密码
    password1: string;
    //确认密码
    password2: string;
    //密码隐藏/显示
    passwordType1: string = 'password';
    passwordType2: string = 'password';
    //密码输入框图标状态
    passwordStatus1: number = 0;
    passwordStatus2: number = 0;
    //按钮状态
    btnZ1: number = 0;

    btnK1: number = 0;
    //上传文件
    fileName: any;
    files: any;
    deleteFileStatus: any = 1;

    //上传文件状态
    filesStatus: number = 0;

    //密钥库文件: 输入框
    secretTxt1: any;

    account: any;
    unreally_account: any;

    userNameFocusS: boolean = false;
    password1FocusS: boolean = false;
    password2FocusS: boolean = false;

    //密码强度
    passwordTotalStrength: Array<any> = [
        { status: '' },
        { status: '' },
        { status: '' },
        { status: '' }
    ];
    //密码安全度
    passwordSecurity: any = -1;

    privateKey: any;


    /**** reset *****/
    // 助记词列表
    mnemonicList: Array<any> = [ ];

    // 助记词列表下标
    mnemonicIndex: number = null;

    // 输入的助记词
    mnemonicVlaue: string = '';

    // 下载助记词弹框
    isDownloadKerstore: boolean = false;

    // keystore step
    keystoreStep:string = 'N01';

    constructor(
        private router: Router,
        private el: ElementRef,
        public xtar: BtService,
        private user: User,
        private service: service,
        private load: Loadings,
        private reg: regular,
        public auxBt: AuxBtService,
        private translate: TranslateService,
    ) { }

    ngOnInit() {
        this.init();
    }
    init(){
        this.select('k1')
    }

    /**
     * 切换解锁方式
     * @param step
     */
    select(step: any){
        this.step = step;
        this.initInfo();
        if(step == 'k1'){
            this.keyDrop();
        }
    }

    /**
     * removeMnemonic
     * @param index
     */
    removeMnemonic(index): void{
        this.mnemonicList.splice(index,1)
    }

    /**
     * clearMnemonic
     */
    clearMnemonic(): void{
        this.mnemonicList = []
    }

    /**
     * inputMnemonic
     * @param event
     */
    inputMnemonic(event:any): void{
        if(this.mnemonicList.length >= 15){
            this.mnemonicVlaue = '';
            return
        }
        let inputKeyCode = (event && event.keyCode) || '';
        if(this.mnemonicVlaue.split(" ").length < 15){
            this.mnemonicVlaue = this.reg.stringAKong(this.mnemonicVlaue);
            if (inputKeyCode == 13 || inputKeyCode == 32) {
                let str = this.mnemonicVlaue.replace(/\s*/g,"");
                if(str.length != 0) this.mnemonicList.push(str);
                this.mnemonicVlaue = '';
            }
        }else if (inputKeyCode == 13 || inputKeyCode == 32) {
            this.mnemonicList = this.mnemonicVlaue.split(" ").filter(ele => {
                return ele != ''
            });
            this.mnemonicVlaue = '';
        }
    }

    /**
     * inputMnemonicBlur
     */
    inputMnemonicBlur(): void{
        if(this.mnemonicVlaue.split(" ").length == 15){
            this.mnemonicList = this.mnemonicVlaue.split(" ");
            this.mnemonicVlaue = '';
        }
    }

    /**
     * checknemonics
     */
    checknemonics(): void{
        if(!this.xtar.validateMnemonic(this.mnemonicList.join(' '))){
            return this.load.tipErrorShow(this.translate.instant('unlock.errorTip3'))
        }else{
            this.step = "z2";
        }
    }

    /**
     * 上传文件(事件代替)
     */
    upload(): void{
        this.deleteFIle();
        this.el.nativeElement.querySelector('#upload').click();
    }

    /**
     * addFile
     * @param event
     */
    addFile(event: any): void{
        let fil = event.target.files[0];
        this.deleteFileStatus = 0;
        if(fil.size){
            this.keystoreStep = "N02";
            let reader: any = new FileReader();
            reader.readAsText(fil, "UTF-8");
            reader.onload = (e)=>{
                this.fileName = this.setFileName(fil.name);
                if(this.deleteFileStatus == 0){
                    this.files = e.target.result;
                }
                this.filesStatus = 1;
                this.unlockBtn();
            };
        }
    }

    /**
     * keyStore拖拽文件
     */
    keyDrop(){
        let _this = this;
        setTimeout(()=>{
            document.ondrop = function(e){
                e.preventDefault();
                drops(e);
            };
            document.ondragover = function(e){
                e.preventDefault();
            };
            let drops = function(e){
                // 得到拖拽过来的文件
                var dataFile = e.dataTransfer.files[0];
                _this.fileName = _this.setFileName(dataFile.name);
                // FileReader实例化
                var fr = new FileReader();
                // 异步读取文件
                fr.readAsText(dataFile);
                // 读取完毕之后执行
                fr.onload = function(){
                    // 获取得到的结果
                    let data:any = fr.result;
                    _this.keystoreStep = "N02";
                    try{
                        let keyStore = JSON.parse(data);
                        _this.deleteFileStatus = 0;
                        _this.files = fr.result;
                    }
                    catch{
                        _this.deleteFileStatus = 2;
                        _this.files = null;
                    }
                    _this.unlockBtn();
                }
            }

        }, 100);
    }

    /**
     * 上传文件名过长，中间显示省略号
     * @param name
     */
    setFileName(name){
        let newName = '';
        if(name.length >= 60){
            newName = name.slice(0, 24) + '...' + name.slice(name.length-20, name.length);
        }else{
            newName = name;
        }
        return newName;
    }

    /**
     * deleteFIle
     */
    deleteFIle(): void{
        try {
            this.fileName = '';
            this.files = '';
            this.el.nativeElement.querySelector('#upload').value = '';
        } catch (e) { }
    }

    /**
     * clearKeystore
     */
    clearKeystore(): void{
        if(this.keystoreStep === 'N03'){
            this.secretTxt1 = '';
            this.keystoreStep = 'N01'
        }else{
            this.keystoreStep = "N01";
            this.deleteFIle()
        }
    }

    /**
     * 解锁
     */
    unlock(){
        if(this.step == 'k1'){
            if(this.keystoreStep == "N02") { this.account = this.xtar.load(this.files, this.password1); }
            else if(this.keystoreStep == "N03") { this.account = this.xtar.load(this.secretTxt1, this.password1); }
            if(this.account && this.account.status && this.account.status != 0){
                this.load.tipErrorShow(this.translate.instant('Login.keyStoreError'));
                return
            }
        }else if(this.step == 'z2'){
            //助记词解锁
            let mnemonicEntropy = this.xtar.mnemonicToEntropy(this.mnemonicList.join(' '));
            this.account = this.xtar.create(2, this.password1, this.mnemonicList.join(' '));
            this.unreally_account = this.xtar.create(3, this.password1, mnemonicEntropy);
        }
        this.privateKey = this.account.msg.crypto.privateKey;
        let keyStore;
        let unreally;

        if(this.files){ keyStore = this.files } // 拖拽文件解锁
        else if(this.secretTxt1){ keyStore = this.secretTxt1 } // 输入keyStore解锁
        else if(this.mnemonicList.join(' ')){   // 助记词解锁
            keyStore = this.account.msg.toJson();
            unreally = this.unreally_account.msg.toJson();
        }

        let account = {
            name: this.userName,
            type: '',
            address: JSON.parse(keyStore).address,
            keyStore: '',
        };

        if(keyStore){
            if(this.step == 'k1'){
                account.type = 'key';
                account.keyStore = JSON.parse(keyStore);
            }else if(this.step == 'z2'){
                account.type = 'mnemonic';
                account.keyStore = JSON.parse(unreally);
            }
        }
        if((this.account && this.account.status == 0) || (this.unreally_account && this.unreally_account.status == 0)){
            this.user.addLocalKey(account);
            this.user.setItem('user_login_keystore', JSON.stringify(account));
            this.user.setItemlocalCrypt('publicKey', this.account.msg.crypto.publicKey);
            this.auxBt.privateKey = this.privateKey;
            const name = `${this.userName}/${account.address}`;
            if(this.step == 'z2') this.downKeystore(name, JSON.stringify(account.keyStore));
            this.login(name);
        }
    }

    /**
     * downKeystore
     * @param name
     */
    downKeystore(name, account): void{
        var blob = new Blob([account], {type: "text/plain;charset=utf-8"});
        fileSaver.saveAs(blob, `${name}_keystroe.json`);
        this.login(name);
    }

    /**
     * 登录
     * @param name
     */
    login(name){
        this.load.loadingShow();
        this.service.newLogin({user: this.account.msg.address}).then((res: any)=>{
            this.load.hide();
            if(res.status == 0){
                let defaultSymbol = '/trade/' + this.user.getItem('defaultSymbol') || '/';
                this.user.setObject('account',res.data);
                this.user.setItem('last_login', name);
                let forward = this.getUrlParam('forward');
                if(forward) this.router.navigateByUrl(forward);
                else this.router.navigateByUrl(defaultSymbol)
            }else{
                this.load.tipErrorShow(res.msg);
            }
        })
    }

    /**
     * 获取hash
     * @param name
     */
    getUrlParam(name){
        var reg=new RegExp('(^|&)'+name+'=([^&]*)(&|$)');
        var result=window.location.search.substr(1).match(reg);
        return result ? decodeURIComponent(result[2]):null;
    }

    /**
     * 解锁按钮状态管理
     */
    unlockBtn(){
        if(this.step == 'z2'){    // 助记词填写用户名密码状态
            if(this.password1 && this.password1.length >= 8 && this.passwordSecurity >=3 && this.password2 && (this.password1 === this.password2) && this.userName && this.userName.length >= 5){
                this.btnZ1 = 1;
            }else{ this.btnZ1 = 0; }
        }else if(this.step == 'k1'){    // 上传/输出keyStore按钮状态
            if(this.keystoreStep == "N02"){
                if(this.files && this.password1 && this.password1.length >= 8 && this.userName && this.userName.length >= 5 && this.deleteFileStatus == 0){ this.btnK1 = 1; }
                else{ this.btnK1 = 0; }
            }else if(this.keystoreStep == "N03"){
                if(this.secretTxt1 && this.password1 && this.password1.length >= 8 && this.userName && this.userName.length >= 5){ this.btnK1 = 1; }
                else{ this.btnK1 = 0; }
            }
        }
    }

    /**
     * 初始化基本信息
     */
    initInfo(){
        let file = this.el.nativeElement.querySelector('#upload');
        if(file && file.value){ file.value = ''; }
        this.userName = '';
        this.password1 = '';
        this.password2 = '';
        this.passwordType1 = 'password';
        this.passwordType2  = 'password';
        this.passwordStatus1 = 0;
        this.passwordStatus2 = 0;
        this.btnZ1 = 0;

        this.btnK1 = 0;
        this.fileName = '';
        this.files = '';
        this.deleteFileStatus = 1;
        this.filesStatus = 0;
        //助记词
        this.secretTxt1 = '';
        this.userNameFocusS = false;
        this.password1FocusS = false;
        this.passwordSecurity = -1;

        this.mnemonicList = [];
        this.mnemonicIndex = null;
        this.mnemonicVlaue = '';
        this.isDownloadKerstore = false;
        this.keystoreStep = 'N01';
    }

    /**
     * 隐藏/显示密码
     * @param type
     */
    passwordIsShow(type: any){
        if(type == 'passwordType1'){
            this.passwordType1 = this.passwordType1 == 'password'? 'text' : 'password';
            this.passwordStatus1 = this.passwordStatus1 == 0 ? 1 : 0;
        }else if(type == 'passwordType2'){
            this.passwordType2 = this.passwordType2 == 'password'? 'text' : 'password';
            this.passwordStatus2 = this.passwordStatus2 == 0 ? 1 : 0;
        }
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
            if(type == 'userName'){ this.userNameFocusS = this.userName ? true : status }
            else if(type == 'password1'){ this.password1FocusS = this.password1 ? true : status }
            else if(type == 'password2'){ this.password2FocusS = this.password2 ? true : status }
        }
    }

    enterValue(type){
        if(type == 'userName'){
            this.userName = this.reg.stringAndNumber(this.userName);
        }
        else if(type == 'password1' && this.step == 'z2'){
            this.passwordSecurity = this.reg.verificationPassword(this.password1);
        }
    }
}

