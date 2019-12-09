import {CommonModule} from '@angular/common';
// import {CoreModule} from '../core/core.module';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';


import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {HttpClient} from '@angular/common/http';

// 弹窗 dialog
import { WaringAlertComponent } from './alert/waring-alert/waring-alert.component';
import { AlertComponent } from './alert/alert/alert.component';
import { ConterAlertComponent } from './alert/conter-alert/conter-alert.component'


// 封装的组件
import { AprilDateComponent } from './april-date/april-date.component';
import { AprilSelectComponent } from './april-select/april-select.component'
import { NoDataComponent } from './no-data/no-data.component';
import { AprilTimeComponent } from './april-time/april-time.component';
import { AprilSearSelectComponent } from './april-sear-select/april-sear-select.component';
import { HeaderComponent } from './header/header.component';
import { DialogComponent } from './dialog/dialog.component';
import { TowAffirmComponent } from './alert/tow-affirm/tow-affirm.component';
import { DialogPwdComponent } from './dialog-pwd/dialog-pwd.component';

// 开发环境、测试环境
import { TxComponent } from './dev/tx/tx.component';
import { AssestComponent } from './dev/assest/assest.component';


//  pipe
import { SensitivePipe } from '../pipes/sensitive.pipe';
import { MonthPipe } from '../pipes/month.pipe';
import { FormatPipe } from '../pipes/format.pipe';
import { FilterNumberPipe } from '../pipes/fiter-number.pipe';
import { UtcTolocal } from '../pipes/utc-time.pipe';

// trad页面组件
import { ContentComponent } from './trade/content/content.component';
import { FootComponent } from './trade/foot/foot.component';
import { FooterComponent } from './footer/footer.component';

import { TradeTopRightComponent } from './trade/trade-top-right/trade-top-right.component';
import { TradeTopLeftTradComponent } from './trade/trade-top-left-trad/trade-top-left-trad.component';
import { TradeSymbolComponent } from './trade/trade-symbol/trade-symbol.component';
import { NewTradeComponent } from './trade/new-trade/new-trade.component';


//分页器
import { PaginatorComponent } from './paginator/paginator.component';
import { LoadComponent } from './load/load.component';

import { Txt } from '../common/util/filter';
import { LoginAlertComponent } from './login-alert/login-alert.component';

// canvas 圆环进度
import { SlideComponent } from './slide/slide.component';

// page
import { NumFormatPipe } from '../pipes/num-format.pipe';
import { ZeroPipe } from '../pipes/zero.pipe';
import { ToFixedPipe } from '../pipes/to-fixed.pipe';
import { SortPipe } from '../pipes/sort.pipe';

import { OrderComponent } from '../pages/order/order.component';
import { AssetsListComponent } from '../pages/assets/assets-list/assets-list.component';
import { MembersComponent } from './members/members.component';


// translate server
export function createTranslateHttpLoader(http:HttpClient){
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forChild({
            loader:{
            provide:TranslateLoader,
            useFactory:createTranslateHttpLoader,
            deps:[HttpClient]
            }
        })
    ],
    declarations: [
        NumFormatPipe,
        ZeroPipe,
        ToFixedPipe,
        SortPipe,
        SensitivePipe,
        MonthPipe,
        FormatPipe,
        FilterNumberPipe,

        OrderComponent,
        AssetsListComponent,

        UtcTolocal,
        AprilDateComponent,
        AprilSelectComponent,
        AprilTimeComponent,
        AprilSearSelectComponent,
        NoDataComponent,
        WaringAlertComponent,
        AlertComponent,
        TowAffirmComponent,
        HeaderComponent,
        DialogComponent,
        ContentComponent,
        FootComponent,
        FooterComponent,
        PaginatorComponent,
        LoadComponent,
        ConterAlertComponent,
        Txt,
        // TradeTopComponent,
        TradeTopRightComponent,
        TradeTopLeftTradComponent,
        TradeSymbolComponent,
        NewTradeComponent,
        LoginAlertComponent,
        DialogPwdComponent,
        TxComponent,
        AssestComponent,
        SlideComponent,
        MembersComponent,
    ],
    exports: [
        FormsModule,
        SensitivePipe,
        MonthPipe,
        FormatPipe,
        FilterNumberPipe,
        UtcTolocal,
        AprilDateComponent,
        AprilSelectComponent,
        AprilTimeComponent,
        AprilSearSelectComponent,
        NoDataComponent,
        WaringAlertComponent,
        AlertComponent,
        HeaderComponent,
        DialogComponent,
        DialogPwdComponent,
        ContentComponent,
        FootComponent,
        FooterComponent,
        PaginatorComponent,
        LoadComponent,
        ConterAlertComponent,
        Txt,

        TradeTopRightComponent,
        TradeTopLeftTradComponent,
        TradeSymbolComponent,
        NewTradeComponent,
        LoginAlertComponent,
        TxComponent,
        AssestComponent,
        SlideComponent
    ],
    entryComponents: [
        WaringAlertComponent,
        AlertComponent,
        ConterAlertComponent,
        TowAffirmComponent,
        LoginAlertComponent,
        DialogPwdComponent,
        TxComponent,
        AssestComponent,
        MembersComponent
    ],
})
export class SharedModule {
}
