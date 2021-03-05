enum Modes_1 {
    //% block="前进"
    前进,
    //% block="后退"
    后退,
    //% block="左转"
    左转,
    //% block="右转"
    右转,
    //% block="左移"
    左移,
    //% block="右移"
    右移           
}

enum Modes_2{
    //% block="左摆"
    左摆,
    //% block="右摆"
    右摆,
    //% block="俯视"
    俯视,
    //% block="仰视"
    仰视,
    //% block="航线角"
    航向角       
}

enum Speed{
    //% block="1"
    快 ,
    //% block="中"
    中 ,
    //% block="慢"
    慢 ,
    //% block="停"
    停        
}

let zz =0;

let data_tx = pins.createBuffer(38);
let gait_mode = 0;
let rc_spd_cmd_X = 0.00 //x速度
let rc_spd_cmd_y = 0.00 //y速度
let rc_att_rate_cmd = 0.00 // 速度
let rc_spd_cmd_z = 0.00 //
let rc_pos_cmd = 0.00 //高度
let rc_att_cmd_x = 0.00 //俯仰
let rc_att_cmd_y = 0.00 //侧摆
let rc_att_cmd = 0.00 //航向角
let usb_send_cnt = 0 
let state = 0

// let GAIT_IDLE = 0
// let GAIT_TROT = 1
// let GAIT_FTROT = 2
// let GAIT_ST_RC = 4
// let GAIT_ST_IMU = 5
// let GAIT_ST_PUSH = 6
// let GAIT_RECOVER = 7

// let M_SAFE = 0
// let M_STAND_RC = 1
// let M_STAND_IMU = 2
// let M_STAND_PUSH = 3
// let M_TROT = 4
// let M_F_TROT = 5
// let M_WALK = 6
// let M_RECOVER = 7

// //状态判断
// function Set_gait_mode(M:number){
//     let set_mode = 0
    
//     switch(M){
//         case GAIT_IDLE:gait_mode = 0;set_mode = M_SAFE;break;
//         case GAIT_TROT:gait_mode = 1;set_mode = M_TROT;break;
//         case GAIT_FTROT:gait_mode = 2;set_mode = M_F_TROT;break;
//         case GAIT_ST_RC:gait_mode = 4;set_mode = M_STAND_RC;break;
//         case GAIT_ST_IMU:gait_mode = 5;set_mode = M_STAND_IMU;break;
//         case GAIT_ST_PUSH:gait_mode = 6;set_mode = M_STAND_PUSH;break;
//         case GAIT_RECOVER:gait_mode = 7;set_mode = M_RECOVER;break;
//     }
//     Data_RX()
//     Data_RX()
//     //basic.showNumber(set_mode)
//     if(set_mode == robot_mode){
//         return 1
//     }else{
//         return 0
//     }
// }
//---------------------------------------TX------------------------------------------------
//发送数据初始化
    function Data_init(){
        for(let i =0;i<38;i++){
            data_tx[i] = 0x00
        }
    }

//数据发送
    function Data_send(){
        let i =0;
        let cnt_reg = 0;
        let sum = 0x00;
        usb_send_cnt = cnt_reg
        data_tx[usb_send_cnt++] = 0xCA
        data_tx[usb_send_cnt++] = 0xCF
        data_tx[usb_send_cnt++] = 0x93
        data_tx[usb_send_cnt++] = 0x21

        data_tx[usb_send_cnt++] = gait_mode     
        get_float_hex(rc_spd_cmd_X)
        get_float_hex(rc_spd_cmd_y)
        get_float_hex(rc_att_rate_cmd)
        get_float_hex(rc_spd_cmd_z)
        get_float_hex(rc_pos_cmd)
        get_float_hex(rc_att_cmd_x)
        get_float_hex(rc_att_cmd_y)
        get_float_hex(rc_att_cmd)
        for(i = 0 ;i < usb_send_cnt;i++){
            sum += data_tx[i]
        }
        data_tx[usb_send_cnt] = sum
        if(state == 1){
            serial.writeBuffer(data_tx)
        }
        // basic.pause(100)
    }

//-----------------------浮点数转十六进制--------------------------------
function DecToBinTail(dec:number, pad:number)
{
    let bin = "";
    let i;
    for (i = 0; i < pad; i++)
    {
        dec *= 2;
        if (dec>= 1)
        {
            dec -= 1;
            bin += "1";
        }
        else
        {
            bin += "0";
        }
    }
    return bin;
}

function DecToBinHead(dec:number, pad:number)
{
    let bin="";
    let i;
    for (i = 0; i < pad; i++)
    {
        bin = parseInt((dec % 2).toString()) + bin;
        dec /= 2;
    }
    return bin;
}    

