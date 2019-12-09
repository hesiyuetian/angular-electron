import {
    ComponentFactory,
    ComponentFactoryResolver,
    Injectable,
    ComponentRef,
    ViewContainerRef
} from '@angular/core';

import {DialogComponent} from "../components/dialog/dialog.component";

//默认弹窗所需Interface
export interface DialogConfigInterface {
    title: string,
    content: string,
    // buttons: Array<DialogButtonConfigInterface>
}

export interface DialogButtonConfigInterface {
    text: string,
    color: string,
    background: string,
    handle: Function
}

@Injectable({
    providedIn: 'root'
})


export class DialogController {
    setDom: any;
    /*-----Data Part-----*/

    viewContainerRef: any;
    componentRefList: Array<any> = [];

    /*-----Constructor Part-----*/

    constructor(
        private resolver: ComponentFactoryResolver,
        ) {
            // this.setViewContainerRef(ViewContainerRef)
    }

    /*-----Methods Part-----*/

    setViewContainerRef(value: ViewContainerRef) {
        this.viewContainerRef = value;
    }

    //创建普通弹窗,适用于固定格式,标题内容+按钮的类型
    create(config: DialogConfigInterface) {
        let componentRef: ComponentRef<DialogComponent>;
        const factory: ComponentFactory<DialogComponent> = this.resolver.resolveComponentFactory(DialogComponent);
        componentRef = this.viewContainerRef.createComponent(factory);
        let _this = this;
        componentRef.instance.config = config;
        componentRef.instance.onDialogClose = function () {
            _this.destroy(componentRef);
        };
        return componentRef;
    }

    //销毁普通弹窗
    destroy(componentRef?) {
        if (componentRef && componentRef.destroy) {
            componentRef.destroy();
        }
        if(!componentRef && this.componentRefList.length > 0){
            for(let item of this.componentRefList){
                item.destroy();
            }
        }
    }

    //创建自定义弹窗,适用于展示型,只有一个关闭按钮但是内部内容丰富的类型 第一个参数:组件对象 第二个参数:需传入组件内部的值
    createFromComponent(targetComponent: any, config: any = {}) {
        // if(!config.model || config.model != 'MetamaskTipComponent'){
        //     this.clearDom();
        // }

        const factory = this.resolver.resolveComponentFactory(targetComponent);
        let componentRef:any = this.viewContainerRef.createComponent(factory);

        this.componentRefList.push(componentRef);

        let _this = this;
        componentRef.instance.config = config;
        componentRef.instance.onDialogClose = function () {
            _this.componentRefList.pop();
            _this.destroy(componentRef);
        };
        return componentRef;
    }

    // 清除alert (alert、waring-alert) Dom
    clearDom(){
        let popups:any = document.getElementsByClassName('alert-t');
        if(popups && popups.length > 0){
            for(let i=0; i<popups.length; i++){
                popups[i].parentNode.removeChild(popups[i])
            }
        }
    }

    //销毁自定义弹窗
    // destoryFromComponent(componentRef: any) {
    //     if (componentRef && componentRef.destroy) {
    //         componentRef.destroy();
    //     }
    // }

}
