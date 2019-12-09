import {Component, OnInit, ElementRef, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute, NavigationEnd} from '@angular/router';
import {service} from '../../../common/util/service';
import {Loadings} from '../../../components/loadings/loadings';
import {User} from '../../../common/util/user';
import {regular} from '../../../common/util/regular';

import {BtService} from '../../../common/util/bt.service';
import {SkinServiceService} from '../../../service/skin-service.service';
import {TranslateService} from '@ngx-translate/core';
import {AuxBtService} from '../../../service/aux-bt.service';
import {Subscription} from 'rxjs';


@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    account: any;
    pwd: any;
    isLogin: boolean = true;

    userList: Array<any>;
    userListStatus: boolean = false;
    nameFocusS: boolean = false;
    passwordFocusS: boolean = false;
    address: any;
    password: any;
    passwordType1: any = 'password';

    publicKey: any;
    privateKey: any;

    shouLanguage: boolean;
    language: string;
    //删除用户弹窗状态
    closeAlertStatus: boolean = false;
    closeAddress: any;
    closeName: any;

    constructor(
        private router: Router,
        private service: service,
        private load: Loadings,
        private user: User,
        public regular: regular,
        public Bt: BtService,
        private el: ElementRef,
        private skin: SkinServiceService,
        public auxBt: AuxBtService,
        public translate: TranslateService
    ) {
        document.onkeydown = (event) => {
            var e: any = event || window.event;
            if (e.keyCode == 13) {
                if (this.userList && this.userList.length > 0 && this.address && this.password) {
                    document.getElementById('login').click();
                }
            }
        };
    }

    ngOnInit() {
        this.subThemeServe();
        this.getLastUser();
        this.user.logout();
        this.getKeyStore();
        this.SimulatedLogin();
        this.language = (this.user.getItem('language') == 'zh') ? 'CN' : 'EN';
        setTimeout(() => {
            this.regular.setTitle(this.translate.instant('Title.login'));
        });
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅theme服务
     */
    subThemeServe(): void {
        this.subServe.add(this.skin.getLangObservable().subscribe((res) => {
            this.language = (this.user.getItem('language') == 'zh') ? 'CN' : 'EN';
            this.regular.setTitle(this.translate.instant('Title.login'));
        }));
    }


    SimulatedLogin() {
        if (!!this.user.getItem('SimulatedLogin')) {
            this.address = this.user.getItem('last_login');
            this.password = this.user.getItem('SimulatedLogin');
            this.login();
        }
    }

    /**
     * 获取上一次登陆的账号
     */
    getLastUser() {
        let u = this.user.getItem('last_login');
        if (u) {
            this.address = u;
            this.putStatue('name', true);
        }
    }

    passwordIsShow(type) {
        this.passwordType1 = this.passwordType1 == 'password' ? 'text' : 'password';
    }

    /**
     * 获取hash
     * @param name
     */
    getUrlParam(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
        var result = window.location.search.substr(1).match(reg);
        return result ? decodeURIComponent(result[2]) : null;
    }

    login() {
        let keyStore;
        let uName = this.address.split('/')[0];
        let accountA = this.address.split('/')[1];
        let userLoginKey;
        for (let i of this.userList) {
            if ((i.address == accountA) && (i.name == uName)) {
                keyStore = JSON.stringify(i.keyStore);
                userLoginKey = i;
                break;
            }
        }
        if (keyStore) {
            let account: any = this.Bt.load(keyStore, this.password);
            if (account.status == 0) {
                if (userLoginKey.type == 'key') {
                    this.publicKey = userLoginKey.keyStore.public_key;
                    this.privateKey = account.msg.crypto.privateKey;
                } else if (userLoginKey.type == 'mnemonic') {
                    let wordHax = account.msg.crypto.privateKey;
                    let word = this.Bt.entropyToMnemonic(wordHax);
                    let pri = this.Bt.ethereumCreatePri(word);
                    let acc = this.Bt.priToaddress(pri);
                    this.publicKey = acc.publicKey;
                    this.privateKey = pri;
                }

                this.user.setItem('user_login_keystore', JSON.stringify(userLoginKey));
                this.user.setItem('last_login', this.address);
                this.user.setItemlocalCrypt('publicKey', this.publicKey);
                this.auxBt.privateKey = this.privateKey;

                this.service.newLogin({user: accountA}).then((res: any) => {
                    if (res.status == 0) {
                        let defaultSymbol = '/trade/' + this.user.getItem('defaultSymbol') || '/';
                        this.user.setObject('account', res.data);
                        let forward = this.getUrlParam('forward');
                        if (forward) {
                            this.router.navigateByUrl(forward);
                        } else {
                            this.router.navigateByUrl(defaultSymbol);
                        }
                    } else {
                        this.load.tipErrorShow(res.msg);
                    }
                });
            } else {
                this.load.tipErrorShow(this.translate.instant('Login.keyStoreError'));
            }
        } else {
            this.load.tipErrorShow(this.translate.instant('Login.keyStorefail'));
        }
    }


    link(path) {
        this.router.navigateByUrl(path);
    }

    /**
     * 获取本地keyStore
     */
    getKeyStore() {
        let list = this.user.getItem('user_key_store');
        if (list) {
            this.userList = JSON.parse(list);
        } else {
            this.userList = [];
        }
    }

    /**
     * 输入框动画
     * @param type
     * @param status
     */
    putStatue(type, status) {
        if (type == 'span') {
            let dom: any = document.getElementsByClassName('put-focus');
            dom[status].focus();
        } else {
            if (type == 'name') {
                this.nameFocusS = this.address ? true : status;
            } else if (type == 'password') {
                this.passwordFocusS = this.password ? true : status;
            }
        }
    }

    //
    enterValue(type, value?) {
    }

    /**
     * 选择用户列表
     * @param type
     */
    selectUser(type) {
        this.userListStatus = type;
    }

    /**
     * 选中
     * @param name
     * @param address
     */
    selectaddress(name, address) {
        this.address = name + '/' + address;
        this.putStatue('name', true);
        this.selectUser(false);
    }

    /**
     * 删除本地用户
     * @param type
     * @param address
     * @param name
     */
    deleteUser(type, address, name) {
        if (type == 1) {
            this.closeAlertStatus = true;
            this.closeAddress = address;
            this.closeName = name;
        } else if (type == 2) {
            if (this.userList) {
                for (let i = 0; i < this.userList.length; i++) {
                    if ((this.userList[i].address == address) && (this.userList[i].name == name)) {
                        this.userList.splice(i, 1);
                        break;
                    }
                }
                if (this.address === (name + '/' + address)) {
                    this.user.remove('last_login');
                    this.nameFocusS = false;
                    this.address = '';
                }
                this.user.setItem('user_key_store', JSON.stringify(this.userList));
                this.closeAlert();
            }
        }
    }

    /**
     * 切换中英文
     * @param language
     */
    setLanguage(language) {
        this.shouLanguage = false;
        this.language = language == 'zh' ? 'CN' : 'EN';
        this.skin.setLang(language);
    }

    setLanguages(type) {
        this.shouLanguage = type;
    }

    closeAlert() {
        this.closeAlertStatus = false;
    }

}
