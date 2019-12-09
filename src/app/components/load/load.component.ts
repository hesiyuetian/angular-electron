import {Component, OnDestroy, OnInit} from '@angular/core';
import {SkinServiceService} from '../../service/skin-service.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'app-load',
    templateUrl: './load.component.html',
    styleUrls: ['./load.component.scss']
})
export class LoadComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    public theme: String;

    constructor(
        private skin: SkinServiceService
    ) {
        this.theme = window.document.documentElement.getAttribute('data-theme-style');
    }

    ngOnInit() {
        this.subThemeServe();
    }

    ngOnDestroy(): void {
        this.subServe.unsubscribe();
    }

    /**
     * 订阅theme服务
     */
    subThemeServe(): void {
        this.subServe.add(this.skin.getObservable().subscribe(res => {
            this.theme = res;
        }));
    }


}
