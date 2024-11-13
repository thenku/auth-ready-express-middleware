import { Response } from "express";
import mkErrorResponse from "../middlewares/mkResponse";


class BruteForceStrategiesClass {
    // return false until time is expired
    private registration:Record<string, number> = {}; //email:time
    private logins:Record<string, number> = {}; //email:time

    private async waitForMs(ms:number){
        await new Promise((resolve, reject) => {
            //wait for 3 seconds
            setTimeout(resolve, ms);
        });
    }
    isRegistrationLocked(email: string): boolean {
        const now = Date.now();
        const registration = this.registration[email];
        if(registration){
            return now < registration;
        }
        return false;
    }
    async lockRegistrationOut(email: string, ms:number) {
        this.registration[email] = Date.now() + ms;
        await this.waitForMs(ms);
        delete this.registration[email];
    }
    isLoginLocked(email: string): boolean {
        const now = Date.now();
        const login = this.logins[email];
        if(login){
            return now < login;
        }
        return false;
    }
    async lockLoginOut(email: string, ms:number) {
        this.logins[email] = Date.now() + ms;
        await this.waitForMs(ms);
        delete this.logins[email];
    }

}
const BruteForceStrategies = new BruteForceStrategiesClass();
export default BruteForceStrategies;