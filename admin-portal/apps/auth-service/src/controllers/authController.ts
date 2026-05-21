import { Request, Response } from 'express';
import { UserService } from '../services/userService';

export class AuthController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public async login(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        try {
            const user = await this.userService.authenticate(username, password);
            if (user) {
                // Generate a token or set session here
                res.status(200).json({ message: 'Login successful', user });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    }

    public async register(req: Request, res: Response): Promise<void> {
        const { username, password } = req.body;

        try {
            const newUser = await this.userService.createUser(username, password);
            res.status(201).json({ message: 'User registered successfully', newUser });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    }
}