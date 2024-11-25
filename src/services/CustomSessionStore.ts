import {Request, Response, NextFunction} from 'express';
import KeyGen from '../util/KeyGen';
import {printMsg} from 'test-npm-module';

printMsg('CustomSessionStore.ts');

export type iSessionData =  {
    exp:number;
    uid?:string;
    ip?:string;
};

class CustomSessionStore {
    private sessions: { [sid: string]: iSessionData | undefined } = {};
    private maxAge: number = 0;
    private minAge: number = 1000 * 60 * 2; // 2 minutes in milliseconds
    private static myInstance: CustomSessionStore | null = null;
    
    constructor(maxAge: number = 1000 * 60 * 3) {
        if (!CustomSessionStore.myInstance) {
            if(maxAge < this.minAge){
                this.maxAge = this.minAge;
            }else{
                this.maxAge = maxAge;
            }
            CustomSessionStore.myInstance = this;
            this.initCleanup();
        }
        return CustomSessionStore.myInstance;
    }
    private initCleanup() {
        console.log('Starting session cleanup interval');
        setInterval(() => {
            const agoMS = Date.now() - this.maxAge;
            const keys = Object.keys(this.sessions);
            let count = keys.length;
            while (count--) {
                const sid = keys[count];
                const session = this.sessions[sid] as iSessionData;
                if(session.exp < agoMS){
                    this.destroy(sid);
                    console.log('removed sid: ', sid);
                }
            }
        }, this.minAge);
    }
    generateSessionId(){
        return KeyGen.generateMySecret(32, "api", 16)+crypto.randomUUID();
    }

    get(sid: string) {
        const session = this.sessions[sid];
        if(session){// touch the session
            session.exp = Date.now() + this.maxAge;
            // session._expires = new Date(Date.now() + this.maxAge).toISOString(); // update the expiry time
        }
        return session;
    }
    set(sid: string, session:Partial<iSessionData>) {
        this.sessions[sid] = {...session, exp: Date.now() + this.maxAge};
        return this.sessions[sid];
    }

    destroy(sid: string): void {
        delete this.sessions[sid];
    }
    updateCookie = (req:Request, res:Response, sid:string) => {
        req.sessionID = sid;
        res.cookie('sid', sid, {
            httpOnly: true, // can't be accessed with document.cookie
            maxAge:this.maxAge,
            sameSite: true,
            // expires: new Date(Date.now() + maxAge),
            secure: true // Set to true if using HTTPS at browser level
        });
    }
    refreshSession = (req:Request, res:Response) => {
        let sid:string = req.cookies.sid;
        if(sid){
            const session = this.get(sid);
            if(session){
                req.session = this.get(sid) as any;
                console.log("Refreshing Session: ", req.session);
                this.updateCookie(req, res, sid);
            }
        }
    }
    // Implement other methods as needed (e.g., touch, all, clear, length)
}

export default CustomSessionStore;