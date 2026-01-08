import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    mediaUrl?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    mediaType?: string; // IMAGE, VIDEO

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    quotedPostId?: string;
}

export class CreateCommentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;
}

export class CreateVoteDto {
    @ApiProperty()
    @IsInt()
    @Min(-1)
    @Max(1)
    value: number;
}
