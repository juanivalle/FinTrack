export declare class CreatePostDto {
    title: string;
    content: string;
    mediaUrl?: string;
    mediaType?: string;
    quotedPostId?: string;
}
export declare class CreateCommentDto {
    content: string;
}
export declare class CreateVoteDto {
    value: number;
}
