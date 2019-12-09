export class TV {
    constructor(
    ){
    }

    /**
     *  配置不显示元素
     */
    getDisFeatures() {
        return [
            'volume_force_overlay',
            'header_undo_redo',
            'header_symbol_search',
            'go_to_date',
            'header_compare',
            // 全屏
            'header_fullscreen_button',
            'use_localstorage_for_settings',
            // 设置图标
            'header_settings',
            // 照相机
            'header_screenshot',
        ];
    }

    /**
     *  配置显示元素
     */
    getEnFeature() {
        return [
            //  图表类型
            'header_chart_type',
            //  logo位置上移
            // 'move_logo_to_main_pane',
            'header_resolutions',

            'adaptive_logo',
            'left_toolbar',
            'hide_left_toolbar_by_default',
            'header_widget',
            'dont_show_boolean_study_arguments',
            'hide_last_na_study_output',
            'same_data_requery',
            'side_toolbar_in_fullscreen_mode',

            'disable_resolution_rebuild',
            "use_localstorage_for_settings",
            "remove_library_container_border",
            "save_chart_properties_to_local_storage",
            "constraint_dialogs_movement",
        ];
    }

    /**
     * 创建均线
     */
    createStudy(widget){
        widget.chart().createStudy('Moving Average', false, false, [5], null, { 'Plot.color': 'rgb(150, 95, 196)' });
        widget.chart().createStudy('Moving Average', false, false, [10], null, { 'Plot.color': 'rgb(116,149,187)' });
        widget.chart().createStudy('Moving Average', false, false, [20], null, { "plot.color": "rgb(58,113,74)" });
        widget.chart().createStudy('Moving Average', false, false, [30], null, { "plot.color": "rgb(118,32,99)" });
    }

    /**
     * k线主题样式
     * @theme 皮肤
     */
    getOverrides(theme){
        var themes = {
            "Light": {
                areatop: "rgba(71, 78, 112, 0.1)",
                areadown: "rgba(71, 78, 112, 0.02)",
                areaLine: "rgba(71, 78, 112, 0.5)",
                volumeSell: "rgba(239,112,89,1)",
                volumeBuy: "rgba(70,193,127,1)",
                volumeSellR: "rgba(239,112,89,.3)",
                volumeBuyR: "rgba(70,193,127,.3)",
                background: "#fff",
                candleStyleUpColor: '#4181FF',
                verColor: 'rgba(243,244,245,.9)',
                horColor: 'rgba(243,244,245,.9)',
                textColor: "rgba(102,114,132,.4)",
                lineColor: 'rgba(243,244,245,1)',
                crossHairColor: 'rgba(65,129,255,.8)'
            },

            "Dark": {
                areatop: "rgba(249,241,241, 0.1)",
                areadown: "rgba(249,241,241, 0.02)",
                areaLine: "rgba(249,241,241, 0.5)",
                volumeSell: "rgba(255,74,118,1)",
                volumeBuy: "rgba(67,237,186,1)",
                volumeSellR: "rgba(255,74,118,.3)",
                volumeBuyR: "rgba(67,237,186,.3)",
                background: "#1C2439",
                candleStyleUpColor: '#4181FF',
                verColor: 'rgba(44,56,83,.8)',
                horColor: 'rgba(44,56,83,.8)',
                textColor: "rgba(169,189,230,.8)",
                lineColor: 'rgba(44,56,83,1)',
                crossHairColor: 'rgba(255, 255, 255,.2)'
            }
        };
        var t = themes[theme];

        return {
            'dark_studies_overrides': {
                "volume.volume.color.0": t.volumeSellR,
                "volume.volume.color.1": t.volumeBuyR,
                "volume.volume.transparency": 12,
                "MA Cross.short:plot.color": "rgba(255,255,255,1)",
                "MA Cross.long:plot.color": "rgba(255,255,255,1)",
            },

            // 更改蜡烛图显示
            'dark_overrides': {

                'scalesProperties.showLeftScale': false,
                "volumePaneSize": "medium",

                "paneProperties.background": t.background,

                // 面积图
                "mainSeriesProperties.areaStyle.color1": t.areatop,
                "mainSeriesProperties.areaStyle.color2": t.areadown,
                "mainSeriesProperties.areaStyle.linecolor": t.areaLine,
                "mainSeriesProperties.areaStyle.linewidth": 1,
                "mainSeriesProperties.areaStyle.priceSource": "close",

                // 网格
                'paneProperties.vertGridProperties.style': 0,
                'paneProperties.horzGridProperties.style': 0,
                "paneProperties.vertGridProperties.color": t.verColor,
                "paneProperties.horzGridProperties.color": t.horColor,

                // 坐标轴和刻度标签颜色
                "scalesProperties.textColor": t.textColor, //标注的字体色
                "paneProperties.legendProperties.showLegend": false,
                "scalesProperties.lineColor": t.lineColor,//刻度线颜色
                //'paneProperties.topMargin': 20,

                "mainSeriesProperties.candleStyle.downColor": t.volumeSell,  // K线 sell颜色
                'mainSeriesProperties.candleStyle.upColor': t.volumeBuy, // K线 buy颜色
                "mainSeriesProperties.candleStyle.drawWick": true,
                "mainSeriesProperties.candleStyle.drawBorder": true,
                "mainSeriesProperties.candleStyle.borderUpColor": t.volumeBuy,
                "mainSeriesProperties.candleStyle.borderDownColor": t.volumeSell,

                // 烛心颜色
                "mainSeriesProperties.candleStyle.wickUpColor": t.volumeBuy,
                "mainSeriesProperties.candleStyle.wickDownColor": t.volumeSell,

                "mainSeriesProperties.candleStyle.barColorsOnPrevClose": false, //

                'paneProperties.crossHairProperties.color': t.crossHairColor, // 十字线颜色.

                "paneProperties.legendProperties.showStudyArguments": true,
                "paneProperties.legendProperties.showStudyTitles": true,
                "paneProperties.legendProperties.showStudyValues": true,
                "paneProperties.legendProperties.showSeriesTitle": true,
                "paneProperties.legendProperties.showSeriesOHLC": true,
                "mainSeriesProperties.candleStyle.borderColor": "#4e5b85",
                "mainSeriesProperties.hollowCandleStyle.upColor": "#589065",
                "mainSeriesProperties.hollowCandleStyle.downColor": "#ae4e54",
                "mainSeriesProperties.hollowCandleStyle.drawWick": true,
                "mainSeriesProperties.hollowCandleStyle.drawBorder": true,
                "mainSeriesProperties.hollowCandleStyle.borderColor": "#4e5b85",
                "mainSeriesProperties.hollowCandleStyle.borderUpColor": "#589065",
                "mainSeriesProperties.hollowCandleStyle.borderDownColor": "#ae4e54",
                "mainSeriesProperties.haStyle.upColor": "#589065",
                "mainSeriesProperties.haStyle.downColor": "#ae4e54",
                "mainSeriesProperties.haStyle.drawWick": true,
                "mainSeriesProperties.haStyle.drawBorder": true,
                "mainSeriesProperties.haStyle.borderColor": "#4e5b85",
                "mainSeriesProperties.haStyle.borderUpColor": "#589065",
                "mainSeriesProperties.haStyle.borderDownColor": "#ae4e54",
                "mainSeriesProperties.haStyle.wickColor": "#4e5b85",
                "mainSeriesProperties.haStyle.barColorsOnPrevClose": false,
                "mainSeriesProperties.barStyle.upColor": "#589065",
                "mainSeriesProperties.barStyle.downColor": "#ae4e54",
                "mainSeriesProperties.barStyle.barColorsOnPrevClose": false,
                "mainSeriesProperties.barStyle.dontDrawOpen": false,
                "mainSeriesProperties.lineStyle.color": "#4e5b85",
                "mainSeriesProperties.lineStyle.linewidth": 1,
                "mainSeriesProperties.lineStyle.priceSource": "close",

                "mainSeriesProperties.style": 1,
                "mainSeriesProperties.showPriceLine": true,
                "symbolWatermarkProperties.transparency": 100,
                "TradingView.PaneRendererColumns": 1,
                "scalesProperties.showSeriesLastValue": true,//当前价
                "scalesProperties.showRightScale": true,
            }
        }
    }
}
