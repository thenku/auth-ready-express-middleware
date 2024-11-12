import {Response} from "express";

export default function  mkErrorResponse(myType:"unauthorized" | "forbidden" | "not_found" | "login_redirect" | "too_many_requests" | "payload_too_large", res?:Response, redirectIfText = ""){
    let data = "";
    let statusCode = 200;
    
    if(myType == "forbidden"){
        statusCode = 403;
        data = JSON.stringify({
            meta: {
                success:false, 
                message:"forbidden"
            }
        });
    }
    else if(myType == "unauthorized"){
        statusCode = 401;
        data = JSON.stringify({
            meta: {
                success:false, 
                message:"Unauthorized access"
            }
        });
    }else if(myType == "not_found"){
        statusCode = 404;
        data = JSON.stringify({meta: {
            success: false,
            message:"not found",
        }});
    }
    else if(myType == "login_redirect"){
        redirectIfText = "/login";
    }
    else if(myType == "too_many_requests"){
        statusCode = 429;
        data = JSON.stringify({meta: {
            success: false,
            message:"429 Too Many Requests",
        }});
    }
    else if(myType == "payload_too_large"){
        statusCode = 413;
        data = JSON.stringify({meta: {
            success: false,
            message:"413 Request Entity Too Large",
        }});
    }
    
    if(res){
        if(redirectIfText){
            res.status(statusCode).redirect(redirectIfText);
        }else{
            res.status(statusCode).end(data);
        }
    }
    return data;
}
