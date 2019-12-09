import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import {SharedModule} from '../../components/shared.module';
import {AssetListComponent} from '../../components/assets/asset-list/asset-list.component';
import {HostoryListComponent} from '../../components/assets/hostory-list/hostory-list.component';
import {BonusComponent} from '../../components/assets/bonus/bonus.component';
import {AssetsListComponent} from './assets-list/assets-list.component';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {path: '', redirectTo: 'assets_records', pathMatch: 'full'},
            {
                path: '',
                component: AssetsListComponent,
                children: [
                    {path: '', redirectTo: 'list', pathMatch: 'full'},
                    {path: 'list', component: AssetListComponent},
                    {path: 'history', component: HostoryListComponent},
                    // {path: 'bonus', component: BonusComponent},
                ]
            },
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        AssetListComponent,
        HostoryListComponent,
        BonusComponent
    ],
    exports: [
        AssetListComponent,
        HostoryListComponent,
        BonusComponent
    ],
})
export class AssetsModule {
}
