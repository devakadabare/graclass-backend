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
var AvailabilityService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailabilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AvailabilityService = AvailabilityService_1 = class AvailabilityService {
    prisma;
    logger = new common_1.Logger(AvailabilityService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createAvailability(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        if (dto.isRecurring && dto.dayOfWeek === undefined) {
            throw new common_1.BadRequestException('dayOfWeek is required for recurring availability');
        }
        if (!dto.isRecurring && !dto.specificDate) {
            throw new common_1.BadRequestException('specificDate is required for one-time availability');
        }
        if (dto.startTime >= dto.endTime) {
            throw new common_1.BadRequestException('startTime must be before endTime');
        }
        const availability = await this.prisma.availability.create({
            data: {
                lecturerId: user.lecturer.id,
                isRecurring: dto.isRecurring,
                dayOfWeek: dto.isRecurring ? dto.dayOfWeek : null,
                specificDate: dto.specificDate ? new Date(dto.specificDate) : null,
                startTime: dto.startTime,
                endTime: dto.endTime,
            },
        });
        this.logger.log(`Availability created for ${user.email}: ${dto.isRecurring ? `Every ${this.getDayName(dto.dayOfWeek)}` : dto.specificDate} ${dto.startTime}-${dto.endTime}`);
        return availability;
    }
    async getLecturerAvailability(userId, includeExpired = false) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { lecturer: true },
        });
        if (!user || !user.lecturer) {
            throw new common_1.NotFoundException('Lecturer profile not found');
        }
        const where = {
            lecturerId: user.lecturer.id,
        };
        if (!includeExpired) {
            where.OR = [
                { isRecurring: true },
                {
                    AND: [{ isRecurring: false }, { specificDate: { gte: new Date() } }],
                },
            ];
        }
        const availabilities = await this.prisma.availability.findMany({
            where,
            orderBy: [
                { isRecurring: 'desc' },
                { dayOfWeek: 'asc' },
                { specificDate: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return availabilities.map((a) => ({
            ...a,
            dayName: a.dayOfWeek !== null ? this.getDayName(a.dayOfWeek) : null,
        }));
    }
    async getPublicAvailability(lecturerId) {
        const lecturer = await this.prisma.lecturer.findUnique({
            where: { id: lecturerId },
            include: { user: true },
        });
        if (!lecturer || !lecturer.user.isActive) {
            throw new common_1.NotFoundException('Lecturer not found');
        }
        const where = {
            lecturerId,
            OR: [
                { isRecurring: true },
                {
                    AND: [{ isRecurring: false }, { specificDate: { gte: new Date() } }],
                },
            ],
        };
        const availabilities = await this.prisma.availability.findMany({
            where,
            orderBy: [
                { isRecurring: 'desc' },
                { dayOfWeek: 'asc' },
                { specificDate: 'asc' },
                { startTime: 'asc' },
            ],
        });
        return availabilities.map((a) => ({
            id: a.id,
            isRecurring: a.isRecurring,
            dayOfWeek: a.dayOfWeek,
            dayName: a.dayOfWeek !== null ? this.getDayName(a.dayOfWeek) : null,
            specificDate: a.specificDate,
            startTime: a.startTime,
            endTime: a.endTime,
        }));
    }
    async updateAvailability(availabilityId, userId, dto) {
        const availability = await this.prisma.availability.findUnique({
            where: { id: availabilityId },
            include: {
                lecturer: {
                    include: { user: true },
                },
            },
        });
        if (!availability) {
            throw new common_1.NotFoundException('Availability not found');
        }
        if (availability.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this availability');
        }
        const newStartTime = dto.startTime || availability.startTime;
        const newEndTime = dto.endTime || availability.endTime;
        if (newStartTime >= newEndTime) {
            throw new common_1.BadRequestException('startTime must be before endTime');
        }
        const updated = await this.prisma.availability.update({
            where: { id: availabilityId },
            data: dto,
        });
        this.logger.log(`Availability updated by ${availability.lecturer.user.email}`);
        return updated;
    }
    async deleteAvailability(availabilityId, userId) {
        const availability = await this.prisma.availability.findUnique({
            where: { id: availabilityId },
            include: {
                lecturer: {
                    include: { user: true },
                },
            },
        });
        if (!availability) {
            throw new common_1.NotFoundException('Availability not found');
        }
        if (availability.lecturer.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to delete this availability');
        }
        await this.prisma.availability.delete({
            where: { id: availabilityId },
        });
        this.logger.log(`Availability deleted by ${availability.lecturer.user.email}`);
        return { message: 'Availability successfully deleted' };
    }
    getDayName(dayOfWeek) {
        const days = [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ];
        return days[dayOfWeek] || 'Unknown';
    }
};
exports.AvailabilityService = AvailabilityService;
exports.AvailabilityService = AvailabilityService = AvailabilityService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AvailabilityService);
//# sourceMappingURL=availability.service.js.map