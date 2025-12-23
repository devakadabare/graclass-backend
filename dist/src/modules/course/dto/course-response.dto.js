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
exports.CourseResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
let CourseResponseDto = class CourseResponseDto {
    id;
    lecturerId;
    name;
    description;
    subject;
    level;
    duration;
    hourlyRate;
    isActive;
    createdAt;
    updatedAt;
};
exports.CourseResponseDto = CourseResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Lecturer ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "lecturerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course name',
        example: 'Introduction to Web Development',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Course description',
        example: 'Learn the fundamentals of web development',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject area',
        example: 'Web Development',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Course level',
        example: 'Beginner',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], CourseResponseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session duration in minutes',
        example: 60,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hourly rate',
        example: 50.0,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], CourseResponseDto.prototype, "hourlyRate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the course is active',
        example: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], CourseResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Creation date',
        example: '2025-12-22T10:00:00.000Z',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], CourseResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update date',
        example: '2025-12-22T10:00:00.000Z',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], CourseResponseDto.prototype, "updatedAt", void 0);
exports.CourseResponseDto = CourseResponseDto = __decorate([
    (0, class_transformer_1.Exclude)()
], CourseResponseDto);
//# sourceMappingURL=course-response.dto.js.map