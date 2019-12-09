// import {riskResultList} from '../../pages/risk/mock-risk'
import { FormatPipe } from '../../pipes/format.pipe'
import BigNumber from "bignumber.js";
import { Loadings } from '../../components/loadings/loadings'
import { User } from './user'
const load = new Loadings;
const user = new User;
export class regular {
    constructor(
		// public translate: TranslateService,
    ){
    }
    emailCheck(str:string){
        let reg=/^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/;
        return reg.test(str);
    }
    codeCheck(str:any){
        var codeReg = /^\d{6}$/;
        return codeReg.test( str );
    }
    nameCheck(str:any){
        str = str.toString()
        return str ? str.length <= 30 ? true : false : false;
    }
    numberCheck(str:any){
        let numReg = /^[0-9]*$/;
        return numReg.test( str );
    }

    sensitiveCheck(str:any){
        if(!str) return ''

        let sensitiveReg = /^(\w{4})(\w*)(\w{4})$/;
        return (str.toString()).replace(sensitiveReg, function(a, b, c, d) {
            return b + (c.replace(/\w/g, ".")).substring(0, 5) + d;
        });
    }

    // 密码校验
    pwdPlexCheck(str){
        let pwdReg = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_]+$)(?![a-z0-9]+$)(?![a-z\W_]+$)(?![0-9\W_]+$)[a-zA-Z0-9\W_]{8,16}$/;
        return pwdReg.test( str );
    }
    //只能输入数字
    numberEnter(str:any){
        // value=value.replace(/[^\d{1,}\.\d{1,}|\d{1,}]/g,'')
        return str.replace(/[^\.\d]/g,'')
    }
    //只能输入小写字母和空格
    stringKong(str:any){
        let v = str.replace(/[^\ \a-z]*$/g,'');
        return this.delectFirstKong(v);
    }
    //只能输入字母和空格
    stringAKong(str:any){
        let v = str.replace(/[^\ \A-Za-z]*$/g,'');
        return this.delectFirstKong(v);
    }
    //多个空格替换为一个空格
    kongGe(str: any){
        var regEx = /\s+/g;
        return str.replace(regEx, ' ');
    }
    //去掉第一位空格
    delectFirstKong(str:any){
        return str.replace(/(^\s*)/g, "");
    }
    //只能输入整数
    number(str:any){
        return str.replace(/\D/g,'')
    }
    //只能输入英文和数字
    stringAndNumber(str:any){
        return str ? str.replace(/[^a-zA-Z0-9]/,'') : '';
        // return str ? str.replace(/[^\w\/]/ig,'') : '';
    }
    //只能输入英文， 不限大小写
    stringEnter(str:any){
        return str.replace(/[^\a-zA-Z]/g,'');
    }

    // 千分位分割
    numFormat(val){
        if( !val ) return val;
        var v, j, sj, rv = "";
        v = val.toString().replace(/,/g, "").split(".");
        j = v[0].length % 3;
        sj = v[0].substr(j).toString();
        for (var i = 0; i < sj.length; i++) {
        rv = (i % 3 == 0) ? rv + "," + sj.substr(i, 1) : rv + sj.substr(i, 1);
        }
        var rvalue = (v[1] == undefined) ? v[0].substr(0, j) + rv : v[0].substr(0, j) + rv + "." + v[1];
        if (rvalue.charCodeAt(0) == 44) {
        rvalue = rvalue.substr(1);
        }
        return rvalue
    }

    /**
     * 将数字转化为千分位格式
     * @param number
     */
    toDecimalMark(number:Number) {
        return number.toLocaleString('en-US');
    }

    // 保留4位小数 不做四舍五入
    numberFormat(vlaue:number,fixed:number){
        return Math.floor(vlaue*10**fixed)/10**fixed
    }

    //url是否合法
    isUrl(value: any){
        let reg=/(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
        return reg.test(value)
    }
    //url是否合法
    isUrl2(value: any){
        let reg=/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/;
        return reg.test(value)
    }
    //url开头是否为(http|ftp|https)
    isUrlHttp(value: any){
        let reg=/(http|ftp|https):\/\//;
        return reg.test(value)
    }
    //只可输入数字或小数
    numberAndDecimal(value: any){
        let v = value.replace('。', '.');
		v = v.replace(/[^\d\.]/g, '');
        v = v[0]=='.' ? '0.' + v : v;

        let split = v.split(".");

		if(split.length && split.length > 2){
			let c = '';
			for(let i=0; i<split.length; i++){
				c += split[i];
				i == 0 ? c+='.' : '';
			}

			v = c;
		}
		return v
    }
    //只可输入数字，英文，点，下划线，空格
    stNameStandard(value: any){
        let a = /^[A-Za-z0-9_. ]+$/;
		let d = '';
		for(let i of value){ d += a.test(i) ? i : '' }
		return d;
    }

    //验证字符串是否存在中文
    isHaveChinese(value){
        let reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
        return reg.test(value)
        // console.log(reg.test(value))
    }

    UTCtime(){
        return (new Date(new Date().toUTCString())).getTime();
    }

    fanUTCtime(data){
        new FormatPipe().transform(data,3);
        let DataList = data.split(' ');
        let j =`${DataList[0]}T${DataList[1]}Z`;
        return new Date(j).getTime();
    }
    //验证邮箱
    isEmail(value){
        let reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/
        return reg.test(value);
    }

    // 数字的相乘   fiexd ===> 小数位
    toBigsells(numberAry: Array<any> = [] , fixed: number = 1){
        let num = new BigNumber(1);
        for(let i in numberAry){
          num = num.multipliedBy(numberAry[i]);
        }
        return num.toFixed(fixed,1) // 2：向上取整   1： 向下取整
    }

    toBigsell(numberAry: Array<any> = []){
        let num = new BigNumber(1);
        for(let i in numberAry){
          num = num.multipliedBy(numberAry[i]);
        }
        return num
    }

    toNumber(data) {
		return Number(data || 0)
    }

    // 比较大小   1:  x>y;    -1:	x<y;        0: x==y
    comparedTo(x,y){
        x = new BigNumber(x);
        y = new BigNumber(y);
        return x.comparedTo(y);
    }

    // 数字的除   fiexd ===> 小数位
    toDividedBy(price: number, rale: number, fixed: number = 1){
        let num = new BigNumber(price).dividedBy(rale);
        return num.toFixed(fixed,1) // 2：向上取整   1： 向下取整
    }

    // 数字的除   fiexd ===> 小数位
    toDividedByAry(ary: Array<any>, fixed: number = 1){
        let num = new BigNumber(ary[0]);
        for(let i = 1; i < ary.length; i++){
            num = num.dividedBy(ary[i]);
        }
        return num.toFixed(fixed,1) // 2：向上取整   1： 向下取整
    }

    // 两数相加
    toPlus(pre,ads){
        let _C = new BigNumber(pre);
        return _C.plus(ads).toString();
    }

    // 两数相减
    toModulo(pre,next,fixed: number = 8){
        let _C = new BigNumber(pre);
        return _C.minus(next).toFixed(fixed,1);
    }

    // 保留小数位
    toFixed(number:any, fixed){
        number = this.fanToNum(number);
        return new BigNumber(number).toFixed(fixed,1)
    }

    // bigNumber数字处理
    toBigNumber(number){
        return new BigNumber(number)
    }


    // 幂运算
    exponentiatedBy(num,pow){
        return this.fanToNum(new BigNumber(num).exponentiatedBy(pow).toString())
    }

    // 处理科学计数法
    fanToNum (num) {
        if (!num) return num
        num = num.toString()
        if (num.indexOf('e') === -1) { return num }
        let reg = /(?:(\d)+(?:.(\d+))?)[e]{1}-(\d)/.exec(num)
        if (!reg) {
            return num
        }
        let v = num
        if (reg[3] === '7') {
            v = '0.000000' + (reg[2] ? reg[1] + reg[2] : reg[1])
        } else {
            v = '0.0000000' + reg[1]
        }
        return v
    }

    //utc时间转化为本地时间
    utctimeToLocaltime(time){
        //转化为utc时间格式
        let utcTime = time.replace(' ', 'T')+'Z';
        let newDate = new Date(utcTime);

        let YY = newDate.getFullYear() + '-';
        let MM = (newDate.getMonth() + 1 < 10 ? '0' + (newDate.getMonth() + 1) : newDate.getMonth() + 1) + '-';
        let DD = (newDate.getDate() < 10 ? '0' + (newDate.getDate()) : newDate.getDate());
        let hh = (newDate.getHours() < 10 ? '0' + newDate.getHours() : newDate.getHours()) + ':';
        let mm = (newDate.getMinutes() < 10 ? '0' + newDate.getMinutes() : newDate.getMinutes()) + ':';
        let ss = (newDate.getSeconds() < 10 ? '0' + newDate.getSeconds() : newDate.getSeconds());

        return YY + MM + DD +" "+hh + mm + ss
    }

    //复制
    copyTextToClipboard(text) {
        var textArea:any = document.createElement('textarea')
        textArea.style.position = 'fixed'
        textArea.style.top = 0
        textArea.style.left = 0
        textArea.style.width = '2em'
        textArea.style.height = '2em'
        textArea.style.padding = 0
        textArea.style.border = 'none'
        textArea.style.outline = 'none'
        textArea.style.boxShadow = 'none'
        textArea.style.background = 'transparent'
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        try {
          var successful = document.execCommand('copy')
          var msg = successful ? 'successful' : 'unsuccessful'
        } catch (err) {
          console.log('Oops, unable to copy')
        }
        document.body.removeChild(textArea);
        // load.tipSuccessShow('复制成功');
        if(user.getItem('language') == 'en') load.tipSuccessShow('Copy Success');
        else load.tipSuccessShow('复制成功');
    }

    // 获取当前时区
    getTimeZone(){
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    setTitle(title){
        document.title = title
    }

    //验证密码强度
    verificationPassword(txt){
        var lvl = 0;

        /[0-9]/.test(txt) && lvl++;
        /[a-z]/.test(txt) && lvl++;
        /[A-Z]/.test(txt) && lvl++;
        /\W/.test(txt) && lvl++;
        (!!!txt || txt.length < 8) && (lvl = 0);

        return lvl;
    }

    // 组装深度数据 [price,amount,v] ==> {price:'',amount:'',v:''}
    makeDepth(data){
        if(data.length < 1) return [];
        let _copy:Array<any> = [];
        data.map(item=>{
            let obj = {price:'', amount:'', v:''};
            [obj.price,obj.amount,obj.v] = [item[0],item[1],item[2]];
            _copy.push(obj)
        });
        return _copy;
    }

    // 获取n天的时间 yyyy-mm-dd
    fun_date(n){
        var date1 = new Date();
        var date2 = new Date(date1);
        date2.setDate(date1.getDate()+n);
		var time2 = date2.getFullYear()+"-"+(date2.getMonth()+1)+"-"+date2.getDate();
		return time2.replace(/-/g, '/')
    }

    // 获取n月的时间 yyyy-mm-dd
    fun_month(n){
        var nowdate = new Date();
		nowdate.setMonth(nowdate.getMonth()+n);
        return `${nowdate.getFullYear()}-${nowdate.getMonth()+1}-${nowdate.getDate()}`
    }

    // 字节数值转换
    bitChange(val){
        if(!!!val) return '0 bit'
        else if(val < 1024) return `${val} bit`
        else if((val / 1024) < 1024) return `${this.toDividedBy(val, 1024, 3)} KB`
        else if((val / 1024**2) < 1024) return `${this.toDividedBy(val, 1024**2, 3)} MB`
        else if((val / 1024**3) < 1024) return `${this.toDividedBy(val, 1024**3, 3)} GB`
        else if((val / 1024**4) < 1024) return `${this.toDividedBy(val, 1024**4, 3)} TB`
    }

    // ms数值转换
    msChange(val){
        if(!!!val) return '0 μs'
        else if(val < 10**3 ) return `${val} μs`
        else if(val / 10**3 < 10**3 ) return `${this.toDividedByAry([val, 10**3], 3)} ms`
        else if(val / 10**6 < 60) return `${this.toDividedByAry([val, 10**6], 2)} m`
        else if(val / 10**6 / 60 < 60) return `${this.toDividedByAry([val, 10**6, 60], 2)} min`
        else if(val / 10**6 / 60**2 < 24) return `${this.toDividedByAry([val, 10**6, 60**2], 2)} h`
    }

    // 抵押Xtar换算
    xtarChange(val){
        if(!!!val) return 0
        else return this.toDividedBy(val, 10**8, 4)
    }

    // css 浏览器支持
    isCssSuper(){
		if(CSS.supports("(-webkit-text-security: disc)")) return true
		else return false
    }

    // slice change
    sliceChange(val){
        if(this.comparedTo(val, 10**8) == 1) return val.substr(0, 7)
        else  return val
    }


}
