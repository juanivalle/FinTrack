import { Controller, Post, Body, UseGuards, Request, Get, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service'; // Import
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private cloudinaryService: CloudinaryService // Injected
    ) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @Post('refresh')
    @ApiOperation({ summary: 'Refresh access token' })
    async refresh(@Body() body: RefreshTokenDto) {
        return this.authService.refresh(body.refreshToken);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req: any) {
        const user = await this.usersService.findOneById(req.user.userId);
        if (user) {
            const { password, refreshToken, ...result } = user;
            return result;
        }
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    async updateProfile(@Request() req: any, @Body() body: any) {
        try {
            return await this.usersService.updateProfile(req.user.userId, body);
        } catch (e) {
            if (e.message === 'USERNAME_TAKEN') {
                throw new HttpException('El nombre de usuario ya está en uso.', HttpStatus.BAD_REQUEST);
            }
            throw e;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('social')
    async getSocialStats(@Request() req: any) {
        return this.usersService.getSocialStats(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('password')
    async updatePassword(@Request() req: any, @Body() body: any) {
        return this.usersService.updatePassword(req.user.userId, body.password);
    }

    @UseGuards(JwtAuthGuard)
    @Post('delete')
    async deleteAccount(@Request() req: any) {
        return this.usersService.deleteUser(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Post('avatar')
    @UseInterceptors(FileInterceptor('file')) // No diskStorage, uses Memory (Buffer) by default
    async uploadAvatar(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new Error('File not found');

        try {
            const result = await this.cloudinaryService.uploadImage(file);
            // Default to secure_url, check type intersection
            const avatarUrl = (result as any).secure_url || (result as any).url;
            await this.usersService.updateProfile(req.user.userId, { avatarUrl });
            return { avatarUrl };
        } catch (error) {
            console.error('Cloudinary Upload Error:', error);
            throw new HttpException('Failed to upload avatar', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

