import { CommunityService } from './community.service';
import { CreatePostDto, CreateCommentDto } from './dto/community.dto';
export declare class CommunityController {
    private readonly communityService;
    constructor(communityService: CommunityService);
    createPost(req: any, dto: CreatePostDto): Promise<{
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
    findAll(req: any, type?: 'ALL' | 'FOLLOWING', sortBy?: 'LATEST' | 'POPULAR', cursor?: string, limit?: number): Promise<{
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
    createComment(req: any, postId: string, dto: CreateCommentDto): Promise<{
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
    vote(req: any, id: string, body: {
        value: number;
    }): Promise<{
        id: string;
        userId: string;
        value: number;
        postId: string;
    }>;
    viewPost(id: string): Promise<{
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
    follow(req: any, targetId: string): Promise<{
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
    unfollow(req: any, targetId: string): Promise<{
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
    getSuggestions(req: any): Promise<{
        id: string;
        email: string;
    }[]>;
    uploadFile(file: Express.Multer.File): {
        url: string;
        type: string;
    };
}
