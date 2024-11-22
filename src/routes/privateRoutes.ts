import { Request, Response, NextFunction } from 'express';
import express, { Router } from "express";
import CustomSessionStore, { iSessionData } from "../services/CustomSessionStore";
import mkErrorResponse from '../middlewares/mkResponse';
import Validator from '../util/FormInputValidator';
import UserManager, { IUser } from '../services/UserManager';
import FormInputModifier from '../util/FormInputModifier';
import BruteForceStrategies, { BruteForceLocksCategory } from '../util/BruteForceStrategies';

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
const confirmLockTimeout = 3000;
const resetLockTimeout = 5000;

export function setMyPrivateRoutes(router: Router) {
    router.use(express.json({limit:10240})); // limit the body size to 10kb
    router.use(express.urlencoded({limit:10240})); // limit the body size to 10kb

    router.use(async (req, res, next) => {
        //session must already exist
        //logout if the session ip does not match the current ip
        const session = req.session as any;
        if(session && session.ip && session.ip !== req.ip){
            sessionStore.destroy(req.sessionID);
            mkErrorResponse("unauthorized", res);
            return;
        }
    });

    //pure ip throttles are going to cause problems with multiple users. Improve accuracy by using a combination of ip and email and session id and user id and api key and device id and mac address and user agent and other headers.
    // setThrottle(router);//generate ip throttle
    router.post('/user/reset', async (req:Request, res:Response) => {
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email} = cleanBody;
         //check isLockedOutElseWait
         const isLocked = await BruteForceStrategies.isLockedOutElseWait(email, BruteForceLocksCategory.reset, resetLockTimeout);
         if(isLocked){
             console.log("Registration locked");
             mkErrorResponse("too_many_requests", res);
             return;
         }
         console.log("Reset: ", cleanBody);
    });
    router.post('/user/register', async (req:Request, res:Response) => {
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email, name, postal} = cleanBody;
        
        //check isLockedOutElseWait
        const isLocked = await BruteForceStrategies.isLockedOutElseWait(email, BruteForceLocksCategory.registration, registrationLockTimeout);
        if(isLocked){
            console.log("Registration locked");
            mkErrorResponse("too_many_requests", res);
            return;
        }
        console.log("Register: ", cleanBody);

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
                    await UserManager.saveTable();
                    res.status(200).json({message: "User created"});
                }
            }
        }
        return;
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

    router.post('/user/login', async (req, res) => {
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email, password} = cleanBody;

        //check isLockedOutElseWait
        const isLocked = await BruteForceStrategies.isLockedOutElseWait(email, BruteForceLocksCategory.login, loginLockTimeout);
        if(isLocked){
            console.log("Login locked");
            mkErrorResponse("too_many_requests", res);
            return;
        }

        if(checkAuth(req, res)){
            res.redirect(307, '/private/user');
        }
        else if(!email || !password){
            mkErrorResponse("unauthorized", res);
        }else{
            const user = UserManager.getUserByEmail(email);
            if(user){
                if(await UserManager.verifyLogin(email, password)){
                    const {id} = user;
                    const sid = sessionStore.generateSessionId();
                    req.session = sessionStore.set(sid, {uid:id, ip:req.ip}) as any;
                    sessionStore.updateCookie(req, res, sid);
                    console.log("Login: ", cleanBody);
                    res.status(200).json({message: "Login successful"});
                }else{
                    mkErrorResponse("unauthorized", res);
                }
            }else{
                mkErrorResponse("unauthorized", res);
            }
        }
    });
    
    router.get('/user/confirm', async (req:Request, res:Response) => {
        const {query} = req;
        const email = query.email+"";
        const confirm = query.confirm+"";

        //check isLockedOutElseWait
        const isLocked = await BruteForceStrategies.isLockedOutElseWait(email, BruteForceLocksCategory.confirm, confirmLockTimeout);
        if(isLocked){
            console.log("Confirm locked");
            mkErrorResponse("too_many_requests", res);
            return;
        }

        if(!email || !confirm){
            mkErrorResponse("unauthorized", res);
        }else{
            const user = UserManager.getUserByEmail(email);
            if(user){
                const {id, confirmed} = user;
                if(!confirmed){ //make sure this is a user confirmation
                    const isConfirmed = UserManager.verifyConfirmKey(id, confirm);
                    if(isConfirmed){
                        UserManager.setUserConfirmed(id);
                        await UserManager.saveTable();
                        res.status(200).json({message: "User confirmed"});
                    }
                }
                else{
                    mkErrorResponse("unauthorized", res);
                }
            }else{
                mkErrorResponse("unauthorized", res);
            }
        }
    });

    
    router.get('/user/logout', async (req:Request, res:Response) => {
        //destroy the current session
        sessionStore.destroy(req.sessionID);
    });

    

}