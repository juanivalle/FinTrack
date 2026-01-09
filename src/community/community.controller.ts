import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommunityService } from './community.service';
import { CreatePostDto, CreateCommentDto, CreateVoteDto } from './dto/community.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@ApiTags('Community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')

export class CommunityController {
    constructor(
        private readonly communityService: CommunityService,
        private readonly cloudinaryService: CloudinaryService
    ) { }

    @Post('posts')
    createPost(@Request() req: any, @Body() dto: CreatePostDto) {
        return this.communityService.createPost(req.user.userId, dto);
    }

    @Get('posts')
    findAll(
        @Request() req: any,
        @Query('type') type: 'ALL' | 'FOLLOWING' = 'ALL',
        @Query('sortBy') sortBy: 'LATEST' | 'POPULAR' = 'LATEST',
        @Query('cursor') cursor?: string,
        @Query('limit') limit: number = 10
    ) {
        return this.communityService.findAllPosts(req.user.userId, type, sortBy, cursor, limit);
    }

    @Post('posts/:id/comments')
    createComment(@Request() req: any, @Param('id') postId: string, @Body() dto: CreateCommentDto) {
        return this.communityService.createComment(req.user.userId, postId, dto);
    }

    @Post('posts/:id/vote')
    vote(@Request() req: any, @Param('id') id: string, @Body() body: { value: number }) {
        return this.communityService.vote(req.user.userId, id, { value: body.value });
    }

    @Post('posts/:id/view')
    viewPost(@Param('id') id: string) {
        return this.communityService.incrementView(id);
    }

    @Post('follow/:id')
    follow(@Request() req: any, @Param('id') targetId: string) {
        return this.communityService.followUser(req.user.userId, targetId);
    }

    @Post('unfollow/:id')
    unfollow(@Request() req: any, @Param('id') targetId: string) {
        return this.communityService.unfollowUser(req.user.userId, targetId);
    }

    @Get('suggestions')
    getSuggestions(@Request() req: any) {
        return this.communityService.getSuggestions(req.user.userId);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file')) // Memory Storage
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new HttpException('File required', HttpStatus.BAD_REQUEST);

        try {
            const result = await this.cloudinaryService.uploadImage(file);
            const url = (result as any).secure_url || (result as any).url;
            return {
                url: url,
                type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO'
            };
        } catch (error) {
            console.error('Community Upload Error:', error);
            throw new HttpException('Upload failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
