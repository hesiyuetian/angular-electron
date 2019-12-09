import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';
import fileSaver from 'file-saver';
import {Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BtService} from '../common/util/bt.service';
import {User} from '../common/util/user';
import {Loadings} from '../components/loadings/loadings';
import {RpcClient} from 'bithumb-chain-ts-sdk';
import {regular} from '../common/util/regular';
import {DialogController} from '../controller/dialog';
import {TxComponent} from '../components/dev/tx/tx.component';
import {AssestComponent} from '../components/dev/assest/assest.component';
import {DialogPwdComponent} from '../components/dialog-pwd/dialog-pwd.component';
import { buildPaymentRequest, parsePaymentResponse } from '../common/util//payment'
import {CONFIG} from '../common/util/config';
import axios from 'axios'
import * as BT from 'bithumb-chain-ts-sdk';

interface xtarUtils {
    withdrawSig: Function;
    orderSign: any;
    getKeyStore: Object;
    getAccount: any;
    getPrivateAccount: any;
    loginSign: any;
}

interface loginKeystore {
    address: String;
    keyStore: any;
    name: String;
    type: String;
}

interface depositOption {
    payer: string,
    asset: string,
    from: string,
    to: string,
    value: string,
    payerTx: any,
    payerType: string
}

interface collectSignOption {
    pair: string,
    collect: boolean,
    sig: string
}

interface cancelOrderSignOption {
    ids: string,
    sig: string
}

interface orderSignOption {
    chain_id: number;
    pair: string;
    expire: number;
    channel: string;
    side: string;
    salt: number;
    price: string;
    amount: string;
    user: string;
    maker_fee_rate: number;
    taker_fee_rate: number;
}

interface PayerInfo {
    amount: number,
    tx: any
}

interface deoInterEventLog {
    hash: string,
    success: Function,
    error: Function,
}



class Query {
    public ramClient: any;
    public resStakeClient: any;
    public xtarClient: any;
    public xtar = new BtService();

    constructor(sdk: any) {
        this.ramClient = new BT.RAM(sdk);
        this.resStakeClient = new BT.Stake(sdk);
        // this.resStakeClient = new BT.Resource(sdk);
        this.xtarClient = new BT.BT(sdk);
    }

    // 获取BT资源方法
    async getCPUInfo(addr: string): Promise<any> {
        return this.resStakeClient.GetCPUInfo(addr);
    }

    async getNetInfo(addr: string): Promise<any> {
        return this.resStakeClient.GetNETInfo(addr);
    }

    async getDegInfo(addr: string): Promise<any> {
        return this.resStakeClient.GetDelegateInfo(addr);
    }

    async getRAMInfo(addr: string): Promise<any> {
        return this.ramClient.GetRamInfo(addr);
    }

    async getBTAmount(addr: string): Promise<any> {
        return this.xtarClient.BalanceOf(addr);
    }

    async getAllScource(addr: string): Promise<any> {
        return {
            cpu: JSON.parse(await this.getCPUInfo(addr)).UserCpuInfo,
            net: JSON.parse(await this.getNetInfo(addr)).UserNetInfo,
            ram: JSON.parse(await this.getRAMInfo(addr)).ramInfo,
        };
    }
}


@Injectable({providedIn: 'root'})
export class AuxBtService implements xtarUtils {
    public client: RpcClient;
    public expirTime: number = 30;
    public privateKey: string;

    /**
     * 注册域名
     */
    public primeBt: string = 'prime.bt';
    public inviter_name: string = CONFIG.inviter_name;
    public serviceIssuer: string = 'bithumb';
    public primeCli: any;

    /**
     * deoInterEventLog
     */
    private deo_time: any;

    constructor(
        public xtar: BtService,
        public user: User,
        public load: Loadings,
        public regular: regular,
        public dialog: DialogController,
        public translate: TranslateService,
    ) {
        this.initClient();
        // this.create(3,"Aa123456",'f02fc900a7eeb56d9fb9dc30605a942d2983f08def89450329bdfb5ce5aa9dfa')
    }

    initClient(): void{
        if (!this.client) {
            this.client = new BT.RpcClient([CONFIG.sdkUrl]);
        }

        /**
         * primeCli 会员
         */
        if (!this.primeCli) {
            this.primeCli = new BT.Prime(this.client);
        }
    }

