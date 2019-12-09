import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js'

@Injectable()
export class secret{
    key: any = CryptoJS.enc.Utf8.parse("apriDay-dept>*(<");
    iv: any = CryptoJS.enc.Utf8.parse('tKvIgd;tci49Qxf,');
    constructor(
    ){

    }

    /**
     * 解密
     */
    decrypt(word:any) {
        let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
        let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        let decrypt = CryptoJS.AES.decrypt(srcs, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
    }

    /**
     * 加密
     * @param word
     */
    encrypt(word:any) {
        let srcs = CryptoJS.enc.Utf8.parse(word);
        let encrypted = CryptoJS.AES.encrypt(srcs, this.key, { iv: this.iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        return encrypted.ciphertext.toString().toUpperCase();
    }
}
