import {Component, OnInit, Renderer2, Input, ElementRef, OnDestroy} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core'

import { service } from '../../../common/util/service'
import { ScokeIoService } from '../../../service/scoke-io.service'
import { SkinServiceService } from '../../../service/skin-service.service'
import { regular } from '../../../common/util/regular'
import { resetData } from '../../../common/util/resetData'
import * as echarts from "echarts";
import { User } from '../../../common/util/user';
import { TV } from '../../../common/util/tradview';
import { EarchDepth } from '../../../common/util/earchDepth';
import { CONFIG } from '../../../common/util/config';

import { TrickerService } from '../../../service/tricker.service';
import { DialogController } from '../../../controller/dialog'
import { Loadings } from '../../loadings/loadings'
import { ConterAlertComponent } from '../../../components/alert/conter-alert/conter-alert.component'
import {Subscription} from 'rxjs';
import {AuxBtService} from '../../../service/aux-bt.service';

declare var TradingView;
declare var Datafeeds;
declare var $;

const Tv = new TV();
const earchDepthUtil = new EarchDepth();

@Component({
    selector: 'app-content',
    templateUrl: './content.component.html',
    styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit, OnDestroy {
    subServe: Subscription = new Subscription();
    // 界面模式  traditional ： 传统模式      tile ： 平铺模式
    @Input() modeSel: string = 'traditional';
    // tile ： 平铺模式  向左展开
    public leftDirec: boolean = true;
    // tile ： 平铺模式  向右展开
    public rightDirec: boolean = true;
    // tile ： 平铺模式  展示市场行情
    public marketShow: boolean = false;


    // // BTC ===>  USD
    // btcToUsdt: any = 0;
    // usdtVal: any = 0;

    // 是否加入收藏
    isfav: boolean = false;
    tickerList: any;
    precision: any = {
        amountPrecision: 4,
        basePrecision: 4,
        pricePrecision: 4,
        minSize: 1
    };


    // left K-line AND depth

    // 主题色是否是深色
    isDark: string = 'Dark';
    //节流开关
    throttleSwitch: boolean = true;
    //K线深度切换开关 默认K线图
    chartShow: string = 'k';

    // 当前的币种
    symbol: string = '';
    icon: String = 'BTC/USDT';


    //K线图对象
    widget: any = null;
    //k线图默认时间的显示
    cycle = (!this.user.getItem('tradingview.resolution') || this.user.getItem('tradingview.resolution') < 5) ? '5' : this.user.getItem('tradingview.resolution');
    timezone: String = this.regular.getTimeZone();


    // 深度图开始
    depth = null;
    depthDataS = null; //
    // erach
    echartsList: any = {
        buy: [
            // { 'quantity': 6000.00000000, 'price': 6004.0 },
        ],
        sell: [

        ]
    };

    // 按钮操作
    isFavStatus: boolean = true;

    constructor(
        private el: ElementRef,
        private router: Router,
        private renderer: Renderer2,
        private skin: SkinServiceService,
        private activatedRouter: ActivatedRoute,
        private scoket: ScokeIoService,
        private service: service,
        private load: Loadings,
        private user: User,
        public regular: regular,
        private trickerService: TrickerService,
        public dialog: DialogController,
        public resetData: resetData,
        public auxBt: AuxBtService,
        public translate: TranslateService
    ) {
        this.activatedRouter.params.subscribe(params => {

            this.chartShow = 'k';
            this.echartsList.buy = [];
            this.echartsList.sell = [];
            this.clearInterTradeingView();

            this.symbol = this.activatedRouter.snapshot.params['symbol'] || 'BTC_USDT';
            this.icon = this.symbol.replace(/_/g, '/');
            this.resetData.getPairs().then( (res:any) => {
				for(let item of res){
					if(item.pair === this.symbol){
						this.precision = {
							amountPrecision: item.amount_precision,
							basePrecision: item.base_precision,
							pricePrecision: item.price_precision,
							minSize: this.regular.fanToNum(item.min_amount)
						};
						break;
					}
                }
                this.init();
            })
        });
    }

    ngOnInit(): void {
        this.isDark = window.document.documentElement.getAttribute('data-theme-style');
        this.init();
        this.user.clearTV();
        this.subLangServe();
        this.subThemeServe();
        this.subWsDepthServe();
        this.subWsTickerServe();
        // this.subTickerListServe();
        this.subCollectServe();
    }

    ngOnDestroy(): void {
        this.clearInterTradeingView();
        this.subServe.unsubscribe();
    }

    /**
     * 订阅ws深度推送服务
     */
    subWsDepthServe(): void{
        this.subServe.add(this.scoket.getObservable().subscribe(res => {
            this.echartsList = JSON.parse(JSON.stringify(res));
            if(!this.depth) this.initDept();
            this.getDepthChartData();
        }))
    }

    /**
     * 订阅ws Tick推送服务
     */
    subWsTickerServe(): void{
        this.subServe.add(this.scoket.getTickObservable().subscribe(res => {
            res.pair === this.symbol && (this.tickerList = res);
        }))
    }

    /**
     * 订阅收藏服务
     */
    subCollectServe(): void{
        this.subServe.add(this.trickerService.getObservable().subscribe((res:any) => {
            if(res.type == 'set'){
                const Index = (res.data).findIndex(data => {
                    return data === this.symbol
                });
                this.isfav = Index != -1 ? true : false;
            }
        }))
    }

    /**
     * 订阅全部行情服务
     */
    // subTickerListServe(): void{
    //     this.subServe.add(this.trickerService.getTickListObservable().subscribe( (res:any) => {
    //         this.toUsd(res)
    //     }))
    // }

    /**
     * 订阅语言服务
     */
    subLangServe(): void{
        this.subServe.add(this.skin.getLangObservable().subscribe (res => {
            this.changeLanguage()
        }))
    }

    /**
     * 订阅theme服务
     */
    subThemeServe(): void{
        this.subServe.add(this.skin.getObservable().subscribe( res => {
            this.isDark = res;
            this.changeChartTheme(res);
            this.setOption(this.depthDataS);
        }))
    }

    clearInterTradeingView(){
        if (this.widget) {
            this.widget.options.datafeed.disposeUpdateInterval();
        }
    }

    init() {
        setTimeout(_ => {
            this.initKLine();
        }, 500)
    }

    /**
     *
     * @@@  left  K-line AND depth
     *
     */

    /**
     * K线深度切换
     * @param val
     */
    changeChart(val) {
        this.chartShow = val;
    }

    /**
     * @@@@ K线绘制
     */

    /**
     * 改变图表皮肤
     * @param theme
     */
    changeChartTheme(theme: string) {
        //K线图
        this.widget.onChartReady(() => {
            if (this.isDark === 'Dark') {
                this.widget.addCustomCSSFile('./chart.css');
            } else {
                this.widget.addCustomCSSFile('./light.css');
            }
            this.widget.applyOverrides(Tv.getOverrides(theme).dark_overrides)
            this.widget.applyStudiesOverrides(Tv.getOverrides(theme).dark_studies_overrides)
        });
    }

    /**
     * 全屏
     * @param e
     */
    onFullScreenClick(e) {
        var k_lineIframe = $("#k-line iframe").attr("id");
        this.launchFullScreen(document.getElementById(k_lineIframe));
    }

    /**
     * K线图全屏
     * @param element
     */
    launchFullScreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    changeLanguage(){
        this.widget && this.chartShow == 'k' && this.initKLine();
    }

    /**
     * 初始化K线图
     */
    initKLine() {
        let self = this;
        var widget = this.widget = new TradingView.widget({
            fullscreen: false,
            theme: 'Dark',
            style: 3,
            symbol: self.symbol,
            // symbol: "AAPL",
            // symbol: "BTC-USDT",
            custom_css_url: this.isDark === 'Dark' ? './chart.css' :'./light.css',
            timezone: this.timezone,
            // exchange: 'Lydr Exchange',
            withdateranges: true,

            // 默认显示时间间隔的数据
            interval: this.cycle,
            timeframe: this.cycle,

            container_id: "k-line",
            // datafeed: new Datafeeds.UDFCompatibleDatafeed('https://demo_feed.tradingview.com',4000),
            // datafeed: new Datafeeds.UDFCompatibleDatafeed('https://sit-cex-api.dcex.world/market/tradingview',4000),
            datafeed: new Datafeeds.UDFCompatibleDatafeed(`${CONFIG.apiUrl}/v1/market`,10000),
            library_path: "assets/trading/",
            locale: this.user.getItem('language') || "zh", // en
            // drawings_access: { type: 'black', tools: [{ name: "Regression Trend" }] },
            // 不显示元素
            disabled_features: Tv.getDisFeatures(),
            favorites: {
                intervals: ['1', '5', '15', '30', '60', '120', '240', '360', 'D', 'W', 'M'],
                chartTypes: ['Area']
            },
            // kx
            // 显示元素
            enabled_features: Tv.getEnFeature(),
            preset: "mobile",
            charts_storage_api_version: '1.1',
            client_id: 'tradingview.com',
            user_id: 'public_user_id',

            // 工具栏背景色
            // toolbar_bg: '#ff0',
            autosize: true,//自适应
            time_frames: [],//左侧底部时间格式化
            overrides: Tv.getOverrides(this.isDark).dark_overrides,
            studies_overrides: Tv.getOverrides(this.isDark).dark_studies_overrides,
            allow_symbol_change: true,

        });

        var chartType = 1, _this=this;
        this.widget.onChartReady(function () {
            //设置均线种类 均线样式
            Tv.createStudy(_this.widget);
            //生成时间按钮
            _this.createButton();
            _this.widget.chart().setChartType(chartType);
            // toggleStudy(chartType);
        });

        this.widget = widget;
    }

    /**
     * 创建tradingView
     */
    createButton(){
        var thats = this.widget, _this = this;

        var buttons:any = [
            { title: this.translate.instant('tv.time'), resolution: '1', chartType: 3 },
            { title: `1${this.translate.instant('tv.min')}`, resolution: '1', chartType: 1 },
            { title: `3${this.translate.instant('tv.min')}`, resolution: '3', chartType: 1 },
            { title: `5${this.translate.instant('tv.min')}`, resolution: '5', chartType: 1 },
            { title: `15${this.translate.instant('tv.min')}`, resolution: '15', chartType: 1 },
            { title: `30${this.translate.instant('tv.min')}`, resolution: '30', chartType: 1 },
            { title: `1${this.translate.instant('tv.h')}`, resolution: '60', chartType: 1 },
            { title: `1${this.translate.instant('tv.d')}`, resolution: 'D', chartType: 1 },
            { title: `1${this.translate.instant('tv.w')}`, resolution: 'W', chartType: 1 },
            { title: `1${this.translate.instant('tv.m')}`, resolution: 'M', chartType: 1 },
        ];
        var resolution = this.cycle, chartType = 1;

        for (var i = 0; i < buttons.length; i++) {
            (function (button) {
                thats.createButton()
                    .attr('title', button.title).addClass("mydate")
                    .text(button.title)
                    .on('click', function (e) {
                        if ($(this).parent().hasClass('active')) {
                            return false;
                        }
                        localStorage.setItem('tradingview.resolution', button.resolution);
                        localStorage.setItem('tradingview.chartType', button.chartType);
                        $(this).parent().addClass('active').siblings('.active').removeClass('active');
                        thats.chart().setResolution(button.resolution, function onReadyCallback() { });
                        if (button.chartType != thats.chart().chartType()) {
                            thats.chart().setChartType(button.chartType);
                            toggleStudy(button.chartType);
                        }
                    }).parent().addClass('my-group' + (button.resolution == resolution && button.chartType == chartType ? ' active' : ''));
            })(buttons[i]);
        }

        function toggleStudy(chartType) {
            if (chartType == 3) {
                for (let item of _this.widget.chart().getAllStudies()) {
                    if (item.name === 'Moving Average') {
                        _this.widget.chart().removeEntity(item.id)
                    }
                }
            } else {
                Tv.createStudy(_this.widget);
            }
        }
    }


    /**
     * @@@  earchs 绘制步骤
     *  */

    /**
     * earch dom
     */
    initDept() {
        const domContainer = this.renderer.selectRootElement('#container');
        this.depth = echarts.init(domContainer);
        this.getDepthChartData();
    }

    /**
     * earch **** 初始化
     */
    getDepthChartData() {
        // if (this.echartsList.buy[0] || this.echartsList.sell[0]) {
            this.depthDataS = earchDepthUtil.formatterDepth(this.echartsList);
            this.setOption(this.depthDataS);
        // }
    }

    /**
     * earch 绘制
     * @param data
     */
    setOption(data) {
        this.depth.setOption({
            // 深度图背景色
            backgroundColor: this.isDark === 'Dark' ? '#1C2439' : '#FFFFFF',
            animation: true,
            axisPointer: {
                link: {
                    // yAxisIndex: [0, 1]
                },
                label: {
                    // backgroundColor: "#777"
                }
            },
            grid: earchDepthUtil.getGrid(data),
            tooltip: earchDepthUtil.getToolTip(data, this.isDark, this.precision),
            yAxis: earchDepthUtil.getYAxis(data),
            xAxis: earchDepthUtil.getXAxis(data),
            series: earchDepthUtil.getSeries(data)
        }, true);
        window.onresize = this.depth.resize;
    }

    unLogin() {
		const config = {
			tip: this.translate.instant('common.unLogin'),
			tipKey: this.translate.instant('common.unLoginTip'),
			ok: this.translate.instant('Header.login'),
			callbackSure: () => {
				this.router.navigateByUrl(`/user/login?forward=/trade/${this.symbol}`)
			},
			callbackCancel: () => { },
		};
		this.dialog.createFromComponent(ConterAlertComponent, config)
	}

    /**
     * 选中自选
     * @param type
     */
    check(type) {
        if (this.user.token()) this.checkTicker(this.symbol, type);
        else this.unLogin()
    }

    /**
     * 存储选中的交易对
     * @param ticker
     * @param active
     */
    checkTicker(ticker, active) {
        if(this.isFavStatus){
            this.isFavStatus = false;
            let data = {
                pair: ticker,
                collect: active,
                sig: ''
            };

            const success = (res:any) => {
                this.isFavStatus = true;
                if (res.status == 0) {
                    this.dialog.destroy();
                    this.isfav = !this.isfav;
                    let josn = {
                        type: 'update',
                        data: res.data
                    };
                    this.trickerService.set(josn)
                }else{
                    this.load.tipErrorShow(res.msg)
                }
            };

            const unLockAccount = (res:any) => {
                data.sig = this.auxBt.collectSign(data,res);
                data.sig && this.service.collectPair(data).then( res => { success(res) })
            };

            const close = res => {
                this.isFavStatus = true;
            };

            this.auxBt.regularPwd(unLockAccount, close)
        }

    }


    // /**
    //  * 计算对应usdt的价格
    //  * @param tickerList
    //  */
    // async toUsd(tickerList){
    //     if(!!!this.btcToUsdt) {
    //         this.service.getOkexTime().then( res => {
    //             this.btcToUsdt = res.data.USDT || 1;
    //             this.usdtVal = this.resetData.raleUsdt(this.symbol.split("_")[0],tickerList,1,this.btcToUsdt,this.symbol);
    //         })
    //     }else this.usdtVal = this.resetData.raleUsdt(this.symbol.split("_")[0],tickerList,1,this.btcToUsdt,this.symbol);
    // }

    changeDire(type,direc){
        this[type] = !direc;
        this.scoket.setTileDirection({
            type: type,
            direc: direc
        })
    }

    setMarketShow(){
        if(!this.leftDirec) this.marketShow = true;
    }
}
