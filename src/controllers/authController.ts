import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export default class AuthController {
    private authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }
    
    public async registerUser(req: Request, res: Response): Promise<void> {
        try {
            const userData = req.body;
            const newUser = await this.authService.register(userData);
            res.status(201).json(newUser);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    public async loginUser(req: Request, res: Response): Promise<void> {
        try {
            const { username, password } = req.body;
            const user = await this.authService.login(username, password);
            req.session.userId = user.id; // Assuming session management is set up
            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    }
}