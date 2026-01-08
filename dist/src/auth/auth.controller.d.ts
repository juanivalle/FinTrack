import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            plan: any;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            role: any;
            plan: any;
        };
    }>;
    refresh(body: RefreshTokenDto): Promise<{
        accessToken: string;
    }>;
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, body: any): Promise<{
        email: string;
        password: string;
        refreshToken: string | null;
        name: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        plan: import("@prisma/client").$Enums.Plan;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        location: string | null;
        avatarUrl: string | null;
    }>;
    getSocialStats(req: any): Promise<{
        followers: {
            email: string;
            name: string | null;
            id: string;
            avatarUrl: string | null;
        }[];
        following: {
            email: string;
            name: string | null;
            id: string;
            avatarUrl: string | null;
        }[];
        followersCount: number;
        followingCount: number;
    } | null>;
    updatePassword(req: any, body: any): Promise<{
        email: string;
        password: string;
        refreshToken: string | null;
        name: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        plan: import("@prisma/client").$Enums.Plan;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        location: string | null;
        avatarUrl: string | null;
    }>;
    deleteAccount(req: any): Promise<{
        email: string;
        password: string;
        refreshToken: string | null;
        name: string | null;
        id: string;
        role: import("@prisma/client").$Enums.Role;
        plan: import("@prisma/client").$Enums.Plan;
        createdAt: Date;
        updatedAt: Date;
        bio: string | null;
        location: string | null;
        avatarUrl: string | null;
    }>;
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
        avatarUrl: string;
    }>;
}
