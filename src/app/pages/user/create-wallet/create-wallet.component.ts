import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Loadings } from '../../../components/loadings/loadings';
import { User } from '../../../common/util/user';
import fileSaver from 'file-saver'
import { BtService } from '../../../common/util/bt.service';
import { service } from '../../../common/util/service';
import { regular } from '../../../common/util/regular';
import { TranslateService } from '@ngx-translate/core'
import { AuxBtService } from '../../../service/aux-bt.service'

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss']
})
export class CreateWalletComponent implements OnInit {
    //
    step: number = 1;

    //输入框 type类型
    passwordType1: string = 'password';
    passwordType2: string = 'password';
    //密码和确认密码
    password1: any;
    password2: any;
    //用户名
    userName: string;
    //密码强度
    passwordTotalStrength: Array<any> = [
        { status: '' },
        { status: '' },
        { status: '' },
        { status: '' }
    ];
    //密码安全度
    passwordSecurity: any = -1;

    //助记词-展示
    mnemonic2: any;
    mnemonicShow: Array<any> = [];
    mnemonicShowRand: Array<any> = [];
    mnemonicSelect: Array<any> = [];
    mnemonicIndex: number = null;

    //按钮状态
    stepBtn1: number = 0;

    //钱包信息
    privateEntropy: string;
    privateKey: string;
    publicKey: string;
    walletAddress: string;

    //输入框动画状态
    userNameFocusS: boolean = false;
    password1FocusS: boolean = false;
    password2FocusS: boolean = false;

    userLoginInfo: any;

    constructor(
        private router: Router,
        private load: Loadings,
        public user: User,
        public Bt: BtService,
        private service: service,
        private reg: regular,
        private translate: TranslateService,
        public auxBt: AuxBtService,
) { }

    ngOnInit() {
        this.init();
    }

    init(){
        this.createWord();
        this.setPasswordColor();
    }

    /**
     * 生成助记词 15位
     */
    createWord(){
        let word = this.Bt.bip39WordCreate();
        var veryList = word.split(' ').filter((ele, index, self) => {
            return self.indexOf(ele) !== index
        });
        if(veryList.length > 0) return this.init();
        this.mnemonic2 = word;
        this.mnemonicShow = this.mnemonic2.split(' ');
        this.wordToPri(word);
        this.zjlToEntropy(word);
    }

    /**
     * 助记词生成私钥
     * @param word
     */
    wordToPri(word){
        let pri = this.Bt.ethereumCreatePri(word);
        this.privateKey = pri;
        this.priToAddress(pri);
    }

    /**
     * 助记词生成熵
     * @param word
     */
    zjlToEntropy(word){
        this.privateEntropy = this.Bt.mnemonicToEntropy(word);
    }

    /**
     * 私钥生成钱包地址
     * @param pri
     */
    priToAddress(pri){
        let account = this.Bt.priToaddress(pri);
        this.walletAddress = account.address;
    }

    /**
     * 复制
     */
    copyWallet(){
        this.reg.copyTextToClipboard(this.walletAddress);
        this.load.tipSuccessShow(this.translate.instant('createWallet.copySuccess'));
    }

