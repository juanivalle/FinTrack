import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from '../auth/dto/auth.dto';
import { User } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findOne(email: string): Promise<User | null>;
    findOneById(id: string): Promise<User | null>;
    create(registerDto: RegisterDto): Promise<User>;
    updateRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    getUserIfRefreshTokenMatches(refreshToken: string, userId: string): Promise<{
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
    } | null | undefined>;
    updateProfile(userId: string, data: {
        name?: string;
        bio?: string;
        location?: string;
        avatarUrl?: string;
    }): Promise<{
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
    getSocialStats(userId: string): Promise<{
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
    updatePassword(userId: string, newPassword: string): Promise<{
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
    deleteUser(userId: string): Promise<{
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
}
