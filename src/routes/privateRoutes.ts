import { Request, Response, NextFunction } from 'express';
import { Router } from "express";
import bodyParser from 'body-parser';
import CustomSessionStore, { iSessionData } from "../services/CustomSessionStore";
import setThrottle from '../middlewares/setThrottle';
import { memoryUsage } from 'process';

const sessionStore = new CustomSessionStore(); //singleton

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    // Check if the user is authenticated
    const session = req.session as unknown as iSessionData;

    if (session && session.uid) {
        return next(); // User is authenticated, proceed to the next middleware
    } else {
        return res.status(401).json({ message: 'Unauthorized access' }); // User is not authenticated
    }
};

export function setMyAuthRoutes(router: Router) {
    router.use(bodyParser.json({limit:10240})); // limit the body size to 10kb

    setThrottle(router);
    router.get('/user/login', (req, res) => {
        // console.log("Login: ", req.body);
        // const sid = sessionStore.generateSessionId();
        // req.session = sessionStore.set(sid, {}) as any;
        // sessionStore.updateCookie(req, res, sid);
        // res.status(200).json({message: "Login successful"});
    });

    router.post('/user/register', (req, res) => {
        
    });

    router.get('/user', (req, res, next) => {});
    router.post('/user', (req, res, next) => {});

}