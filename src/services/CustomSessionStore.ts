import { SessionData, Store } from 'express-session';
import { generateMySecret } from '../util/KeyGen';
import {Request, Response, NextFunction} from 'express';

export type iSessionData =  {
    uid?:number;
    exp:number;
};

class CustomSessionStore {
    private sessions: { [sid: string]: iSessionData | undefined } = {};
    private maxAge: number = 1000 * 3; // 1 day in milliseconds
    private static myInstance: CustomSessionStore | null = null;
    
    constructor(maxAge: number = 1000 * 3) {
        if (!CustomSessionStore.myInstance) {
            this.maxAge = maxAge;
            CustomSessionStore.myInstance = this;
            this.initCleanup();
        }
        return CustomSessionStore.myInstance;
    }
    private initCleanup() {
        console.log('Starting session cleanup interval');
        setInterval(() => {
            // const time3MinsAgo = new Date(Date.now() - this.maxAge).toISOString(); // get the time 3 minutes ago
            const agoMS = Date.now() - this.maxAge;
            for (const sid in this.sessions) {
                const session = this.sessions[sid] as iSessionData;
                if(session.exp < agoMS){
                    console.log('removing session: ', sid);
                    this.destroy(sid);
                }
            }
        }, this.maxAge);
    }
    generateSessionId(){
        return generateMySecret(32, "api", 16)+crypto.randomUUID();
    }

    get(sid: string) {
        const session = this.sessions[sid];
        if(session){// touch the session
            session.exp = Date.now() + this.maxAge;
            // session._expires = new Date(Date.now() + this.maxAge).toISOString(); // update the expiry time
        }
        return session;
    }
    set(sid: string, session:Record<string, any>) {
        this.sessions[sid] = {...session, exp: Date.now() + this.maxAge};
        return this.sessions[sid];
    }

    private destroy(sid: string): void {
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
                this.updateCookie(req, res, sid);
            }
        }
    }

    // Implement other methods as needed (e.g., touch, all, clear, length)
}

export default CustomSessionStore;