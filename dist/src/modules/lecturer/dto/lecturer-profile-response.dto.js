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
exports.LecturerProfileResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
let LecturerProfileResponseDto = class LecturerProfileResponseDto {
    id;
    userId;
    firstName;
    lastName;
    phone;
    bio;
    qualifications;
    email;
    isActive;
    isEmailVerified;
    createdAt;
    updatedAt;
};
exports.LecturerProfileResponseDto = LecturerProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lecturer ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name',
        example: 'John',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name',
        example: 'Doe',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Phone number',
        example: '+1234567890',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Biography',
        example: 'Experienced software engineer with 10 years in web development',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "bio", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Qualifications',
        example: 'PhD in Computer Science, AWS Certified Solutions Architect',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "qualifications", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address',
        example: 'john.doe@example.com',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], LecturerProfileResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account status',
        example: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], LecturerProfileResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email verification status',
        example: false,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], LecturerProfileResponseDto.prototype, "isEmailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account creation date',
        example: '2025-12-22T10:00:00.000Z',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LecturerProfileResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update date',
        example: '2025-12-22T10:00:00.000Z',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], LecturerProfileResponseDto.prototype, "updatedAt", void 0);
exports.LecturerProfileResponseDto = LecturerProfileResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], LecturerProfileResponseDto);
//# sourceMappingURL=lecturer-profile-response.dto.js.map