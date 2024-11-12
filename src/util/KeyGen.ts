import bcrypt from 'bcrypt';
import crypto from 'crypto';
// define a const string array containing alphanumeric characters, numbers and special characters
const passwordCharacterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+|~-=`{}[]:;<>?,./';
// define a const string array containing alphanumeric characters, numbers
const apiKeyCharacterSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// define a function that generates a random string
export function generateMySecret(length: number, charset:"pw"|"api" = "pw", deviateLen = 0): string {
    let result = '';
    const mySet = charset === "pw" ? passwordCharacterSet : apiKeyCharacterSet;
    const charactersLength = mySet.length;
    length += Math.ceil(Math.random() * deviateLen);
    for (let i = 0; i < length; i++) {
        result += mySet.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function generateApiKey(): string {
    return generateMySecret(32, "api");
}

export function generateUKey(): string {
    return generateMySecret(8, "api");
}

// md5 hash (vulnerable to collision attacks using rainbow tables if used for password verification that is not salted OR the md5 hash is not stored securely) 
export function md5Hash(password: string): string {
    return crypto.createHash('md5').update(password).digest('hex');
}
//function to hash password by passing a string
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}
//function to validate password by passing a string and a hash
export async function validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}


//test the password hashing and validation functions
function testPasswordHashing() {

    const storedHashedPassword = '$2b$10$SxeMEVUYbUZafE4f6nl0/eiadfO35ibdqfyghfZB9rbFUXIq1RoIK'; // Example hash
    const inputPassword = 'mySecurePassword';

    validatePassword(inputPassword, storedHashedPassword).then(async (isMatch) => {
        console.log(await hashPassword(inputPassword));
        console.log('Password Match:', isMatch); // Should print true if the password is correct
    });
}