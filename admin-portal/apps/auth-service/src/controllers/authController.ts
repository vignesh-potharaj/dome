import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export class AuthController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public login = async (req: Request, res: Response): Promise<void> => {
        const { username, password } = req.body; // username represents the email here

        try {
            const user = await this.userService.authenticate(username, password);
            if (user) {
                // Generate a JWT containing the admin's database role and branchId
                const token = jwt.sign(
                    {
                        adminId: user.id,
                        email: user.email,
                        role: user.role,
                        branchId: user.branchId
                    },
                    process.env.JWT_SECRET || 'fallback-secret-key-2026',
                    { expiresIn: '24h' }
                );

                res.status(200).json({ 
                    message: 'Login successful', 
                    token, 
                    user 
                });
            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    };

    public register = async (req: Request, res: Response): Promise<void> => {
        const { username, password, role, branchId } = req.body; // username represents email

        try {
            const existing = await this.userService.getAdminByEmail(username);
            if (existing) {
                res.status(400).json({ message: 'Admin with this email already exists' });
                return;
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const newUser = await this.userService.createAdmin(
                username,
                passwordHash,
                role || 'branch_admin',
                branchId || null
            );

            res.status(201).json({ 
                message: 'Admin registered successfully', 
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
                    branchId: newUser.branchId
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Internal server error', error });
        }
    };
}