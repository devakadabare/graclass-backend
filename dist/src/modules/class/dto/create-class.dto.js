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
exports.CreateClassDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ClassType;
(function (ClassType) {
    ClassType["INDIVIDUAL"] = "INDIVIDUAL";
    ClassType["GROUP"] = "GROUP";
})(ClassType || (ClassType = {}));
class CreateClassDto {
    courseId;
    studentId;
    studentGroupId;
    date;
    startTime;
    endTime;
    meetingLink;
    location;
}
exports.CreateClassDto = CreateClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Course ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "courseId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Student ID (for individual classes)',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Student Group ID (for group classes)',
        example: '550e8400-e29b-41d4-a716-446655440002',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "studentGroupId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Class date (YYYY-MM-DD)',
        example: '2025-12-25',
    }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "date", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time (HH:mm format)',
        example: '10:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'startTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], CreateClassDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time (HH:mm format)',
        example: '12:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'endTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], CreateClassDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Meeting URL for online class',
        example: 'https://meet.google.com/abc-defg-hij',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "meetingLink", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Location for physical class',
        example: 'Room 101, Building A',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateClassDto.prototype, "location", void 0);
//# sourceMappingURL=create-class.dto.js.map