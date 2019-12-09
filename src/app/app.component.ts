import { Component, ViewContainerRef} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {DialogController} from './controller/dialog';
import {SkinServiceService} from './service/skin-service.service';
import {ScokeIoService} from './service/scoke-io.service';
import { User } from './common/util/user';
import { resetData } from './common/util/resetData';
import { Router, NavigationEnd } from '@angular/router';
// const environment = require('./common/util/environment.json');
declare var $;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss','./skin.scss']
})
export class AppComponent {
    // 界面模式  traditional ： 传统模式      tile ： 平铺模式
    public modeSel: string = 'tile' ;
    // 界面模式是否是tile ： 平铺模式
    public isMode: boolean = false ;

    theme: string = 'Light';
    lang: string;
    routerAddress: number = 0;

    //当前路由地址
    routerUrl: any = '/home';

    isDisFlag: boolean = false;
    scrollTop: number = 0;

    specialList: Array<any> = ['/user/create_wallet','/user/unlock','/user/login', '/member'];
    specialFlag: boolean = false;
    constructor(
        private router: Router,
        private reset: resetData,
        public translate:TranslateService,
        public viewContainerRef: ViewContainerRef,
        private dialogCtrl: DialogController,
        private skin: SkinServiceService,
        private user: User,
        private scoke: ScokeIoService,

    ){
        this.router.events.subscribe( (event) => {
            if(event instanceof NavigationEnd){
                this.isMode = false;
                if(event.url.indexOf('/trade/') == -1) this.isDisFlag = false;
                // 新增 - 路由首页：修改样式（head，foot颜色，主体宽度）
                this.routerUrl = event.url == '/' ? '/home' : event.url;

                if(this.specialList.indexOf(event.url) != -1 || event.url.indexOf('/user/login') != -1) this.specialFlag = true;
                else this.specialFlag = false;

                if(this.routerUrl.indexOf('/trade/') != -1 && this.modeSel === 'tile') this.isMode = true;
                else this.isMode = false;
            }
        });

        this.scoke.getModeObservable().subscribe( res => {
            this.modeSel = res;
            if(this.routerUrl.indexOf('/trade/') != -1 && res === 'tile') this.isMode = true;
            else this.isMode = false;
        });

        window['viewContainerRef'] = this.viewContainerRef
        this.dialogCtrl.setViewContainerRef(this.viewContainerRef)
        //添加语言支持
        translate.addLangs(["en", "zh"]);

        this.translate.setDefaultLang('en');
        this.translate.use('en');

        this.changeLang();
        this.resetTheme();
        this.init();

    }

    ngOnInit(){
        this.scoke.onCenten(false);
    }

    init(){
        this.lang = this.user.getItem('language') == 'zh' ? this.user.getItem('language') : 'en';
        this.translate.use(this.lang);
        setTimeout( _ => {
            this.skin.setLang(this.lang);
        },300)
    }

    /**
     * 订阅语言
     */
    changeLang(){
        this.skin.getLangObservable().subscribe( res => {
            this.translate.use(res);
        })
    }

    // 初始化皮肤
    resetTheme(){
        // if(!this.user.getItem('theme')){
            this.user.setItem('theme','Light')
        // }
        const theme = this.user.getItem('theme');
        this.theme = theme;
        this.skin.set(theme);
    }

}
