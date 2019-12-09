import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { SharedModule } from '../../components/shared.module';
import { OpenComponent } from '../../components/order/open/open.component';
import { HistoryComponent } from '../../components/order/history/history.component';
import { TransactionComponent } from '../../components/order/transaction/transaction.component';
import { OrderComponent } from './order.component';
@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {path: '', redirectTo: 'order', pathMatch: 'full'},
            {
                path: '',
                component: OrderComponent,
                children: [ 
                  {path: '', redirectTo: 'list', pathMatch: 'full'},
                  {path: 'list', component: OpenComponent},
                  {path: 'history', component: HistoryComponent},
                  {path: 'transaction', component: TransactionComponent},
                ]
              },
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        OpenComponent,
        HistoryComponent,
        TransactionComponent,
    ],
    exports: [
        OpenComponent,
        HistoryComponent,
        TransactionComponent,
    ],
})
export class OrderModule {
}
