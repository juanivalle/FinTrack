import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, CreateCommentDto, CreateVoteDto } from './dto/community.dto';
export declare class CommunityService {
    private prisma;
    constructor(prisma: PrismaService);
    createPost(userId: string, dto: CreatePostDto): Promise<{
        id: string;
        title: string;
        content: string;
        mediaUrl: string | null;
        mediaType: string | null;
        createdAt: Date;
        score: number;
        views: number;
        updatedAt: Date;
        authorId: string;
        quotedPostId: string | null;
    }>;
    findAllPosts(userId: string, filter?: 'ALL' | 'FOLLOWING', sortBy?: 'LATEST' | 'POPULAR', cursor?: string, limit?: number): Promise<{
        score: number;
        isLiked: boolean;
        isDisliked: boolean;
        commentCount: number;
        comments: ({
            author: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            content: string;
            createdAt: Date;
            authorId: string;
            postId: string;
        })[];
        author: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
        votes: {
            id: string;
            userId: string;
            value: number;
            postId: string;
        }[];
        quotedPost: ({
            author: {
                id: string;
                email: string;
                name: string | null;
                avatarUrl: string | null;
            };
        } & {
            id: string;
            title: string;
            content: string;
            mediaUrl: string | null;
            mediaType: string | null;
            createdAt: Date;
            score: number;
            views: number;
            updatedAt: Date;
            authorId: string;
            quotedPostId: string | null;
        }) | null;
        id: string;
        title: string;
        content: string;
        mediaUrl: string | null;
        mediaType: string | null;
        createdAt: Date;
        views: number;
        updatedAt: Date;
        authorId: string;
        quotedPostId: string | null;
    }[]>;
    createComment(userId: string, postId: string, dto: CreateCommentDto): Promise<{
        author: {
            id: string;
            email: string;
            name: string | null;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        content: string;
        createdAt: Date;
        authorId: string;
        postId: string;
    }>;
    vote(userId: string, postId: string, dto: CreateVoteDto): Promise<{
        id: string;
        userId: string;
        value: number;
        postId: string;
    }>;
    incrementView(postId: string): Promise<{
        id: string;
        title: string;
        content: string;
        mediaUrl: string | null;
        mediaType: string | null;
        createdAt: Date;
        score: number;
        views: number;
        updatedAt: Date;
        authorId: string;
        quotedPostId: string | null;
    }>;
    followUser(userId: string, targetId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        refreshToken: string | null;
        role: import("@prisma/client").$Enums.Role;
        plan: import("@prisma/client").$Enums.Plan;
        name: string | null;
        bio: string | null;
        location: string | null;
        avatarUrl: string | null;
    }>;
    unfollowUser(userId: string, targetId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        password: string;
        refreshToken: string | null;
        role: import("@prisma/client").$Enums.Role;
        plan: import("@prisma/client").$Enums.Plan;
        name: string | null;
        bio: string | null;
        location: string | null;
        avatarUrl: string | null;
    }>;
    getSuggestions(userId: string): Promise<{
        id: string;
        email: string;
    }[]>;
}
