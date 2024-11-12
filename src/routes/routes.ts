import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import express from 'express';
import CustomSessionStore from '../services/CustomSessionStore';
import { setMyAuthRoutes } from './privateRoutes';


const publicFolder = path.resolve(__dirname, '../../public');

const parseMeCookie = cookieParser();

const router = Router();
// We assume that sessions are exclusively used for authentication and authorization purposes.

// sessions in memory are fast but not scalable if they don't share the same memory store.
// DB stores are recommended by express so sessions can be shared across all instances.
// By default express sessions leak memory which is a bigger problem than not sharing sessions across all instances.
// You can implement your own store by passing read/write functions. In this way you can use both memory and DBs for your load balancer if you like.

// do not use the default memory store in production
// router.use(session({
//     secret,
//     genid(req:Request) {
//         return generateMySecret(32, "api", 16)+crypto.randomUUID();
//     },
//     resave: false, // save even if the session was not modified
//     saveUninitialized: true, // always create session to ensure the session is stored
//     // rolling: true, // reset maxAge on every request (not expires)
//     cookie: {
//         maxAge, // 3 minutes on every request
//         sameSite:true, // enable same site security for session cookie
//         secure:false, // set to true if your using https directly, without a proxy
//         httpOnly:true // prevent client side js from accessing the cookie
//     },
//     store,
//     unset: 'destroy'
// }));

export function setMyAuth(app: Router, showTestPages = false, sessionRoutes: "all" | "privateOnly" = "privateOnly") {
    const maxAge = 1000 * 3 * 5; //
    const sessionStore = new CustomSessionStore(maxAge);
    
    let mustRefresh = true;
    if(sessionRoutes === "all"){
        mustRefresh = false;
        app.use(parseMeCookie, (req, res, next) => {
            sessionStore.refreshSession(req, res);
            next();
        });
    }

    router.use(parseMeCookie, (req, res, next) => {
        //sid can be logged will only be set if the user has logged in
        if(mustRefresh){
            sessionStore.refreshSession(req, res);
        }

        if(req.sessionID){
            console.log("Session ID: ", req.sessionID);
        }else{
            console.log("NO SESSION ID: ", req.sessionID);
            
        }
        console.log("SessionsStore: ", JSON.stringify(sessionStore).length);

        setMyAuthRoutes(router);
        next();
    });

    app.use("/private/", router);

    if(showTestPages){
        // console.log("Public folder of this module: ", publicFolder);
        app.get("/", express.static(publicFolder));
    }
}