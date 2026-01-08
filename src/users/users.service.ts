import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from '../auth/dto/auth.dto';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOne(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findOneById(id: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(registerDto: RegisterDto): Promise<User> {
        const { email, password } = registerDto;

        const existingUser = await this.findOne(email);
        if (existingUser) {
            throw new ConflictException('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
    }

    async updateRefreshToken(userId: string, refreshToken: string | null) {
        if (refreshToken) {
            refreshToken = await bcrypt.hash(refreshToken, 10);
        }
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }

    async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
        const user = await this.findOneById(userId);

        const isRefreshTokenMatching = await bcrypt.compare(
            refreshToken,
            user?.refreshToken || '',
        );

        if (isRefreshTokenMatching) {
            return user;
        }
    }
    async updateProfile(userId: string, data: { name?: string; bio?: string; location?: string; avatarUrl?: string }) {
        if (data.name) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    name: { equals: data.name, mode: 'insensitive' }, // Case insensitive check
                    id: { not: userId }
                }
            });
            if (existingUser) {
                // Return a special error object or throw exception. 
                // NestJS will serialize thrown HTTP exceptions.
                // But for now, returning a rejected promise or handling in controller is fine.
                // Let's throw a standard Error that controller or global filter catches.
                throw new Error("USERNAME_TAKEN");
            }
        }
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }

    async getSocialStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                followedBy: { select: { id: true, email: true, name: true, avatarUrl: true } },
                following: { select: { id: true, email: true, name: true, avatarUrl: true } }
            }
        });
        if (!user) return null;
        return {
            followers: user.followedBy,
            following: user.following,
            followersCount: user.followedBy.length,
            followingCount: user.following.length
        };
    }

    async updatePassword(userId: string, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }

    async deleteUser(userId: string) {
        return this.prisma.user.delete({
            where: { id: userId },
        });
    }
}
