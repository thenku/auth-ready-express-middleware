import path from 'path';
import KeyGen from '../util/KeyGen';
import Semaphore from '../util/Semaphore';
import fs from 'fs/promises';

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
    tempPW: Record<string, string> = {};
    private tablePath = path.resolve("private/table.json");

    private maxId = 1; //starts with 1 because 0 is falsey

    constructor(){
        this.loadTable().then(() => {
            setInterval(() => {
                // log users that have not confirmed their email after 1 hour
                // remove user that have not confirmed their email after 1 hour
            });
        });
    }
    async saveTable(): Promise<void>{
        await mySemaphore.acquire();
        // serialize table
        await fs.mkdir(path.dirname(this.tablePath), {recursive: true});
        await fs.writeFile(this.tablePath, JSON.stringify(this.userTable, null, "\t"));
        mySemaphore.release();
    }
    private async loadTable(): Promise<void>{
        mySemaphore.acquire();
        // deserialize table
        try {
            await fs.access(this.tablePath)
            const data = await fs.readFile(this.tablePath);
            this.userTable = JSON.parse(data.toString());
            console.log('table loaded')
        }catch(e){
            console.error("Error loading user table: ", e);
        }

        // set max id and add emails to emailMappings
        const allUsers = this.userTable;
        let id = 0;
        for (const key in allUsers) {
            const userId = parseInt(key);
            const user = allUsers[key];
            this.emailMappings[user.email] = key;
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
        await this.updateUserKeys(id);
        mySemaphore.release();
        return user;
    }

    getUserById(id: string){
        return this.userTable[id];
    }

    getUserByEmail(email: string){
        const id = this.emailMappings[email];
        return id ? this.userTable[id] : null;
    }
    async updateUserEmail(id:string, email:string): Promise<void> {
        const user = this.userTable[id];
        if(user){
            delete this.emailMappings[user.email];
            this.userTable[id].email = email;
            this.emailMappings[email] = id;
        }
    }
    //confirm user
    async confirmUser(id: string): Promise<void> {
        const row = this.userTable[id];
        if(row){
            row.confirmed = Math.floor(Date.now()/1000);
        }
    }
    //update user keys
    public async updateUserKeys(id: string) {
        const row = this.userTable[id];
        if(row){
            row.apiKey = KeyGen.generateMySecret(64, "api", 12);
            const pw = KeyGen.generateMySecret(12, "pw", 8);
            this.tempPW[id] = pw;
            const hash = await KeyGen.hashPassword(pw);
            row.pw = hash;
        }
    }
    async verifyPassword(id: string, password: string): Promise<boolean> {
        const user = this.userTable[id];
        if(user){
            return await KeyGen.validatePassword(password, user.pw);
        }
        return false;
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