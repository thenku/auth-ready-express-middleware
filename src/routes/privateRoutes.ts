import { Request, Response, NextFunction } from 'express';
import express, { Router } from "express";
import CustomSessionStore, { iSessionData } from "../services/CustomSessionStore";
import setThrottle from '../middlewares/setThrottle';
import mkErrorResponse from '../middlewares/mkResponse';
import Validator from '../util/FormInputValidator';
import UserManager from '../services/UserManager';
import FormInputModifier from '../util/FormInputModifier';

const sessionStore = new CustomSessionStore(); //singleton

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    const session = req.session as unknown as iSessionData;

    if (session && session.uid) {
        return true; // User is authenticated, proceed to the next middleware
    } else {
        mkErrorResponse("unauthorized", res);
        return false; // User is not authenticated
    }
};

export function setMyAuthRoutes(router: Router) {
    router.use(express.json({limit:10240})); // limit the body size to 10kb
    router.use(express.urlencoded({limit:10240})); // limit the body size to 10kb

    setThrottle(router);
    router.get('/user/login', async (req, res) => {
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email, password} = cleanBody;

        if(!email || !password){
            mkErrorResponse("unauthorized", res);
        }else{
            const user = UserManager.getUserByEmail(email);
            if(user){
                const {id} = user;
                if(await UserManager.verifyPassword(user.id, password)){
                    console.log("Login: ", cleanBody);
                    const sid = sessionStore.generateSessionId();
                    req.session = sessionStore.set(sid, {}) as any;
                    sessionStore.updateCookie(req, res, sid);
                    console.log("Session ID: ", sid, req.sessionID);
                    res.status(200).json({message: "Login successful"});
                }else{
                    mkErrorResponse("unauthorized", res);
                }
            }
        }
    });

    router.post('/user/register', async (req:Request, res:Response, next) => {
        // curl -X POST http://localhost:3000/private/user/register -H "Content-Type: application/json" -d '{ "key": "value" }'
        console.log("Register: ", req.body);
        const cleanBody = FormInputModifier.cleanBody(req.body);
        const {email, name, postal} = cleanBody;
        
        //what can we use instead of recaptcha? An authenticator app

        if(!email || !name){
            res.status(400).json({message: "Invalid request"});
        }else{
            if(Validator.isEmailBasic(email)){
                // console.log("Valid email");
                // console.log("Valid recaptcha");
                // console.log("Valid request");
                let user = UserManager.getUserByEmail(email);
                if(user){
                    res.status(400).json({message: "User already exists"});
                }else{
                    await UserManager.createUser(email, name);
                    user = UserManager.getUserByEmail(email);
                    console.log({user});
                    res.status(200).json({message: "User created"});
                }
            }
        }
    });

    router.get('/user', async (req, res, next) => {
        const {query} = req;
        const {uid} = query;
        console.log({query});
        let user = null;
        if(uid){
            user = await UserManager.getUserById(uid.toString());
        }
        console.log(UserManager.userTable)
        res.status(200).json(user);

    });
    router.post('/user', (req, res, next) => {});

}