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
exports.CreateCourseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCourseDto {
    name;
    description;
    subject;
    level;
    duration;
    hourlyRate;
}
exports.CreateCourseDto = CreateCourseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course name',
        example: 'Introduction to Web Development',
        minLength: 3,
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Course description',
        example: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Subject area',
        example: 'Web Development',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Course level',
        example: 'Beginner',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCourseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Session duration in minutes',
        example: 60,
        minimum: 15,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(15),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "duration", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hourly rate in USD',
        example: 50.0,
        minimum: 0,
    }),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateCourseDto.prototype, "hourlyRate", void 0);
//# sourceMappingURL=create-course.dto.js.map