function get_float_hex(decString:number)
{
    let dec = decString;
    let sign;
    let signString;
    let decValue = parseFloat(Math.abs(decString).toString());
    let fraction = 0;
    let exponent = 0;
    let ssss = []
    

    if (decString.toString().charAt(0) == '-')
    {
        sign = 1;
        signString = "1";
    }
    else
    {
        sign = 0;
        signString = "0";
    }
    if (decValue==0)
    {
        fraction = 0;
        exponent = 0;
    }
    else
    {
        exponent = 127;
        if (decValue>=2)
        {
            while (decValue>=2)
            {
                exponent++;
                decValue /= 2;
            }
        }
        else if (decValue<1)
        {
            while (decValue < 1)
            {
                exponent--;
                decValue *= 2;
                if (exponent ==0)
                    break;
            }
        }
        if (exponent!=0) decValue-=1; else decValue /= 2;

    }
    let fractionString = DecToBinTail(decValue, 23);
    let exponentString = DecToBinHead(exponent, 8);
    //return right('00000000'+(parseInt(signString + exponentString + fractionString, 2).toString()),8);
    let ss11 = parseInt(signString + exponentString + fractionString, 2)
    data_tx[usb_send_cnt++] = ((ss11 << 24) >> 24) 
    data_tx[usb_send_cnt++] = ((ss11 << 16) >> 24)
    data_tx[usb_send_cnt++] = ((ss11 << 8) >> 24)
    data_tx[usb_send_cnt++] = ((ss11 >> 24) )
       // ss11 = ss11.toString(16)
    //return  parseInt(signString + exponentString + fractionString, 2).toString()
    // data_ss[0] = ((ss11 << 24) >> 24)
    // data_ss[1] = ((ss11 << 16) >> 24)
    // data_ss[2] = ((ss11 << 8) >> 24)
    // data_ss[3] = ((ss11 >> 24))
    //serial.writeNumber()
   // data_ss[4] = 0xAA
   // serial.writeBuffer(data_ss)
    // return  parseInt(signString + exponentString + fractionString, 2)
}

//-------------------------------------RX------------------------------------------------
let data_RX = pins.createBuffer(200);
let data_s = pins.createBuffer(200);
let rx_s = 0
let len_s = 0
let s = 1
let anal_cnt = 0 
let robot_mode = 0 
serial.setRxBufferSize(1000)

let state_sdk = 0
let tmie_1 = 0.0000
//数据解析
function uart_anal(data_h:any){
   if(rx_s ==0 && data_h == 0xBA){
       rx_s =1;
       data_s[0] =  data_h

   }
   else
   if(rx_s ==1 && data_h == 0xBF){
        rx_s =2;
        data_s[1] =  data_h
   }
    else
   if(rx_s ==2 && data_h >0 && data_h<0xF1){
        rx_s =3;
        data_s[2] =  data_h
   }
      else
   if(rx_s ==3 && data_h < 255){
       rx_s = 4
       data_s[3] =  data_h
       len_s = data_h
       s = 0;
   }
    else
   if(rx_s ==4 && len_s > 0){
       len_s --;
      // serial.writeNumber(len_s)
       data_s[4 + s++] =  data_h
       //serial.writeNumber(s)
       if(len_s == 0 )
            rx_s = 5
   }
    else
   if(rx_s ==5){
      rx_s = 0 
      data_s[4 + s] =  data_h
      //serial.writeBuffer(data_s)
     // serial.writeNumber(1111)
    // basic.showIcon(IconNames.Yes)
    
    // basic.showNumber(zz)
    // zz = zz + 1

    decode(data_s)
   }       
}
function floatFromDataf(data_f:Buffer,len1:number){
    anal_cnt += 4
}

//
function decode(S: Buffer){
   // basic.showNumber(1)  
    anal_cnt = 4
    if(S[2] == 0x92){
        for(let i =0 ;i<23;i++)
            anal_cnt += 4
        anal_cnt += 1
        robot_mode = S[anal_cnt]
        // if(robot_mode>=0 && robot_mode<=10){
        //     return
        // } 
        // else{
        //     Data_RX()
        // }    
       // basic.showNumber(anal_cnt)
    //    if(robot_mode == 1)
    //         gait_mode  = 1
        
    }
}

//数据接收
function Data_RX(){
    let data_rx
    data_rx = serial.readBuffer(0)
    for (let i = 0; i <= 200; i++) {
        uart_anal(data_rx[i])
    }
}




//% weight=100 color=#0fbb12 icon=""
namespace MOCO_12 {

    /**
     * TODO: 小狗运动控制
     * @param e 模式
     */
    //% block=MOCO_12.小狗运动 block="小狗运动|模式 %M|速度（0.00-10.00）%S|时间（ms）%T"
    //% S.min=0.00 S.max = 10.00
    export function 小狗运动(M: Modes_1,S:number,T:number): void {
        let Sum_S = 0.00
        Sum_S = S / 100.00
        switch(M){
            case Modes_1.前进:
                            rc_spd_cmd_X = Sum_S;break;
            case Modes_1.后退:
                            rc_spd_cmd_X = (-Sum_S);break;
            case Modes_1.左转:
                            rc_att_rate_cmd = (S*10);break;
            case Modes_1.右转:
                            rc_att_rate_cmd = (-S*10);break;
            case Modes_1.左移:
                            rc_spd_cmd_y = Sum_S;break;
            case Modes_1.右移:
                            rc_spd_cmd_y = (-Sum_S);break;                                                                               
        }
        for(let e =0 ;e<T;e++){
            Data_RX()
            Data_send()
            basic.pause(100)
        }
    }

