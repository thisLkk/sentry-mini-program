import { SDK_TAG } from "../meta-info/constants";

export class LogLevel {
    public static INFO = "INFO";
    public static ERROR = "ERROR";
    public static WARN = "WARN";
    public static WATCH = "WATCH";
}

export class Logger {
    private static namespace = 'Logger';
    public static DEBUG_LOG: boolean = true;
    public static init(enableLog: boolean) {
        this.DEBUG_LOG = enableLog
    }
    public static log(msg: string | any, subst: any[]): void {
        this.logInner(msg, LogLevel.INFO, subst)
    }
    public static logE(msg: string | any, subst: any[]): void {
        this.logInner(msg, LogLevel.ERROR, subst)
    }
    private static logInner(msg: string | any, level: string, subst: any[] = []) {
        // let timeStr = this.getDateString();
        let log = `【*${SDK_TAG}* [${level}]】${msg} ==>`
        // if (subst && subst.length > 0) {
        //     subst.forEach(element => {
        //         if (element instanceof Error) {
        //             log += " " + ` name = ${element.name}, msg = ${element.message}, stack = ${element.stack}`
        //         } else {
        //             log += " " + element
        //         }
        //     });
        // }
        
        if (this.DEBUG_LOG) {
            console.log(log, ...subst)
        }
    }
    static getDateString(): string {
        let date = new Date();
        let str = date.getHours() + "";
        let timeStr = "";
        timeStr += (str.length === 1 ? ("0" + str) : str) + ":";

        str = date.getMinutes() + "";
        timeStr += (str.length === 1 ? ("0" + str) : str) + ":";

        str = date.getSeconds() + "";
        timeStr += (str.length === 1 ? ("0" + str) : str) + ".";

        str = date.getMilliseconds() + "";
        if (str.length === 1) str = "00" + str;
        if (str.length === 2) str = "0" + str;
        timeStr += str;

        timeStr = '[' + timeStr + ']';

        return timeStr;
    }
}