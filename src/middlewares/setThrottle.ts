import { Router } from "express";
import mkErrorResponse from "./mkResponse";

function getUnixSecs(){
    return Math.floor(Date.now() / 1000);
}
// The problem with this is that ips are not unique. You can have multiple users behind the same ip address.
export default function setThrottle(router: Router, maxRequestsPerIP = 100, secondsBeforeReset = 30){
    //can be used independently on multiple routers
    const ip_table:{[ipAddr in string]:{remaining:number, startSecs: number}} = {};

    //old means between 1X and 2X of renewalStepSecs
    setInterval(() => {
        const ltRenewalTime = getUnixSecs() - secondsBeforeReset;
        for (const ip in ip_table) {
            const row = ip_table[ip];
            if(row.startSecs < ltRenewalTime){
                delete ip_table[ip];
            }
        }
    }, (secondsBeforeReset) * 1000);

    router.use(async (req, res, next) => {
        const ip = req.ip as string;
        const row = ip_table[ip];
        
        if(row){
            row.remaining--;
            if(row.remaining < 1){
                //log this event
                // console.log(row);
                // console.log(Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100 + ' MB');
                await new Promise((resolve) => setTimeout(resolve, 2000));
                mkErrorResponse("too_many_requests", res);
            }
        }else{
            ip_table[ip] = {remaining:maxRequestsPerIP - 1, startSecs: getUnixSecs()}
        }
        next();
    });
}

//test throttle middleware by making many http requests to /private/user/login
//use the following command to test:
// siege -c 10 -t 3s http://localhost:3000/private/user/login