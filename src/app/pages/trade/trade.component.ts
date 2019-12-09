import {Component, OnDestroy, OnInit} from '@angular/core';
import {ScokeIoService} from '../../service/scoke-io.service';
import {Router, ActivatedRoute} from '@angular/router';
import {Subscription} from 'rxjs';

declare var $;

@Component({
    selector: 'app-trade',
    templateUrl: './trade.component.html',
    styleUrls: ['./trade.component.scss']
})

export class TradeComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    public symbol: string = this.activatedRouter.snapshot.params['symbol'];

    //WS是否需要取消订阅上次订阅信息
    isUnsubscribe: boolean = false;

    // 界面模式  traditional ： 传统模式      tile ： 平铺模式
    public modeSel: string = 'tile';
    // tile ： 平铺模式   左边展开视野配置
    public tileLeftFlag: boolean = false;
    // tile ： 平铺模式   左边展开视野配置
    public tileRightFlag: boolean = false;

    constructor(
        private activatedRouter: ActivatedRoute,
        private socket: ScokeIoService,
    ) {
        this.activatedRouter.params.subscribe(params => {
            this.symbol = this.activatedRouter.snapshot.params['symbol'];
            this.isUnsubscribe && this.socket.subscribe(this.symbol, this.isUnsubscribe);
            this.isUnsubscribe = true;
        });
    }

    ngOnInit() {
        this.subThemeServe();
        this.subTileDirectionServe();
        this.init();
    }

    ngOnDestroy() {
        this.socket.wsCloseSocket();
    }

    /**
     * 订阅Mode服务
     */
    subThemeServe(): void{
        this.subServe.add(this.socket.getModeObservable().subscribe(res => {
            this.modeSel = res;
        }))
    }

    /**
     * 订阅TileDirection服务
     */
    subTileDirectionServe(): void{
        this.subServe.add(this.socket.getTileDirectionObservable().subscribe(res => {
            if (res.type === 'leftDirec') {
                this.tileLeftFlag = res.direc;
            } else {
                this.tileRightFlag = res.direc;
            }
        }))
    }

    init() {
        setTimeout(() => { this.socket.onCenten(true, this.symbol) },500)
    }
}