    /**
     * 提现验签
     * @param option
     * @param password
     */
    withdrawSig(option: any, password?): any {
        let account;
        account = this.unluck(password);

        if (account) {
            try {
                const str = `amount=${option.amount}&asset=${option.asset}&extra=${option.extra}&fee=${option.fee}&from=${option.from}&salt=${option.salt}&to=${option.to}`;
                const signature = account.sign(BT.sha256String(str)).serialize();
                return signature
            } catch {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
    }

    /**
     * deposit Payer
     * @param option
     */
    async depositPayer(option: depositOption): Promise<any>{
        let tx:any = BT.Dex.CreateDepositTx(option.payer, option.asset, option.from, option.to, option.value);
        let obj:any = {
            amount: 0,
            tx
        };
        if(option.payerType === 'proxy'){
            obj = await this.handlePayer(tx, option.from);
        }
        return obj
    }

    /**
     * 充值
     * @param option
     * @param password
     */
    async deposit(tx, password?) {
        let account, result: any;
        if (password) {
            account = this.getAccount(password);
        } else {
            account = this.getPrivateAccount();
        }

        if (account) {
            try {
                account.signTx(tx);
                result = this.client.SendRawTransaction(tx.serialize());
            } catch {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
        return result;
    }

    /**
     * 交易签名
     * @param option
     * @param password
     */
    orderSign(option: orderSignOption, password?): any {
        let account: any;
        account = this.unluck(password);
        if (account) {
            try {
                const str = `amount=${option.amount}&chain_id=${option.chain_id}&channel=${option.channel}&expire=${option.expire}&maker_fee_rate=${option.maker_fee_rate}&pair=${option.pair}&price=${option.price}&salt=${option.salt}&side=${option.side}&taker_fee_rate=${option.taker_fee_rate}&user=${account.address}`;
                const signature = account.sign(BT.sha256String(str)).serialize();
                return signature
            } catch (e) {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
    }

    /**
     * 登录签名
     * @param time
     * @param user
     * @param channel
     * @param password
     */
    loginSign(time: string, user: string, channel, password?): any {
        let account: any;
        account = this.unluck(password);
        if (account) {
            try {
                const str = `channel=${channel}&timestamp=${time}&user=${user}`;
                const signature = account.sign(BT.sha256String(str)).serialize();
                return signature;
            } catch {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
    }

    /**
     * 收藏签名
     * @param params
     * @param password
     */
    collectSign(params: collectSignOption, password?): any {
        let account: any;
        account = this.unluck(password);
        if (account) {
            try {
                const str = `collect=${params.collect}&pair=${params.pair}&user=${account.address}`;
                const signature = account.sign(BT.sha256String(str)).serialize();
                return signature;
            } catch {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
    }

    /**
     * 撤单签名
     * @param params
     * @param password
     */
    cancelOrderSign(params: cancelOrderSignOption, password?): any {
        let account: any;
        account = this.unluck(password);
        if (account) {
            try {
                const str = `channel=${CONFIG.channel}&ids=${params.ids}&user=${account.address}`;
                const signature = account.sign(BT.sha256String(str)).serialize();
                return signature;
            } catch {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
    }

    /**
     * 查询xtar/token余额
     * @param asset
     */
    getBlanace(asset?: string): any {

        let constract: any, user = this.user.getObject('account').userId;

        if (asset) {
            constract = asset;
        }// 查询token余额
        else {
            constract = '0000000000000000000000000000000000000001';
        } // 查询xtar余额
        return this.client.GetBalanceOf(user, constract);
    }

    /**
     * 查询dex余额
     * @param asset    合约地址
     * @param precision
     */
    getDexBlanace(asset: string, precision: any): any {
        const blanace = new BT.Dex(this.client), user = this.user.getObject('account').userId;
        blanace.BalanceOf(user, asset).then(res => {
            const result = this.regular.toFixed(res / (10 ** precision), precision);
            this.dialog.createFromComponent(AssestComponent, result);
        });
    }

    /**
     * 获取本地keyStore文件
     */
    getKeyStore(): loginKeystore {
        return this.user.getObject('user_login_keystore');
    }

    /**
     * unluck
     * @param password
     */
    unluck(password?) {
        let account;
        if (!!password) {
            account = this.getAccount(password);
        } else {
            account = this.getPrivateAccount();
        }
        return account;
    }

    /**
     * 获取account
     * @param password
     */
    getAccount(password): any {
        const keyStore: any = this.getKeyStore();
        if (Object.keys(keyStore).length < 1) {
            return this.user.logout();
        }
        let account: any = false, _account: any = this.xtar.load(JSON.stringify(keyStore.keyStore), password);
        if (keyStore.type === 'key') {
            _account.status == 0 && (account = _account.msg);
        } else {
            if (_account.status == 0) {
                let privateKey = this.xtar.entropyToMnemonic(_account.msg.crypto.privateKey);
                account = this.xtar.create(2, password, privateKey).msg;
            }
        }
        if (!account) {
            return this.load.tipErrorShow(this.translate.instant('common.pwdError'));
        }
        this.privateKey = account.crypto.privateKey;
        return account;
    }

    /**
     * 通过私钥获取account
     */
    getPrivateAccount(): any {
        let account: any = false;
        const privateKey = this.privateKey;
        account = this.xtar.create(3, 'april', privateKey).msg;
        if (!account) {
            return this.load.tipErrorShow(this.translate.instant('common.pwdError'));
        }
        return account;
    }

    /**
     * 获取token信息
     * @param asset
     */
    getTokenInfo(asset: string): Promise<any> {
        let token = new BT.Token(this.client);
        return token.TokenInfo(asset);
    }

    /**
     * 获取挖矿奖励信息
     * @param account
     */
    getBonus(account: string): Promise<any> {
        let dex = new BT.Dex(this.client);
        // return dex.Bonus(account);
        return;
    }

    /**
     * 用户奖励上限 当日总奖励
     * @param account
     */
    getDayBonus(account: string): Promise<any> {
        // let dex = new BT.Dex(this.client);
        // return dex.GetDayBonus(account);
        return;
    }

    /**
     * 查询用户用于挖矿的抵押详情
     * @param account
     */
    getMineInfo(account: string): Promise<any> {
        const client = BT.Provider.NewProvider(CONFIG.sdkUrl);
        // let Resource = new BT.Resource(client);
        // return Resource.GetMineInfo(account);
        return;
    }

    /**
     * 申请解锁奖励
     * @param sender
     * @param account
     * @param password
     */
    claimBonus(account: string, password?): Promise<any> {
        let wallet;
        if (password) {
            wallet = this.getAccount(password);
        } else {
            wallet = this.getPrivateAccount();
        }

        if (wallet) {
            try {
                let dex = new BT.Dex(this.client);
                console.log(wallet, account, BT.Wallet);
                // return dex.ClaimBonus(wallet, account);
                return;
            } catch (e) {
                this.load.tipErrorShow(this.translate.instant('common.sigError'));
                return;
            }
        }
    }

    /**
     * 获取当前区块高度
     */
    async getCurrentHeight() {
        if (!this.client) {
            this.initClient();
        }
        let current = await this.client.GetCurrentHeight();
        return current.result;
    }

    /**
     * 钱包创建、重置密码
     * @param type  2 = 助记词， 3 = 私钥
     * @param password  密码
     * @param value
     */
    create(type, password, value) {
        let privateKey = type == 2 ? this.ethereumCreatePri(value) : value;
        let json = BT.Wallet.Create(password, privateKey);
        var blob = new Blob([json.toJson()], {type: 'text/plain;charset=utf-8'});
        fileSaver.saveAs(blob, 'keystore.json');
        return {status: 0, msg: json};
    }

    /**
     * ethereumjs 生成私钥
     */
    ethereumCreatePri(word) {
        let seed = bip39.mnemonicToSeed(word);
        let hdWallet = hdkey.fromMasterSeed(seed);
        let key = hdWallet.derivePath('m/44\'/388\'/0\'/0/0');
        let privateKey = key.getWallet().getPrivateKey().toString('hex');
        if (privateKey.length % 2 != 0) {
            privateKey = '0' + privateKey;
        }
        return privateKey;
    }

    /**
     * regiterPrime
     * @param payerType
     * @param password
     * @param inviterName
     */
    async regiterPrime(tx, password?: string): Promise<any> {
        const account = this.unluck(password);
        let result;
        if (account) {
            try {
                account.signTx(tx);
                result = this.client.SendRawTransaction(tx.serialize());
            } catch {
                return this.load.tipErrorShow(this.translate.instant('common.sigError'));
            }
        }
        return result;
    }

    /**
     * calcRegiterPrime
     * @param payerType
     * @param address
     * @param inviterName
     */
    async calcRegiterPrime(payerType:string, address, inviterName?: string): Promise<any> {
        if (!inviterName) {
            inviterName = this.inviter_name;
        }

        const payertypes = payerType === 'proxy' ? undefined : address;

        let tx = BT.TxBuilder.CreateUnsignTx(
            BT.primeABI,
            BT.SystemContractAddr.PRIME,
            BT.PrimeMethod.REGISTER,
            payertypes,
            [[this.serviceIssuer, address, inviterName]]
        );

        let obj:any = {
            amount: 0,
            tx
        };

        if(payerType === 'proxy'){
            obj = await this.handlePayer(tx, address);
        }

        return obj;
    }

    /**
     * getAdressInfo
     * @param name
     */
    getAdressInfo(name: string): Promise<any> {
        const nameCli = new BT.Name(this.client);
        return nameCli.GetAddressInfo(name);
    }

    /**
     * HasFatherNameTag
     * @param address
     */
    HasFatherNameTag(address: string): Promise<any> {
        const nameCli = new BT.Name(this.client);
        return nameCli.HasFatherName(address, this.primeBt);
    }

    /**
     * IsPrimeUser
     * @param address
     */
    IsPrimeUser(address: string): Promise<any> {
        return this.primeCli.IsPrimeUser(address);
    }

    /**
     * getOrderInfo
     * @param txid
     */
    getOrderInfo(txid?: string) {
        if (CONFIG.tag === 'BETA' || CONFIG.tag === 'PRO') {
            return window.open(`http://xtarep.org/tx/${txid}`);
        }
        this.load.loadingShow();
        this.client.GetEventLog(txid).then((res: any) => {
            this.load.hide();
            if (res.result && res.result.error_code === 0) {
                let result = res.result.event_logs.filter(ele => {
                    return ele.contract.indexOf('B4T5ciTCkWauSqVAcVKy88ofjcSbHrkRgX') != -1;
                });
                res.result.event_logs = result;
                this.dialog.createFromComponent(TxComponent, res.result);
            } else {
                this.load.tipErrorShow(`Message: ${res.error.message},     Error Code: ${res.result ? res.result.error_code : res.error.code}`);
            }
        });
    }

    /**
     * 获取BT资源
     */
    getBtScource() {
        const client = BT.Provider.NewProvider(CONFIG.sdkUrl);

        const _q = new Query(client);
        const user = this.user.getObject('account').userId;
        return _q.getAllScource(user);
    }

    /**
     * 私钥是否超期
     */
    isExpirTime(): boolean {
        if (!this.privateKey) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 检验是否需要输入解锁密码
     * regularPwd
     * @param callback
     */
    regularPwd(callback:Function, close?:Function ){
        const time = this.isExpirTime();
        if(time){
            let option = {
                callback: res => {
                    callback(res);
                },
                close: res => {
                    close && close()
                }
            };
            this.dialog.createFromComponent(DialogPwdComponent,option);
        }else callback();
    }

    /**
     * deal Sdk Error Code
     * @param result
     */
    dealSdkErrorCode(result): void{
        switch (result.error_code) {
            case 2003:  this.load.tipSuccessShow(this.translate.instant('common.notEnough')); break;
            case 2018:  this.load.tipSuccessShow(this.translate.instant('common.notEnoughNet')); break;
            case 2019:  this.load.tipSuccessShow(this.translate.instant('common.notEnoughCpu')); break;
            case 2023:  this.load.tipSuccessShow(this.translate.instant('common.notEnoughRam')); break;
        }
    }

    /**
     * deoInterEventLog
     * @param config
     */
    deoInterEventLog(config: deoInterEventLog): void{
        let num = 0;
        clearInterval(this.deo_time);
        this.deo_time = setInterval(() => {

            this.client.GetEventLog(config.hash).then(res => {
                num++;
                if(res.result && res.result.error_code !== 0){
                    this.load.hide();
                    this.dealSdkErrorCode(res.result);
                    clearInterval(this.deo_time);
                    return config.error();
                }

                if (res.result && res.result.error_code === 0) {
                    this.load.hide();
                    clearInterval(this.deo_time);
                    config.success();
                    return
                } else {
                    if (num > 8) {
                        config.error();
                        this.load.hide();
                        clearInterval(this.deo_time);
                        this.load.tipSuccessShow(this.translate.instant('member.selectRegiterError'));
                    }
                }
            })
        }, 1000)
    }

    /**
     * handlePayer
     * @param tx
     * @param address
     */
    async handlePayer(tx, address) {
        let obj:PayerInfo={
            amount: 0,
            tx: ''
        };
        // buildPaymentRequest,parsePaymentResponse
        // payer Need actions inside tx, payerAddress, nonce
        const actions = tx.tx.actions;
        const rpcRequest = buildPaymentRequest(actions, address, tx.tx.nonce, CONFIG.chain_id);
        const result = await axios.post(CONFIG.payUrl, rpcRequest);
        /**
         * Parse the return data of the payer(amount, sign, payerAddress, payerAction? )
         * amount: Handling fee
         * sign: Payer's signature
         * payerAddress: Payer's address
         * payerAction?: Contains information about payment payers
         */
        const parseData = parsePaymentResponse(result.data);
        if (parseData.error) {
            // return this.load.tipErrorShow(this.translate.instant('common.notEnough'))
            return this.load.tipErrorShow(parseData.error.message)
        } else {
            // A fee is required, and the payerAction contains information to be paid to prompt the user.
            if (parseData.amount > 0) {
                tx.tx.actions.push(parseData.payerAction);
                obj.amount = parseData.amount / (10**8);
            }
            tx.tx.payer = parseData.payerAddress;
            tx.tx.sig.push(parseData.sign);
            obj.tx = tx
        }
        return obj
    }
}





















