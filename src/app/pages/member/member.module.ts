import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CommonModule} from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';

import { SharedModule } from '../../components/shared.module';
import { MemberComponent } from './member.component';

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        TranslateModule,
        RouterModule.forChild([
            {path: '', component: MemberComponent}
        ]),
    ],
    providers: [],
    entryComponents: [],
    declarations: [
        MemberComponent,
    ],
    exports: [
        MemberComponent,
    ],
})
export class MemberModule {
}
