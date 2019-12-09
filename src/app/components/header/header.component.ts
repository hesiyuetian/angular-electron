import { Component, OnInit } from '@angular/core';
import { PlatformLocation} from '@angular/common';
import { User } from '../../common/util/user';
import { service } from '../../common/util/service';
import { SkinServiceService } from '../../service/skin-service.service';
import { Loadings } from '../../components/loadings/loadings'
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ScokeIoService } from '../../service/scoke-io.service';
import { AuxBtService } from '../../service/aux-bt.service';
import { regular } from '../../common/util/regular';
import { TranslateService } from "@ngx-translate/core";
import { FormatPipe } from '../../pipes/format.pipe';
import { CONFIG } from '../../common/util/config'
import { DialogController } from '../../controller/dialog'
import { MembersComponent } from '../members/members.component'
import {ConterAlertComponent} from '../alert/conter-alert/conter-alert.component';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
    theme: string = this.user.getItem('theme') || 'Light';
    logo: string = CONFIG.logo || "./assets/images/logo-main.svg";
    logoHome: string = CONFIG.logo || "./assets/images/bithumb.svg";
    routerLink: string = this.location.pathname;
    language: string;
    shouLanguage: boolean;
    userInfoStatus: boolean = false;
    setuser: boolean;
    defaultSymbol: any;

    headList: Array<any> = ['/user/login','/user/unlock','/user/create_wallet'];
    headHidden: boolean = true;

    accountInfo: any = {
        name: '',
        address: '',
    };
    routerUrl: any;

    // 获取用户信息标志
    getUserScourceFlag: boolean = true;
    xtarScource = {
        cpu: {},
        net: {},
        ram: {},
    };
    cpuFlex = 0;
    netFlex = 0;
    ramFlex = 0;

    time: string = new FormatPipe().transform(new Date(), 2);
    date: number = new Date().getTime();


    // 界面模式  traditional ： 传统模式      tile ： 平铺模式
    public modeSel: string = 'tile' ;

    specialList: Array<any> = ['/user/create_wallet','/user/unlock','/user/login'];
    specialFlag: boolean = false;
    constructor(
        private location: PlatformLocation,
        private router: Router,
        public user: User,
        private skin: SkinServiceService,
        private service: service,
        private load: Loadings,
        private activatedRouter: ActivatedRoute,
        private socket: ScokeIoService,
        public reg: regular,
        public translate: TranslateService,
        public auxBt: AuxBtService,
        public dialog: DialogController,
    ) {
        this.router.events.subscribe( (event) => {
            if(event instanceof NavigationEnd){
                this.routerLink = this.location.pathname;
                this.headHidden = this.headList.indexOf(this.location.pathname) != -1 ? false : true;
                this.routerUrl = this.location.pathname == '/' || this.location.pathname.indexOf('/home') != -1 || this.location.pathname == '/home'  ? 'main' : this.location.pathname;

                if(this.specialList.indexOf(event.url) != -1 || event.url.indexOf('/user/login') != -1) this.specialFlag = true;
                else this.specialFlag = false;
                this.getUserScource();
            }
        });

        this.skin.getLangObservable().subscribe((res)=>{
            this.language = (this.user.getItem('language') == 'zh') ? 'CN' : 'EN' ;
        })

    }

    ngOnInit() {
        this.init();
        // this.registerPrime()
    }

    init(){
        this.language = (this.user.getItem('language') == 'zh') ? 'CN' : 'EN' ;
        this.resetDate();
    }

    /**
     * 获取用户信息
     */
    getUserScource(){
        if(this.user.token() && this.getUserScourceFlag) {
            this.getAccountInfo();
            this.getBtScource();
            this.getUserScourceFlag = false;
        }
    }

    /**
     * 获取Xtar资源
     */
    getBtScource(){
        this.auxBt.getBtScource().then( res =>{
            res.ram.totalRam = this.reg.toPlus((res.ram.totalReserved || 0), (res.ram.totalUsed || 0));
            this.cpuFlex = Number(this.reg.toDividedBy((res.cpu.usableCpu || 0), (res.cpu.totalCpu || 0), 4)) * 100 || 0;
            this.netFlex = Number(this.reg.toDividedBy((res.net.usableNet || 0), (res.net.totalNet || 0), 4)) * 100 || 0;
            this.ramFlex = Number(this.reg.toDividedBy((res.ram.totalReserved || 0), (res.ram.totalRam || 0), 4)) * 100 || 0;
            this.xtarScource  = res;
        });
    }

    /**
     * 获取账户信息
     */
    getAccountInfo(){
        this.accountInfo =  this.user.getObject('user_login_keystore');
    }

    /**
     * 切换激活状态
     * @param active
     * @param path
     * @param event
     */
    activated(active: string, path: string, event: any) {
        this.defaultSymbol = this.user.getItem('defaultSymbol') || 'RNT_ETH';  //'RNT_ETH'
        if(path === '/trade/') path = `${path}${this.defaultSymbol}`
        this.routerLink = path;

        this.router.navigateByUrl(path);

        event.stopPropagation();
    }

    /**
     * 切换中英文
     * @param language
     */
    setLanguage(language){
        this.shouLanguage = false;
        this.language = language == 'zh' ? 'CN' : 'EN' ;
        this.skin.setLang(language);
    }

    setLanguages(step, type){
        if(step == 'language'){ this.shouLanguage = type; }
        else if(step == 'userInfo'){
            if(Object.keys(this.accountInfo).length < 1) return this.user.logout();
            this.userInfoStatus = type;
        }
    }

    setUser(type){
        this.setuser = type;
    }

    logOut(){
        this.userInfoStatus = false;
        this.user.logout();
    }
    link(active){
        if(active == 'setting'){ this.userInfoStatus = false; }
        let param = window.location.pathname;
        if(active === '/user/login' && param.indexOf('/trade/') != -1) active = `${active}?forward=${param}`
        this.router.navigateByUrl(active);
        this.userInfoStatus = false;
    }
    copyAddress(address){
        this.reg.copyTextToClipboard(address);
        this.load.tipSuccessShow(this.translate.instant('common.copyAdress'))
    }

    /**
     * 切换UI展示模式   切换主题
     * @param type
     * @param val
     */
    changeMode(type, val){
        if(type === 'modeSel'){
            if(this.routerUrl.indexOf('/trade/') !== -1){
                this.modeSel = val;
                this.socket.setMode(val);
            }
        }else{
            this.theme = val;
            this.skin.set(val)
        }
    }

    /**
     * resetDate
     */
    resetDate(){
        this.service.timestamp().then( (res:any) => {
            if(res.status === 0) {
                this.date = res.data;
                this.time = new FormatPipe().transform(new FormatPipe().transform(this.date, 3), 2);
                this.getDate();
            }
        })
    }

    registerPrime(): void{
        const config = {};
        this.dialog.createFromComponent(MembersComponent,config);
    }

    /**
     * getDate
     */
    getDate(){
        setInterval(() => { this.date+= 60000 ;  this.time = new FormatPipe().transform(this.date, 2) }, 60000);
    }
}