    /**
     * TODO: 小狗运动角度
     * @param e 模式
     */
    //% block=MOCO_12.小狗运动角度 block="小狗运动角度|模式 %M|速度（0.00-10.00）%S|时间（ms）%T"
    //% S.min=0.00 S.max = 10.00
    export function 小狗运动角度(M: Modes_2,S:number,T:number): void {
        switch(M){
            case Modes_2.俯视:
                            rc_att_cmd_x = S;break;  
            case Modes_2.仰视:
                            rc_att_cmd_x = S;break;
            case Modes_2.左摆:
                            rc_att_cmd_y = S;break;
            case Modes_2.右摆:
                            rc_att_cmd_y = S;break;
            case Modes_2.航向角:
                            rc_att_cmd = S;break;                                                                               
        }
        for(let e =0 ;e<T;e++){
            Data_RX()
            Data_send()
            basic.pause(1)
        }
    }

    /**
     * TODO: 小狗运动启动
     * @param e 模式
     */
    //% block
    export function 小狗启动(): void {
        gait_mode  = 4 
        rc_pos_cmd = 0.1
        state = 1
        basic.pause(3000)
        for(let i =0 ;i<15;i++){
                Data_send();
                basic.pause(100)
            }
        while(1){
            Data_RX();
            if(robot_mode == 1)    
                return
            Data_send();
        }
    }

    /**
     * TODO: 小狗运动启动
     * @param e 模式
     */
    //% block
    export function 小狗原地站立(): void {
        let i =0
        if(robot_mode == 1)
            return
        gait_mode = 5
        Data_send()
        while(1){
            Data_RX()
            if(robot_mode == 2){
                gait_mode = 4
                i= 1
                Data_send()
                Data_RX()
            }
            if(robot_mode == 1 && i == 1){
                return
            } 
            Data_send()
        }

    }

    /**
     * TODO: 小狗断电
     * @param e 模式
     */
    //% block
    export function 小狗断电(): void {
        let i =0
        gait_mode = 5
        Data_send()
        while(1){
            Data_RX()
            if(robot_mode == 2){
                 gait_mode = 4
                 i = 1
                 Data_send()
                 Data_RX()
                 }     
            if(robot_mode == 1 && i == 1){
                rc_pos_cmd = 0.00
                for(let w = 0;w < 15;w++){
                    Data_send()
                    Data_RX()
                    basic.pause(100)        
                }
                return
            }    
            Data_send()    
        }     
    }    

    /**
     * TODO: 小狗高度H
     * @param H 0.00-0.1
     */
    //% block=MOCO_12.小狗高度 block="小狗高度|（0.00-10.00）%H"
    //% H.min=0.00 H.max = 10.00 
    export function 小狗高度(H:number): void {
        let Sum_H = 0.000
        Sum_H = H / 100.00
        rc_pos_cmd = Sum_H
        Data_send();
    }

    /**
     * TODO: 小狗运动启动
     * @param e
     */
    //% block
    export function 小狗踏步(): void {
        gait_mode = 1
        while(1){
            Data_RX()
            Data_send()    
            if(robot_mode == 4)
                return
            }
    }




    /**
     * TODO: 小狗运动控制
     * @param e 模式
     */
    //% block
    export function 测试(t:number): void {
        // let ss = DecToBinTail(0.1,23);
        // let sss = DecToBinHead(170 ,8)
        // data_ss [0] = 0x00 
        // get_float_hex(1.0)
        // serial.writeString(ss1)
        // serial.writeNumber(ss1)
        // data_ss[4] = 0xAA
        // serial.writeBuffer(data_ss)

        // Data_init();
        // gait_mode  = 4 
        // rc_pos_cmd = 0.1
        // Data_send();
        
        
        // gait_mode  = 4 
        // rc_pos_cmd = 0.1
        // state = 1
        // Data_send();
        // Data_RX()
    Data_RX();
    switch(state_sdk){
        case 0 :rc_pos_cmd =0.1
                tmie_1 += 0.0025
                Data_send();
                if(tmie_1 > 2.5){
                    state_sdk ++
                }
                break;
        case 1 :
                gait_mode  = 4
                Data_send();
                if(robot_mode == 1){
                  state_sdk ++  
                  tmie_1 = 0;
                }
                break;
        case 2 :
                tmie_1 += 0.0025
                Data_send();
                if(tmie_1>1.5){
                    gait_mode  = 1
                    if(robot_mode == 4){
                        state_sdk ++  
                        tmie_1 = 0;
                    }
                }
                break;


    }
    Data_send();
    }
}
