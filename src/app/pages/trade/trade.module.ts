import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { SharedModule } from '../../components/shared.module';
import { TradeComponent } from './trade.component';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {path: '', component: TradeComponent},
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        TradeComponent,
    ],
    exports: [
        TradeComponent,
    ],
})
export class TradeModule {
}
