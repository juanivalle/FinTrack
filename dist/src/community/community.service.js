"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CommunityService = class CommunityService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createPost(userId, dto) {
        const { quotedPostId, ...postData } = dto;
        return this.prisma.post.create({
            data: {
                ...postData,
                author: { connect: { id: userId } },
                quotedPost: quotedPostId ? { connect: { id: quotedPostId } } : undefined
            },
        });
    }
    async findAllPosts(userId, filter = 'ALL', sortBy = 'LATEST', cursor, limit = 10) {
        const whereClause = {};
        if (filter === 'FOLLOWING') {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { following: { select: { id: true } } }
            });
            const followingIds = user?.following.map(u => u.id) || [];
            whereClause.authorId = { in: followingIds };
        }
        const orderBy = sortBy === 'POPULAR'
            ? [{ score: 'desc' }, { createdAt: 'desc' }]
            : { createdAt: 'desc' };
        const posts = await this.prisma.post.findMany({
            where: whereClause,
            take: Number(limit),
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            include: {
                author: { select: { email: true, id: true, name: true, avatarUrl: true } },
                votes: { where: { userId: userId } },
                comments: {
                    include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'asc' }
                },
                quotedPost: {
                    include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } }
                }
            },
            orderBy: orderBy
        });
        return posts.map(post => {
            const userVote = post.votes[0];
            return {
                ...post,
                score: post.score,
                isLiked: userVote?.value === 1,
                isDisliked: userVote?.value === -1,
                commentCount: post.comments.length
            };
        });
    }
    async createComment(userId, postId, dto) {
        return this.prisma.comment.create({
            data: {
                authorId: userId,
                postId,
                content: dto.content
            },
            include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } }
        });
    }
    async vote(userId, postId, dto) {
        const existingVote = await this.prisma.vote.findUnique({
            where: { postId_userId: { postId, userId } }
        });
        let vote;
        if (existingVote && existingVote.value === dto.value) {
            vote = await this.prisma.vote.delete({
                where: { postId_userId: { postId, userId } }
            });
        }
        else {
            vote = await this.prisma.vote.upsert({
                where: { postId_userId: { postId, userId } },
                update: { value: dto.value },
                create: { postId, userId, value: dto.value }
            });
        }
        const aggr = await this.prisma.vote.aggregate({
            _sum: { value: true },
            where: { postId }
        });
        await this.prisma.post.update({
            where: { id: postId },
            data: { score: aggr._sum.value || 0 }
        });
        return vote;
    }
    async incrementView(postId) {
        return this.prisma.post.update({
            where: { id: postId },
            data: { views: { increment: 1 } }
        });
    }
    async followUser(userId, targetId) {
        if (userId === targetId)
            throw new Error("Cannot follow yourself");
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                following: {
                    connect: { id: targetId }
                }
            }
        });
    }
    async unfollowUser(userId, targetId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                following: {
                    disconnect: { id: targetId }
                }
            }
        });
    }
    async getSuggestions(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { following: { select: { id: true } } }
        });
        const followingIds = user?.following.map(u => u.id) || [];
        followingIds.push(userId);
        return this.prisma.user.findMany({
            where: {
                id: { notIn: followingIds }
            },
            take: 5,
            select: { id: true, email: true }
        });
    }
};
exports.CommunityService = CommunityService;
exports.CommunityService = CommunityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunityService);
//# sourceMappingURL=community.service.js.map