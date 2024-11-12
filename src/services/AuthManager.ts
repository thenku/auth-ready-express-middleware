// constructor parameters type definition
type IContructorParams = {
    PWEncryption: "hash" | "md5",
    sessionDuration: number, //default 1h. 0 for infinite. // Sessions are always for authorization.
    authRoute: string, //default /auth
    activationMethod: "email" | "admin",
    notifySuspiciousActivity: boolean, // either use email or app notifications if available
    authorizedServers: string[], // ips or domains with API keys that share session data
    bruteForcePerMinute: number,
    rateLimitPerMinute: number,
    verifyIP: boolean,
    CSRFProtection: boolean, // prevent unauthorized access to authorized resources
    honeypotProtection: boolean, // detect and block bots
    requireOTP: boolean,
    allowDeviceVerification: boolean,
    enableAPIKeyLogin: boolean,
    recaptcha: {
        siteKey: string,
        secretKey: string
    },
    mailServerOptions: {
        host: string,
        port: number,
        secure: boolean,
        auth: {
            user: string,
            pass: string
        }
    },
    getUser?: (id: string) => any,
    setUser?: (id: string, user: any) => void,
};

export class AuthMiddlewareThenku {
    private options: IContructorParams;
   constructor(options: IContructorParams) {
      // constructor logic here
        this.options = options;
   }
//    getUser = (id: string) => {
//          return this.options.getUser(id);
//     }
//     setUser = (id: string, user: any) => {
//         this.options.setUser(id, user);
//     }
}