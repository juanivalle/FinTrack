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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunityController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const community_service_1 = require("./community.service");
const community_dto_1 = require("./dto/community.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const swagger_1 = require("@nestjs/swagger");
let CommunityController = class CommunityController {
    communityService;
    constructor(communityService) {
        this.communityService = communityService;
    }
    createPost(req, dto) {
        return this.communityService.createPost(req.user.userId, dto);
    }
    findAll(req, type = 'ALL', sortBy = 'LATEST', cursor, limit = 10) {
        return this.communityService.findAllPosts(req.user.userId, type, sortBy, cursor, limit);
    }
    createComment(req, postId, dto) {
        return this.communityService.createComment(req.user.userId, postId, dto);
    }
    vote(req, id, body) {
        return this.communityService.vote(req.user.userId, id, { value: body.value });
    }
    viewPost(id) {
        return this.communityService.incrementView(id);
    }
    follow(req, targetId) {
        return this.communityService.followUser(req.user.userId, targetId);
    }
    unfollow(req, targetId) {
        return this.communityService.unfollowUser(req.user.userId, targetId);
    }
    getSuggestions(req) {
        return this.communityService.getSuggestions(req.user.userId);
    }
    uploadFile(file) {
        console.log("File uploaded:", file);
        return {
            url: `/uploads/${file.filename}`,
            type: file.mimetype.startsWith('image/') ? 'IMAGE' : 'VIDEO'
        };
    }
};
exports.CommunityController = CommunityController;
__decorate([
    (0, common_1.Post)('posts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, community_dto_1.CreatePostDto]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "createPost", null);
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('sortBy')),
    __param(3, (0, common_1.Query)('cursor')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, Number]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('posts/:id/comments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, community_dto_1.CreateCommentDto]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "createComment", null);
__decorate([
    (0, common_1.Post)('posts/:id/vote'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "vote", null);
__decorate([
    (0, common_1.Post)('posts/:id/view'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "viewPost", null);
__decorate([
    (0, common_1.Post)('follow/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "follow", null);
__decorate([
    (0, common_1.Post)('unfollow/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "unfollow", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "getSuggestions", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './public/uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CommunityController.prototype, "uploadFile", null);
exports.CommunityController = CommunityController = __decorate([
    (0, swagger_1.ApiTags)('Community'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('community'),
    __metadata("design:paramtypes", [community_service_1.CommunityService])
], CommunityController);
//# sourceMappingURL=community.controller.js.map