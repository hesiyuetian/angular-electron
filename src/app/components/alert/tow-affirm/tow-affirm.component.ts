import {Component, OnInit, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-tow-affirm',
    templateUrl: './tow-affirm.component.html',
    styleUrls: ['./tow-affirm.component.scss']
})
export class TowAffirmComponent implements OnInit {

    @Input() config;//必留参数
    @Input() onDialogClose: Function;//必留参数
    fadeFlag: string = 'fadeIn';

    sure: any = this.translate.instant('whiteOperation.sure');
    cancel: any = this.translate.instant('whiteOperation.cancel');

    constructor(
        private translate: TranslateService
    ) {
    }

    ngOnInit() {
    }


    close() {
        let _this = this;
        this.fadeFlag = 'fadeOut';
        setTimeout(function () {
            _this.onDialogClose();
        }, 250);//小于300
    }

}
