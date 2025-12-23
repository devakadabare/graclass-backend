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
exports.CreateAvailabilityDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateAvailabilityDto {
    isRecurring;
    dayOfWeek;
    specificDate;
    startTime;
    endTime;
}
exports.CreateAvailabilityDto = CreateAvailabilityDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether this is a recurring availability',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAvailabilityDto.prototype, "isRecurring", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Day of week for recurring availability (0=Sunday, 6=Saturday)',
        example: 1,
        minimum: 0,
        maximum: 6,
    }),
    (0, class_validator_1.ValidateIf)((o) => o.isRecurring === true),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(6),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAvailabilityDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Specific date for one-time availability (YYYY-MM-DD)',
        example: '2025-12-25',
    }),
    (0, class_validator_1.ValidateIf)((o) => o.isRecurring === false),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'specificDate must be in YYYY-MM-DD format',
    }),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "specificDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time (HH:mm format)',
        example: '09:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'startTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time (HH:mm format)',
        example: '17:00',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'endTime must be in HH:mm format',
    }),
    __metadata("design:type", String)
], CreateAvailabilityDto.prototype, "endTime", void 0);
//# sourceMappingURL=create-availability.dto.js.map