    /**
     * 判断密码强度
     */
    passwordL(){
        this.passwordSecurity = this.reg.verificationPassword(this.password1);
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
            if(i == 2 && this.passwordSecurity >= 3){ this.passwordTotalStrength[i].status = 'passwordColor1' }
            if(i == 3 && this.passwordSecurity >= 4){ this.passwordTotalStrength[i].status = 'passwordColor2' }
        }
    }

    /**
     * created account
     * @param step
     */
    createdAccount(){
        //根据临时密码生成keyStroe
        if( this.userName && this.password1 && this.password2){
            this.load.loadingShow();
            this.stepBtn1 = 0;
            setTimeout(()=>{
                let account = this.Bt.create(3, this.password1, this.privateKey).msg;
                this.publicKey = account.crypto.publicKey;
                let unreally_account = this.Bt.create(3, this.password1, this.privateEntropy).msg;
                this.userLoginInfo = {
                    name: this.userName,
                    address: this.walletAddress,
                    type: 'mnemonic',
                    keyStore: JSON.parse(unreally_account.toJson()),
                };
                let name = this.userName + '_' + this.walletAddress + '_keystroe';

                //添加到缓存
                this.user.setItem('last_login', `${this.userName}/${this.walletAddress}`);
                this.user.setItem('user_login_keystore', JSON.stringify(this.userLoginInfo));
                this.user.addLocalKey(this.userLoginInfo);

                this.download(name, account.toJson());
                this.resetMnemonic();
                this.step = 3;
                this.load.hide();
            },100)
        }
    }

    /**
     * nextStep
     * @param step
     */
    nextStep(step: any): void{
        if(step == 3) this.resetMnemonic();
        this.step = step;
    }

    /**
     * 登录
     */
    login(){
        this.load.loadingShow();
        this.auxBt.privateKey = this.privateKey;
        this.service.newLogin({user: this.walletAddress}).then((res: any)=>{
            this.load.hide();
            if(res.status == 0){
                let name = this.userName + '/' + this.walletAddress;
                this.user.setItem('last_login', name);
                this.user.setItemlocalCrypt('publicKey', this.publicKey);
                this.user.setObject('account',res.data);
                let defaultSymbol = '/trade/' + this.user.getItem('defaultSymbol') || '/';
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
     * 下载文件
     * @param filename
     * @param text
     */
    download(filename: string, text: string) {
        var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
        fileSaver.saveAs(blob, `${filename}.json`);
    }

    /**
     * 添加助记词
     * @param word
     * @param index
     */
    selectMnemonic(word: string, index: number): void{
        this.mnemonicIndex = null;
        this.mnemonicShowRand[index].s = true;
        this.mnemonicSelect.push(word);
    }

    /**
     * 验证助记词顺序是否正确
     */
    regMnemonic(): void{
        if(this.mnemonicSelect.join(',') != this.mnemonicShow.join(',')){
            this.load.tipErrorShow(this.translate.instant('createWallet.mnemonicError'));
        }else{
            this.login()
        }
    }

    /**
     * 删除助记词
     * @param word
     * @param index
     */
    removeMnemonic(word: string, index: number): void{
        const _index = this.mnemonicShowRand.findIndex(ele => {
            return ele.word === word
        });
        this.mnemonicShowRand[_index].s = false;
        this.mnemonicSelect.splice(index,1);
        if(this.mnemonicSelect.length < 1) this.mnemonicIndex = null
    }

    /**
     * goTo
     * @param path
     */
    goTo(path: string){
        this.router.navigateByUrl(path);
    }

    /**
     * 创建钱包第一步验证
     */
    verification(){
        if(this.password1 && this.password2 && (this.password1 === this.password2) && this.userName && this.userName.length >= 5 && this.passwordSecurity >= 3){
            this.stepBtn1 = 1;
        }else{
            this.stepBtn1 = 0;
        }
    }

    /**
     * 初始化 备份Mnemonic信息
     */
    resetMnemonic(): void{
        this.randomSequence();
        this.mnemonicSelect = [];
        this.mnemonicIndex = null;
    }

    /**
     * 隐藏/显示密码
     * @param type
     */
    passwordIsShow(type: any){
        if(type == 'passwordType1'){
            this.passwordType1 = this.passwordType1 == 'password'? 'text' : 'password';
        }else if(type == 'passwordType2'){
            this.passwordType2 = this.passwordType2 == 'password'? 'text' : 'password';
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
        else if(type == 'password1'){
            this.passwordL()
        }
    }

    /**
     * 随机打乱助记词顺序
     */
    randomSequence(){
        this.mnemonicShowRand = [];
        let mnemonicList = JSON.parse(JSON.stringify(this.mnemonicShow));
        mnemonicList.sort(function(){return Math.random()>0.5?-1:1;});
        for(let item of mnemonicList){
            this.mnemonicShowRand.push({word: item, s: false })
        }
    }

    /**
     * 复制助记词
     */
    mnemonicCopy(){
        this.reg.copyTextToClipboard(this.mnemonic2);
        this.load.tipSuccessShow(this.translate.instant('createWallet.copySuccess'))
    }

}
