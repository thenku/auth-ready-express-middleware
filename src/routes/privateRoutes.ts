import { Request, Response, NextFunction } from 'express';
import express, { Router } from "express";
import CustomSessionStore, { iSessionData } from "../services/CustomSessionStore";
import setThrottle from '../middlewares/setThrottle';
import mkErrorResponse from '../middlewares/mkResponse';
import Validator from '../util/Validator';
import UserManager from '../services/UserManager';

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
    router.get('/user/login', (req, res) => {
        // console.log("Login: ", req.body);
        // const sid = sessionStore.generateSessionId();
        // req.session = sessionStore.set(sid, {}) as any;
        // sessionStore.updateCookie(req, res, sid);
        // res.status(200).json({message: "Login successful"});
    });

    router.post('/user/register', async (req:Request, res:Response, next) => {
        // curl -X POST http://localhost:3000/private/user/register -H "Content-Type: application/json" -d '{ "key": "value" }'
        console.log("Register: ", req.body);
        const {email, recaptcha, name} = req.body;
        //what can we use instead of recaptcha?

        if(!email || !name){
            res.status(400).json({message: "Invalid request"});
        }else{
            if(Validator.isEmailBasic(email)){
                // console.log("Valid email");
                // console.log("Valid recaptcha");
                // console.log("Valid request");
                let user = await UserManager.getUserByEmail(email);
                if(user){
                    res.status(400).json({message: "User already exists"});
                }else{
                    await UserManager.createUser(email, name);
                    user = await UserManager.getUserByEmail(email);
                    res.status(200).json({message: "User created"});
                }
            }
        }
        // res.json(req.body);
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