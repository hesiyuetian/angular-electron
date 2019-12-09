export class Loadings {

    body:any;
    setTimeout1: any;

    setTimeout2: any;
    setTimeout3: any;
    setTimeout4: any;

    setInterval1: any;

    constructor(
    ){
        this.initBody();
        this.clearTimeout();
    }

    initBody(){
        this.body = document.getElementsByClassName('body-main')[0];
    }

    /**
     * loading框
     */
    loadingShow(){
        this.hide();
        if(!this.body){ this.initBody() }

        let DOM = `<div class="loadings">
                        <div class="loadings-content f-center">
                        <img class='loadings-loading f-center' src="./assets/images/bithumb_loading.png" alt="">
<!--                            <img class='loadings-loading f-center loadingAnimation' src="../../../assets/images/loading.svg" alt="">-->
                        </div>
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;
        this.body.appendChild(popups);
    }

    /**
     * tip 普通提示框
     * @param value
     */
    tipShow(value: string){
        this.hide();
        if(!this.body){ this.initBody() }

        let v = value || 'success';
        let DOM = `<div class="tip-alert" > 
                    <div class="tip-main tip-putong" >
                        ${v}
                        <span class="iconfont tip-close">&#xe608;</span>
                    </div>
                    
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;

        this.body.appendChild(popups);
        this.closeBtn();
        this.setTimeout2 = setTimeout(()=>{ this.hide() }, 3000)
    }

    /**
     * tip 成功框
     * @param value
     */
    tipSuccessShow(value: string){
        this.hide();
        if(!this.body){ this.initBody() }

        let v = value || 'success';
        let DOM = `<div class="tip-alert" > 
                    <div class="tip-main tip-success" >
                        ${v}
                        <span class="iconfont tip-close">&#xe608;</span>
                    </div>
                    
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;

        this.body.appendChild(popups);
        this.closeBtn();
        this.setTimeout2 = setTimeout(()=>{ this.hide() }, 3000)
    }

    /**
     * tip 警告框
     * @param value
     */
    tipWarningShow(value: string){
        if(!this.body){ this.initBody() }

        let v = value || '网络异常，请稍后重试';
        let DOM = `<div class="tip-alert" > 
                    <div class="tip-main tip-warning" >
                        ${v}
                        <span class="iconfont tip-close" >&#xe608;</span>
                    </div>
                    
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;

        this.body.appendChild(popups);
        this.closeBtn();
        this.setTimeout2 = setTimeout(()=>{ this.hide() }, 3000)
    }

    /**
     * tip 失败框
     * @param value
     */
    tipErrorShow(value: string){
        this.hide();
        if(!this.body){ this.initBody() }

        let v = value || '网络异常，请稍后重试';
        let DOM = `<div class="tip-alert" > 
                    <div class="tip-main tip-error" >
                        ${v}
                        <span class="iconfont tip-close">&#xe608;</span>
                    </div>
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;

        this.body.appendChild(popups);
        this.closeBtn();
        this.setTimeout2 = setTimeout(()=>{ this.hide() }, 3000)
    }

    /**
     * 区块确认弹框
     * @param value
     */
    blockTip(value: any){
        this.hide();
        if(!this.body){ this.initBody() }

        let v = value || '123';
        // fadeIns
        let DOM =  `<div class="blocks ">
                        <div class="blocks-main">
                            <div class="blocks-main-l">
                                <span class="tip-icon "> <i class="fa fa-check"></i>  </span>
                            </div>
                            <div class="blocks-main-r font-colors1">
                                ${v}
                            </div>
                        
                        </div>
                        <div class="blocks-bottom"></div>
                        
                            
                    </div>`;

        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;
        this.body.appendChild(popups);

        this.setTimeout2 = setTimeout(()=>{
            this.hide();
        }, 3000)
    }

    /**
     * 区块确认弹框
     * @param value
     */
    blockTipLian(value: any){
        this.hide();
        if(!this.body){ this.initBody() }
        // let
        let v = value || '123';
        // fadeIns
        let DOM =  `<div class="blocks ">
                        <div class="blocks-main">
                            <div class="blocks-main-l">
                                <span class="tip-icon "> <i class="fa fa-check"></i>  </span>
                            </div>
                            <div class="blocks-main-r font-colors1">
                                ${v}
                            </div>
                        
                        </div>
                        <div class="blocks-bottom"></div>
                        
                            
                    </div>`;

        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;
        this.body.appendChild(popups);

        this.setTimeout2 = setTimeout(()=>{
            this.hide();
        }, 3000)
    }

    /**
     * 成功提示框
     * @param value
     * @param value2
     */
    successFrame(value: string, value2:string){
        if(!this.body){ this.initBody() }

        let v = value || '';
        let v2 = value2 || '';
        let DOM = `<div class="frame"> 
                    <div class="frame-main" >
                        <div class="tip-main" >
                            <span class="tip-icon tip-success">
                                <i class="fa fa-check"></i> 
                            </span>
                            ${v}
                            <p>${v2}</p>
                        </div>
                    </div>
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;
        this.body.appendChild(popups);

        this.setTimeout2 = setTimeout(()=>{
            this.hide();
        }, 2900)
    }

    /**
     * 关闭按钮添加事件
     */
    closeBtn(){
        let close:any = document.getElementsByClassName('tip-close');
        for(let i=0; i<close.length; i++){
            close[i].onclick = ()=>{ this.hide() }
        }
    }
    hide(){
        if(!this.body){ this.initBody() }

        let popups:any = document.getElementsByClassName('popups');
        if(popups && popups.length > 0){
            for(let i=0; i<popups.length; i++){
                this.body.removeChild(popups[i]);
            }
        }
        this.clearTimeout();

    }

    /**
     * 成功提示框
     * @param value
     */
    txid(value: string){
        if(!this.body){ this.initBody() }

        let v = value || '';
        let DOM = `<div class="frame"> 
                    <div class="frame-main" >
                        <div class='alerted'>
                            ${value}
                            <div style='text-align: center;margin-top:20px;'><span class="iconfont tip-close f-cursor">&#xe608;</span></div>
                        </div>
                        
                    </div>
                   </div>`;
        let popups = document.createElement('div');
        popups.className = 'popups';
        popups.innerHTML = DOM;
        this.body.appendChild(popups);
        this.closeBtn();
    }

    clearTimeout(){
        clearTimeout(this.setTimeout1);
        clearTimeout(this.setTimeout2);
        clearTimeout(this.setTimeout3);
        clearTimeout(this.setTimeout4);

        clearTimeout(this.setInterval1);
    }

}
