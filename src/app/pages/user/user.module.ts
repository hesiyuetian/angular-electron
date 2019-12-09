import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { SharedModule } from '../../components/shared.module';
import { LoginComponent } from './login/login.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';
import { UnlockComponent } from './unlock/unlock.component';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full'
            },
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'create_wallet',
                component: CreateWalletComponent
            },
            {
                path: 'unlock',
                component: UnlockComponent
            },
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        LoginComponent,
        CreateWalletComponent,
        UnlockComponent,
    ],
    exports: [
        LoginComponent,
        CreateWalletComponent,
        UnlockComponent,
    ],
})
export class UserModule {
}
