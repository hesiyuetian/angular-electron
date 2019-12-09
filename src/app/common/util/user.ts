// import {Storage} from './localStorage'
import { secret } from './secret';
import { AuxBtService } from '../../service/aux-bt.service';
const secre = new secret();
export class User {
    keyStoreName = 'user_key_store';
    constructor(
    ){
    }
    setItemSession(key:string, value:any){
        window.sessionStorage[key] = value;
    }
    getItemSession(key:string) {
        return window.sessionStorage[key] == undefined ? '' : window.sessionStorage[key];
    }

    // 加密obj
    setItemSessionCrypt(key:string, value:any){
        if(typeof value == "object") window.sessionStorage[key] = secre.encrypt(JSON.stringify(value));
        else window.sessionStorage[key] = secre.encrypt(value);
    }
    getItemSessionCrypt(key:string) {
        return window.sessionStorage[key] == undefined ? '' : secre.decrypt(window.sessionStorage[key]);
    }


    setItemSessionObj(key:string, value:any){
        window.sessionStorage[key] = JSON.stringify(value);
    }
    getItemSessionObj(key:string) {
        return JSON.parse(window.sessionStorage[key] || '{}')
    }


    setItem(key:string, value:any) {
        window.localStorage[key] = value;
    }
    getItem(key:string) {
        return window.localStorage[key] == undefined ? '' : window.localStorage[key];
    }
    // 加密obj
    setItemlocalCrypt(key:string, value:any){
        if(typeof value == "object") window.localStorage[key] = secre.encrypt(JSON.stringify(value))
        else window.localStorage[key] = secre.encrypt(value);
    }
    getItemlocalCrypt(key:string) {
        return window.localStorage[key] == undefined ? '' : secre.decrypt(window.localStorage[key]);
    }
    setObject(key:string, value:any) {

        // 处理登录返回数据的存储
        if(key === 'account'){
            value.userId = value.user;
            delete value.user;
        }

        try {
            window.localStorage[key] = JSON.stringify(value);
        } catch (e) {
            alert('本地储存写入错误，若为safari浏览器请关闭无痕模式浏览。');
        }
    }
    getObject(key:string) {
        return JSON.parse(window.localStorage[key] || '{}');
    }
    remove(key:string) {
        window.localStorage.removeItem(key);
    }


    login(){

    }

    // 刷新网页
    reload(){
        if(window.location.href.indexOf('/trade/') != -1){
            return window.location.reload()
        }else if(window.location.href.indexOf('/user/login') == -1){
            return window.location.href = window.location.origin + '/user/login' ;
        }
    }

    logout(){
        this.reload();
        const user = ['account', 'user_login_keystore', 'publicKey', 'account_sig'];
        for(let item of user){
            window.localStorage.removeItem(item);
        }
    }
    token(){
        return this.getObject('account') == undefined ? '' : this.getObject('account')['access_token'];
    }
    prime(){
        return this.getObject('account') == undefined ? '' : this.getObject('account')['is_prime'];
    }
    userId(){
        return this.getObject('account') == undefined ? '' : this.getObject('account')['userId'];
    }
    account(){
        return this.getObject('account') == undefined ? '' : this.getObject('account')['email'];
    }

    //缓存本地KEY_Store
    addLocalKey(data){
        let list = this.getItem(this.keyStoreName);
        let arr = [];
        if(list){
            arr = JSON.parse(this.getItem(this.keyStoreName))
            arr = arr.filter( ele => {
                return ele.address != data.address
            })
        }
        arr.push(data);
        this.setItem(this.keyStoreName, JSON.stringify(arr));
    }
    //修改密码后替换缓存中的keystore
    resetLocalOneKey(data){
        const name = data.name;
        const address = data.address
        const keyStore = data.keyStore;
        let list = JSON.parse(this.getItem(this.keyStoreName));
        for(let i of list){
            if((i.name == name)&& (i.address == address)){
                i.keyStore = keyStore;
                break;
            }
        }
        this.setItem(this.keyStoreName, JSON.stringify(list));
    }

    //储存私钥 + 时间催
    setPriDate(privateKey){
        let pri = privateKey +'-'+ new Date().getTime();
        this.setItem('account_sig', secre.encrypt(pri));
    }


    // tradingView 清除
    clearTV(){
        const tv = [
            'tvxwevents.setting',
            'tradingview.chartType',
            'tradingview.BarsMarksContainer.visibile',
            'tradingview.ChartFavoriteDrawingToolbarWidget.visible',
            'tradingview.ChartSideToolbarWidget.visible',
            'tradingview.NavigationButtons.visibility',
            'tradingview.chartproperties',
            'tradingview.symboledit.dialog_last_entry',
            'tvlocalstorage.available',
            'tvxwevents.settings'
        ];
        for(let item of tv){
            window.localStorage.removeItem(item);
        }
    }
}
