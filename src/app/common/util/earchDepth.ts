import BigNumber from 'bignumber.js';
import { User } from './user';
import {SortPipe} from '../../pipes/sort.pipe';

const user = new User();
export class EarchDepth {
    constructor() {
    }

    getGrid(data) {
        return [
            {
                bottom: 20,
                left: '52%',
                height: '85%',
                right: 0,
                width: '48%'
            },
            {
                bottom: 20,
                left: '0%',
                right: 0,
                height: '85%',
                width: '48%'
            }
        ];
    }

    getYAxis(data) {
        return [
            {
                show: false,
                type: 'value',
                gridIndex: 0,
                scale: true,
                position: 'right',
                min: 0,
                minInterval: 'auto',
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        // 坐标轴颜色
                        color: '#4E5474'
                    }
                },
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                // 辅助线
                axisPointer: {
                    show: false,
                    lineStyle: {
                        color: '#2A2C35',
                        type: 'dotted'
                    }
                },
                axisTick: {
                    show: true
                },
                axisLabel: {
                    show: true,
                    inside: false
                    // color: 'red'
                },
                max: data.maxAmount
            },
            {
                show: false,
                position: 'left',
                type: 'value',
                gridIndex: 1,
                scale: true,
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        // 坐标轴颜色
                        color: '#c2c2c2'
                    }
                },
                // 辅助线
                axisPointer: {
                    show: false,
                    lineStyle: {
                        color: '#2A2C35',
                        type: 'dotted'
                    }
                },
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false
                },
                min: 0,
                max: data.maxAmount
            }
        ];
    }

    getXAxis(data) {
        return [
            {
                show: true,
                type: 'category',
                gridIndex: 0,
                data: data.sellPrices,
                boundaryGap: false,
                splitArea: {
                    show: false
                },
                splitLine: {
                    show: false,
                    lineStyle: {
                        color: '#AE3D42',
                        type: 'dotted'
                    }
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: 'none'
                    }
                },
                // 辅助线
                axisPointer: {
                    // show: false,
                    lineStyle: {
                        color: '#2A2C35',
                        type: 'dotted'
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: true,
                    margin: 8,
                    showMinLabel: true,
                    showMaxLabel: true,
                    interval: 'auto',
                    // 价格字体颜色
                    color: '#c2c2c2',
                    fontSize: 10,
                    verticalAlign: 'middle',
                    textStyle: {
                        align: 'left'
                    }
                }
            },
            {
                show: true,
                type: 'category',
                gridIndex: 1,
                data: data.buyPrices,
                boundaryGap: false,
                splitArea: {
                    show: false
                },
                splitLine: {
                    lineStyle: {
                        color: '#37404b',
                        type: 'dotted'
                    }
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: 'none'
                    }
                },
                // 辅助线
                axisPointer: {
                    // show: false,
                    lineStyle: {
                        color: '#2A2C35',
                        type: 'dotted'
                    }
                },
                axisTick: {
                    show: false
                },
                inverse: true,
                axisLabel: {
                    show: true,
                    margin: 8,
                    showMinLabel: true,
                    showMaxLabel: true,
                    interval: 'auto',
                    color: '#c2c2c2',
                    fontSize: 10,
                    verticalAlign: 'middle',
                    textStyle: {
                        align: 'right'
                    }
                }
            }
        ];
    }

    getSeries(data) {
        return [
            {
                name: 'sell',
                type: 'line',
                areaStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: 'rgba(239,112,89,.8)'
                                },
                                {
                                    offset: 0.2,
                                    color: 'rgba(239,112,89,.4)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(239,112,89,.1)'
                                }
                            ]
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#ff4a76'
                    }
                },
                step: 'end',
                data: data.sellAmounts,
                smooth: false,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        width: 1,
                        color: 'rgba(255,111,121,.5)',
                        opacity: 9
                    }
                },
                xAxisIndex: 0,
                yAxisIndex: 0
            },
            {
                name: 'buy',
                type: 'line',
                areaStyle: {
                    normal: {
                        color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                {
                                    offset: 0,
                                    color: 'rgba(70,193,127,.8)'
                                },
                                {
                                    offset: 0.2,
                                    color: 'rgba(70,193,127,.4)'
                                },
                                {
                                    offset: 1,
                                    color: 'rgba(70,193,127,.1)'
                                }
                            ]
                        }
                    }
                },
                itemStyle: {
                    normal: {
                        color: '#43edba'
                    }
                },
                step: 'end',
                data: data.buyAmounts,
                smooth: false,
                showSymbol: false,
                lineStyle: {
                    normal: {
                        width: 1,
                        color: 'rgba(0,195,179,.5)',
                        opacity: 9
                    }
                },
                xAxisIndex: 1,
                yAxisIndex: 1
            }
        ];
    }


    /**
     *
     * @data  深度数据
     * @isDark  主题，true: 深色主题  false: 浅色主题
     * @precision  精度数据
     */
    getToolTip(data,isDark,precision) {
        const self = this;
        return {
            trigger: 'axis',
            animation: false,
            axisPointer: {
                type: 'cross',
                link: { xAxisIndex: 'all' }
            },
            backgroundColor: 'rgba(245, 245, 245, 0.5)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 10,
            textStyle: {
                color: isDark ? '#fff' : '#002257'
            },
            extraCssText: 'background:#252332;border:0;color:#ffffff;opacity: 0.7;font-size:12px;',
            formatter: function (param) {
                param = param[0];
                if (param.seriesName === 'sell') {
                    return [
                        '<div style="text-align:left">',
                        '<div style="width:6px;height:6px;background:#AE3D42;border-radius:4px;' +
                        'float:left;margin-top:8px;margin-right:2px;"></div>' +
                        `${user.getItem('language') === 'zh' ? '卖出价格: ' : 'Sell price: '}` +
                        new BigNumber(param.axisValue).toFixed(precision.pricePrecision) +
                        '<br/>',
                        '<div style="width:10px;height:6px;background:#AE3D42;border-radius:4px;' +
                        'float:left;margin-top:8px;margin-right:2px;"></div>' +
                        `${user.getItem('language') === 'zh' ? '卖出累计: ' : 'Sell ​​cumulative: '}` +
                        new BigNumber(param.data).toFixed(precision.amountPrecision) +
                        '<br/>',
                        '</div>'
                    ].join('');
                } else if (param.seriesName === 'buy') {
                    return [
                        '<div style="text-align:left">',
                        '<div style="width:6px;height:6px;background:#38BC74;border-radius:4px;' +
                        '       float:left;margin-top:8px;margin-right:2px;"></div>' +
                        `${user.getItem('language') === 'zh' ? '买入价格: ' : 'Buy price: '}` +
                        new BigNumber(param.axisValue).toFixed(precision.pricePrecision) +
                        '<br/>',
                        '<div style="width:10px;height:6px;background:#38BC74;border-radius:4px;' +
                        'float:left;margin-top:8px;margin-right:2px;"></div>' +
                        `${user.getItem('language') === 'zh' ? '买入累计: ' : 'Buy cumulative: '}` +
                        new BigNumber(param.data).toFixed(precision.amountPrecision) +
                        '<br/>',
                        '</div>'
                    ].join('');
                }
            }
        }
    }

    /**
     * 深度数据处理
     * @res 深度数据
     */
    formatterDepth(res) {

        const bids = res.buy.sort(new SortPipe().transform('price', true));
        const asks = res.sell.sort(new SortPipe().transform('price', false));

        let bidsTotal = 0;
        let asksTotal = 0;
        let maxBuyPrice = 0;
        let minBuyPrice = 0;
        let maxSellPrice = 0;
        let minSellPrice = 0;
        let buyAmounts = [];
        let sellAmounts = [];
        let buyPrices = [];
        let sellPrices = [];
        let amounts = [];
        let prices = [];
        let datas = [];
        if (Array.isArray(bids) && bids.length > 0) {
            datas = [];
            datas = bids.slice(0, 50);
            amounts = [];
            prices = [];
            for (const buyData of datas) {

                bidsTotal = Number(bidsTotal) + Number(buyData.amount);

                amounts.push(bidsTotal);
                prices.push(buyData.price);
            }
            maxBuyPrice = Math.max.apply(null, prices);
            minBuyPrice = Math.min.apply(null, prices);
            buyAmounts = amounts;
            buyPrices = prices;
        }
        if (Array.isArray(asks) && asks.length > 0) {
            datas = [];
            datas = asks.slice(0, 50);
            amounts = [];
            prices = [];
            for (const sellData of datas) {
                asksTotal = Number(asksTotal) + Number(sellData.amount);
                amounts.push(asksTotal);
                prices.push(sellData.price);
            }
            maxSellPrice = Math.max.apply(null, prices);
            minSellPrice = Math.min.apply(null, prices);
            sellAmounts = amounts;
            sellPrices = prices;
        }
        const priceGap = Number(maxSellPrice) - Number(minBuyPrice);
        const buyPriceGap = Number(maxBuyPrice) - Number(minBuyPrice);
        const sellPriceGap = Number(maxSellPrice) - Number(minSellPrice);
        let buyPercent = buyPriceGap / priceGap;

        if (buyPercent >= 0.75) {
            buyPercent = 0.65;
        }
        if (buyPercent < 0.25) {
            buyPercent = 0.25;
        }

        let sellPercent = sellPriceGap / priceGap;
        if (sellPercent >= 0.75) {
            sellPercent = 0.65;
        }
        if (sellPercent < 0.25) {
            sellPercent = 0.25;
        }
        const maxAmount = Math.max(bidsTotal, asksTotal) || 10;
        return {
            maxAmount,
            maxBuyPrice,
            minBuyPrice,
            maxSellPrice,
            minSellPrice,
            buyAmounts,
            buyPrices,
            sellPrices,
            sellAmounts,
            buyPercent,
            sellPercent
        };
    }
}
