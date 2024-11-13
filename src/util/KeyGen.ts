import bcrypt from 'bcrypt';
import crypto from 'crypto';
// define a const string array containing alphanumeric characters, numbers and special characters
const passwordCharacterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+|~-={}[]:;?,./';
// define a const string array containing alphanumeric characters, numbers
const apiKeyCharacterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

class KeyGenClass{
    generateMySecret(length: number, charset:"pw"|"api" = "pw", deviateLen = 0): string {
        let result = '';
        const mySet = charset === "pw" ? passwordCharacterSet : apiKeyCharacterSet;
        const charactersLength = mySet.length;
        length += Math.ceil(Math.random() * deviateLen);
        for (let i = 0; i < length; i++) {
            result += mySet.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    
    
    // md5 hash (vulnerable to collision attacks using rainbow tables if used for password verification that is not salted OR the md5 hash is not stored securely) 
    md5Hash(password: string): string {
        return crypto.createHash('md5').update(password).digest('hex');
    }
    //function to hash password by passing a string
    async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }
    //function to validate password by passing a string and a hash
    async validatePassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }
}
// define a function that generates a random string
const KeyGen = new KeyGenClass();
export default KeyGen;


//test the password hashing and validation functions
function testPasswordHashing() {

    const storedHashedPassword = '$2b$10$SxeMEVUYbUZafE4f6nl0/eiadfO35ibdqfyghfZB9rbFUXIq1RoIK'; // Example hash
    const inputPassword = 'mySecurePassword';

    KeyGen.validatePassword(inputPassword, storedHashedPassword).then(async (isMatch) => {
        console.log(await KeyGen.hashPassword(inputPassword));
        console.log('Password Match:', isMatch); // Should print true if the password is correct
    });
}