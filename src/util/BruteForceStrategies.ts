
export enum BruteForceLocksCategory {
    registration, login, confirm, reset

}
const nrAllowedFailedLogins = 3;
const failedLoginTimeout = 10000;

class BruteForceStrategiesClass {
    // return false until time is expired
    private registration:Record<string, number> = {}; //email:time
    private logins:Record<string, number> = {};
    private confirms:Record<string, number> = {};
    private resets:Record<string, number> = {};
    private failedLogins:Record<string, {start:number, nrFails:number}> = {};

    private async waitForMs(ms:number){
        await new Promise((resolve, reject) => {
            //wait for 3 seconds
            setTimeout(resolve, ms);
        });
    }
    
    constructor(){
        setInterval(() => {
            this.cleanFailedLogins(failedLoginTimeout);
        }, 1000 * 60 * 10); //every 10 minutes
    }
    private async cleanFailedLogins(secs:number){
        const now = Date.now();
        for (const email in this.failedLogins) {
            const failData = this.failedLogins[email];
            if(now - failData.start > secs){
                delete this.failedLogins[email];
            }
        }
    }
    addFailedLogin(email: string){
        const failData = this.failedLogins[email];
        if(failData){
            if(Date.now() - failData.start > failedLoginTimeout){
                failData.start = Date.now();
                failData.nrFails = 1;
            }else{
                failData.nrFails++;
            }
            if(failData.nrFails > nrAllowedFailedLogins){
                return false;
            }
        }else{
            this.failedLogins[email] = {start:Date.now(), nrFails:1};
        }
        return true;
    }

    async isLockedOutElseWait(key: string, category: BruteForceLocksCategory, ms = 5000): Promise<boolean> {
        const now = Date.now();
        let table = this.resets;
        // const table = category === BruteForceLocksCategory.registration ? this.registration : (category == BruteForceLocksCategory.login) ? this.logins : this.confirms;
        switch(category){
            case BruteForceLocksCategory.registration:
                table = this.registration;
                break;
            case BruteForceLocksCategory.login:
                table = this.logins;
                break;
            case BruteForceLocksCategory.confirm:
                table = this.confirms;
                break;
            // case BruteForceLocksCategory.reset:
            //     table = this.resets;
            //     break;
        }
        const lock = table[key];
        const isLocked = lock ? now < lock : false;
        if(isLocked){
            return true;
        }else{
            table[key] = Date.now() + ms;
            await this.waitForMs(ms);
            delete table[key];
            return false;
        }
    }
}
const BruteForceStrategies = new BruteForceStrategiesClass();
export default BruteForceStrategies;