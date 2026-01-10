import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, CreateCommentDto, CreateVoteDto } from './dto/community.dto';

@Injectable()
export class CommunityService {
    constructor(private prisma: PrismaService) { }

    async createPost(userId: string, dto: CreatePostDto) {
        const { quotedPostId, ...postData } = dto;
        return this.prisma.post.create({
            data: {
                ...postData,
                author: { connect: { id: userId } },
                quotedPost: quotedPostId ? { connect: { id: quotedPostId } } : undefined
            },
        });
    }

    async findAllPosts(userId: string, filter: 'ALL' | 'FOLLOWING' = 'ALL', sortBy: 'LATEST' | 'POPULAR' = 'LATEST', cursor?: string, limit: number = 10) {
        const whereClause: any = {};

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
                votes: { where: { userId: userId } }, // Only fetch current user's vote
                comments: {
                    include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } },
                    orderBy: { createdAt: 'asc' }
                },
                quotedPost: {
                    include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } }
                }
            },
            orderBy: orderBy as any
        });

        // Enrich with "isLiked" and "voteCount"
        return posts.map(post => {
            const userVote = post.votes[0]; // Optimization: votes array now only contains 0 or 1 item
            return {
                ...post,
                score: post.score, // Use DB cached score
                isLiked: userVote?.value === 1,
                isDisliked: userVote?.value === -1,
                commentCount: post.comments.length
            };
        });
    }

    async createComment(userId: string, postId: string, dto: CreateCommentDto) {
        return this.prisma.comment.create({
            data: {
                authorId: userId,
                postId,
                content: dto.content
            },
            include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } }
        });
    }

    async vote(userId: string, postId: string, dto: CreateVoteDto) {
        const existingVote = await this.prisma.vote.findUnique({
            where: { postId_userId: { postId, userId } }
        });

        let vote;
        if (existingVote && existingVote.value === dto.value) {
            // Toggle off (remove vote)
            vote = await this.prisma.vote.delete({
                where: { postId_userId: { postId, userId } }
            });
        } else {
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

    async incrementView(postId: string) {
        return this.prisma.post.update({
            where: { id: postId },
            data: { views: { increment: 1 } }
        });
    }

    async followUser(userId: string, targetId: string) {
        if (userId === targetId) throw new Error("Cannot follow yourself");
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                following: {
                    connect: { id: targetId }
                }
            }
        });
    }

    async unfollowUser(userId: string, targetId: string) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                following: {
                    disconnect: { id: targetId }
                }
            }
        });
    }

    async getSuggestions(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { following: { select: { id: true } } }
        });

        const followingIds = user?.following.map(u => u.id) || [];
        followingIds.push(userId); // Exclude self

        const suggestions = await this.prisma.user.findMany({
            where: {
                id: { notIn: followingIds }
            },
            take: 5,
            select: { id: true, email: true, name: true, avatarUrl: true },
            orderBy: { createdAt: 'desc' } // Just random heuristic for now
        });

        return suggestions;
    }

    async getUserProfile(requesterId: string, targetId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: targetId },
            select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true, _count: { select: { followedBy: true, following: true, posts: true } } }
        });

        if (!user) throw new Error('User not found');

        // Check isFollowing
        const isFollowing = (await this.prisma.user.count({
            where: {
                id: requesterId,
                following: { some: { id: targetId } }
            }
        })) > 0;

        // Get Recent Posts
        const postsQuery = this.prisma.post.findMany({
            where: { authorId: targetId },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { email: true, id: true, name: true, avatarUrl: true } },
                _count: { select: { comments: true } },
                votes: { where: { userId: requesterId } }
            }
        });

        // Get Recent Replies (Comments)
        const repliesQuery = this.prisma.comment.findMany({
            where: { authorId: targetId },
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                author: { select: { email: true, id: true, name: true, avatarUrl: true } },
                post: {
                    include: { author: { select: { email: true, id: true, name: true, avatarUrl: true } } }
                }
            }
        });

        // Get Liked Posts
        const likedPostsQuery = this.prisma.vote.findMany({
            where: { userId: targetId, value: 1 },
            take: 10,
            // orderBy: { createdAt: 'desc' }, // Vote model does not have createdAt
            include: {
                post: {
                    include: {
                        author: { select: { email: true, id: true, name: true, avatarUrl: true } },
                        _count: { select: { comments: true } },
                        votes: { where: { userId: requesterId } }
                    }
                }
            }
        });

        const [posts, replies, likedVotes] = await Promise.all([postsQuery, repliesQuery, likedPostsQuery]);

        const enrichedPosts = posts.map(post => ({
            ...post,
            isLiked: post.votes?.[0]?.value === 1,
            commentCount: post._count.comments
        }));

        const enrichedLikedPosts = likedVotes.map((vote: any) => ({
            ...vote.post,
            isLiked: vote.post.votes?.[0]?.value === 1,
            commentCount: vote.post._count.comments
        }));

        return {
            ...user,
            _count: {
                ...user._count,
                followers: user._count.followedBy
            },
            isFollowing,
            posts: enrichedPosts,
            replies,
            likedPosts: enrichedLikedPosts
        };
    }
    async searchCommunity(query: string, userId: string) {
        if (!query || query.length < 2) return { users: [], posts: [] };

        const [users, posts] = await Promise.all([
            // Search Users
            this.prisma.user.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { email: { contains: query, mode: 'insensitive' } }
                    ],
                    NOT: { id: userId }
                },
                take: 5,
                select: { id: true, email: true, name: true, avatarUrl: true }
            }),
            // Search Posts
            this.prisma.post.findMany({
                where: {
                    OR: [
                        { title: { contains: query, mode: 'insensitive' } },
                        { content: { contains: query, mode: 'insensitive' } }
                    ]
                },
                take: 20,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: { select: { email: true, id: true, name: true, avatarUrl: true } },
                    _count: { select: { comments: true } },
                    votes: { where: { userId: userId } }
                }
            })
        ]);

        const enrichedPosts = posts.map(post => ({
            ...post,
            isLiked: post.votes?.[0]?.value === 1,
            commentCount: post._count.comments
        }));

        return { users, posts: enrichedPosts };
    }
}
