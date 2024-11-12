import Semaphore from '../util/Semaphore';
import { generateApiKey, generateMySecret, hashPassword, md5Hash } from '../util/KeyGen';

export type IUser = {
    id: string;
    name: string;
    email: string;
    pw: string;
    apiKey:string;
    otp: string;
    ip:string;
    created:number;
    confirmed:number;
    active:number;
}
const mySemaphore = new Semaphore(); //singleton here outside the class

class UserManagerClass {
    userTable:Record<string, IUser> = {};
    private emailMappings: Record<string,string> = {};
    private devices: Record<string, string[]> = {};

    private maxId = 0;

    constructor(){
        this.loadTable();
    }
    private async loadTable(): Promise<void>{
        mySemaphore.acquire();
        // deserialize table

        // set max id
        const allUsers = this.userTable;
        let id = 0;
        for (const key in allUsers) {
            const userId = parseInt(key);
            if (userId > id) {
                id = userId;
            }
        }
        this.maxId = id;
        mySemaphore.release();
    }
   
    public async createUser(email:string, name:string) {
        await mySemaphore.acquire();
        this.maxId++;
        const id = this.maxId.toString();
        
        const user:IUser = {
            id,
            name,
            email,
            pw: '',
            otp: '',
            apiKey:'',
            ip:'',
            created:Math.floor(Date.now()/1000),
            confirmed:0,
            active:0
        };
        this.userTable[id] = user;
        this.emailMappings[email] = id;
        this.updateUserKeys(id);
        mySemaphore.release();
        
    }

    public async getUserById(id: string): Promise<IUser | undefined> {
        return this.userTable[id];
    }

    public async getUserByEmail(email: string): Promise<IUser | null> {
        const id = this.emailMappings[email];
        return id ? this.userTable[id] : null;
    }
    public async updateUserEmail(id:string, email:string): Promise<void> {
        const user = this.userTable[id];
        if(user){
            delete this.emailMappings[user.email];
            this.userTable[id].email = email;
            this.emailMappings[email] = id;
        }
    }
    //confirm user
    public async confirmUser(id: string): Promise<void> {
        if(this.userTable[id]){
            this.userTable[id].confirmed = Math.floor(Date.now()/1000);
        }
    }
    //update user keys
    public async updateUserKeys(id: string) {
        if(this.userTable[id]){
            this.userTable[id].apiKey = generateApiKey();
            const pw = generateMySecret(12, "pw", 8);
            this.userTable[id].pw = md5Hash(pw);
        }
    }

    public async deleteUser(id: string): Promise<void> {
        if(this.userTable[id]){
            delete this.userTable[id];
        }
    }
    //deactivate user
    public async deactivateUser(id: string): Promise<void> {
        if(this.userTable[id]){
            this.userTable[id].active = 0;
        }
    }
    //activate user
    public async activateUser(id: string): Promise<void> {
        if(this.userTable[id]){
            this.userTable[id].active = 1;
        }
    }
}

const UserManager = new UserManagerClass();
export default UserManager;