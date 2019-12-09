import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { SharedModule } from '../../components/shared.module';
import { SettingComponent } from './setting.component';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {path: '', component: SettingComponent},
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        SettingComponent,
    ],
    exports: [
        SettingComponent,
    ],
})
export class SettingModule {
}
