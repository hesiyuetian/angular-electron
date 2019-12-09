export interface SelectInterface {
    val: any,
    zhName: any,
    enName: any
}
export interface CountryInterface {
    id: number, 
    zhName: any, 
    enName: any,
    // code: any, 
    // parentCode: null
}

// kyc申请
export interface KycApplyInterface {
    birth: string,  //出生日期
    cardFront: string, //证件正面照ur
    cardNumber: string, //证件号码
    cardOpposite: string,//证件背面照ur 
    country: string,//国家
    documentType: string,//证件类型 0 身份证 1 护照 ,
    firstName: string,//姓 
    gender: string,//性别（0位置，1男，2女）
    lastName: string,//名
    level: string,//级别 0级为未认证；1 一级为KYC认证； 2 二级为普通投资者认证；3 三级为专业/合格投资者认证 
    txid: string,//上链txid 
    handIdentification: string,//手持证件照
    realName: string,//用户姓名
    userId: string,//用户id
    id: string,
}

// 我的投资列表
export interface MyInvestsParamsInterface {
    investUserId: string,
    pageIndex: 1,
    pageSize: 10,
    tokenSymbol: string
}


// 签名信息
export interface SignInfoInterface {
    rondom: string,
    sig: string,
    walletAddress: string,
    type: string
}