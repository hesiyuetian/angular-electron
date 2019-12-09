import { Injectable } from '@angular/core';
import axiosService from './axios';
import { AuxBtService } from '../../service/aux-bt.service'
import { CONFIG } from './config'

import axios from 'axios'

@Injectable()
export class service {
    static userAddress =   `${CONFIG.apiUrl}/v1/account`;
    static assetAddress =  `${CONFIG.apiUrl}/v1/asset`;
    static ordersAddress = `${CONFIG.apiUrl}/v1/orders`;
    static marketAddress = `${CONFIG.apiUrl}/v1/market`;
    static commonAddress = `${CONFIG.apiUrl}/v1/common`;

    /**
     * Server timestamp
     */
    time: string;

    constructor(
        private auxBt: AuxBtService
    ){

    }

    /**
     * Get Server timestamp
     */
    timestamp() {
        let config = {
            url: `${service.commonAddress}/timestamp`,
            method: "get",
            params: {}
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
                .then((data) => {
                    resolve(data.data);
                    if(data.data.status === 0) this.time = data.data.data.toString()
                })
                .catch()
        })
    }

    /**
     * New Login
     */
    async newLogin(data:any) {
        await this.timestamp();

        const channel = CONFIG.channel;
        let paramsData = {
            timestamp: this.time,
            channel: channel,
            sig: this.auxBt.loginSign(this.time,data.user,channel)
        };
        let config = {
            url: `${service.userAddress}/authorize`,
            method: 'post',
            data: Object.assign(paramsData, data)
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Withdraw
     */
    withdraw(data:object) {
        let config = {
            url: `${service.assetAddress}/withdraw`,
            method: "post",
            data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get coins
     */
    coins(data?:object) {
        let config = {
            url: `${service.commonAddress}/coins`,
            method: "get",
            params: {}
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get pairs
     */
    pairs(data?:object) {
        let config = {
            url: `${service.commonAddress}/pairs`,
            method: "get",
            params: {}
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Create Order
     */
    create(data:object) {
        let config = {
            url: `${service.ordersAddress}/create`,
            method: 'post',
            data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Order History
     */
    list(data:object) {
        let config = {
            url: `${service.ordersAddress}/list`,
            method: 'get',
            params: data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Transaction History
     */
    transactionHistory(data:object) {
        let config = {
            url: `${service.ordersAddress}/trade/history`,
            method: 'get',
            params: data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get All Tickers
     */
    getPairsList(data:object) {
        let config = {
            url: `${service.marketAddress}/tickers`,
            method: 'get',
            params: data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Collect Pair
     */
    collectPair(data:object) {
        let config = {
            url: `${service.userAddress}/collect`,
            method: 'post',
            data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Select Depth
     */
    depthData(data:object) {
        let config = {
            url: `${service.marketAddress}/depth`,
            method: 'get',
            params: data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get Collect Pair
     */
    getCollectPair(data:object) {
        let config = {
            url: `${service.userAddress}/collect/list`,
            method: 'get',
            params: data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Cancel Order
     */
    cancel(data:object) {
        let config = {
            url: `${service.ordersAddress}/cancel`,
            method: 'post',
            data
        };

        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }


    /**
     * Trade List
     */
    tradeList(data:object) {
        let config = {
            url: `${service.ordersAddress}/trade`,
            method: 'get',
            params: data
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Asset List
     */
    assetList() {
        let config = {
            url: `${service.assetAddress}/list`,
            method: 'get',
            params: {}
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get Balance
     */
    getBalance(data:object) {
        let config = {
            url: `${service.assetAddress}/balance`,
            method: 'get',
            params: data
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get faucet
     */
    getFaucet(data:object) {
        let config = {
            url: `${service.assetAddress}/faucet`,
            method: 'get',
            params: data
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Asset Detail
     */
    assetDetail(data:object) {
        let config = {
            url: `${service.assetAddress}/detail`,
            method: 'get',
            params: data
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get Asset History
     */
    assetHistory(data:object) {
        let config = {
            url: `${service.assetAddress}/history`,
            method: 'get',
            params: data
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
            .then((data) => {
                resolve(data.data);
            })
            .catch()
        })
    }

    /**
     * Get Index Notice
     */
    indexNotice(): Promise<any>{
        let config = {
            url: `${service.commonAddress}/indexNotice`,
            method: 'get',
            params: ''
        };
        return new Promise((resolve,reject)=>{
            axiosService(config)
                .then((data) => {
                    resolve(data.data);
                })
                .catch()
        })
    }

    /**
     * Get USDT--->USD Rate
     */
    getUsdtToUsd(){
        return axios.get('https://min-api.cryptocompare.com/data/price', {
            params: {
                fsym: 'USDT',
                tsyms: 'USD',
            }
        })
    }


}
