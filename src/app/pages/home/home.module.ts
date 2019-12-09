import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { SharedModule } from '../../components/shared.module';
import { HomeComponent } from './home.component';
 
@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {path: '', redirectTo: 'home', pathMatch: 'full'},
            {path: 'home', component: HomeComponent},
            {
                path: 'setting', 
                loadChildren: '../setting/setting.module#SettingModule'
            },
            {
                path: '**',
                redirectTo: '/home',
                pathMatch: 'full',
            }
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        HomeComponent,
    ],
    exports: [
        HomeComponent,
    ],
})
export class HomeModule {
}
