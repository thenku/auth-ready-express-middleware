import { Request, Response, NextFunction } from 'express';
import express, { Router } from "express";
import CustomSessionStore, { iSessionData } from "../services/CustomSessionStore";
import setThrottle from '../middlewares/setThrottle';
import mkErrorResponse from '../middlewares/mkResponse';
import Validator from '../util/FormInputValidator';
import UserManager, { IUser } from '../services/UserManager';
import FormInputModifier from '../util/FormInputModifier';
import BruteForceStrategies from '../util/BruteForceStrategies';

const sessionStore = new CustomSessionStore(); //singleton

const checkAuth = (req: Request, res: Response) => {
    // Check if the user is authenticated
    const session = req.session as unknown as iSessionData;

    if (session && session.uid) {
        return true; // User is authenticated, proceed to the next middleware
    } else {
        return false; // User is not authenticated
    }
};

const registrationLockTimeout = 5000;
const loginLockTimeout = 3000;

export function setMyAuthRoutes(router: Router) {
    router.use(express.json({limit:10240})); // limit the body size to 10kb
    router.use(express.urlencoded({limit:10240})); // limit the body size to 10kb

    setThrottle(router);//generat ip throttle

    router.post('/user/login', async (req, res) => {
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email, password} = cleanBody;

        if(BruteForceStrategies.isLoginLocked(email)){
            console.log("Login locked");
            mkErrorResponse("too_many_requests", res);
            return;
        }else{
            await BruteForceStrategies.lockLoginOut(email, loginLockTimeout);
        }

        if(checkAuth(req, res)){
            res.redirect(307, '/private/user');
        }
        else if(!email || !password){
            mkErrorResponse("unauthorized", res);
        }else{
            const user = UserManager.getUserByEmail(email);
            if(user){
                const {id, active, confirmed} = user;
                if(active && confirmed && await UserManager.verifyPassword(id, password)){
                    console.log("Login: ", cleanBody);
                    const sid = sessionStore.generateSessionId();
                    req.session = sessionStore.set(sid, {uid:id}) as any;
                    sessionStore.updateCookie(req, res, sid);
                    console.log("Session ID: ", sid, req.sessionID);
                    res.status(200).json({message: "Login successful"});
                }else{
                    mkErrorResponse("unauthorized", res);
                }
            }else{
                mkErrorResponse("unauthorized", res);
            }
        }
    });

    router.post('/user/register', async (req:Request, res:Response) => {
        // curl -X POST http://localhost:3000/private/user/register -H "Content-Type: application/json" -d '{ "key": "value" }'
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email, name, postal} = cleanBody;
        
        //what can we use instead of recaptcha? An authenticator app
        //authenticator makes more sense after login.
        if(BruteForceStrategies.isRegistrationLocked(email)){
            console.log("Registration locked");
            mkErrorResponse("too_many_requests", res);
            return;
        }else{
            await BruteForceStrategies.lockRegistrationOut(email, registrationLockTimeout);
        }
        console.log("Register: ", req.body);
        

        if(!email || !name){
            mkErrorResponse("unauthorized", res);
        }else{
            if(Validator.isEmailBasic(email)){
                let user = UserManager.getUserByEmail(email);
                if(user){
                    mkErrorResponse("unauthorized", res);
                }else{
                    user = await UserManager.createUser(email, name) as IUser;
                    const {id} = user;
                    await UserManager.confirmUser(id);
                    await UserManager.activateUser(id);
                    await UserManager.saveTable();

                    console.log({user, pw:UserManager.tempPW[id]});
                    res.status(200).json({message: "User created"});
                }
            }
        }
    });

    router.get('/user', async (req, res, next) => {
        const {query, session} = req;
        
        // sessionStore.
        let user = null;
        if(session){
            const {uid} = session as any;
            if(uid){
                user = UserManager.getUserById(uid);
            }
            // console.log(UserManager.userTable)
            res.status(200).json(user);
        }else{
            mkErrorResponse("unauthorized", res);
        }
    });
    router.post('/user', (req, res, next) => {});

}