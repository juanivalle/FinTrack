import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CommunityService } from './community.service';
import { CreatePostDto, CreateCommentDto, CreateVoteDto } from './dto/community.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')

export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

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
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './public/uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log("File uploaded:", file);
        return {
            url: `/uploads/${file.filename}`,
            type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO'
        };
    }
}
