"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient({
    log: ['error', 'warn'],
});
async function main() {
    console.log('🌱 Seeding database...');
    console.log('Cleaning existing data...');
    await prisma.payment.deleteMany();
    await prisma.class.deleteMany();
    await prisma.content.deleteMany();
    await prisma.courseEnrollment.deleteMany();
    await prisma.groupEnrollment.deleteMany();
    await prisma.studentGroup.deleteMany();
    await prisma.course.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.lecturerStudent.deleteMany();
    await prisma.lecturer.deleteMany();
    await prisma.student.deleteMany();
    await prisma.user.deleteMany();
    console.log('Creating admin user...');
    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@onlinelecturer.com',
            password: await bcrypt.hash('Admin123!', 10),
            role: client_1.UserRole.ADMIN,
            isActive: true,
            isEmailVerified: true,
        },
    });
    console.log(`✓ Admin created: ${adminUser.email}`);
    console.log('Creating lecturer 1...');
    const lecturer1User = await prisma.user.create({
        data: {
            email: 'john.doe@lecturer.com',
            password: await bcrypt.hash('Lecturer123!', 10),
            role: client_1.UserRole.LECTURER,
            isActive: true,
            isEmailVerified: true,
            lecturer: {
                create: {
                    firstName: 'John',
                    lastName: 'Doe',
                    phone: '+1234567890',
                    bio: 'Experienced mathematics tutor with 10+ years of teaching experience.',
                    qualifications: 'PhD in Mathematics from MIT, MSc in Applied Mathematics',
                },
            },
        },
        include: { lecturer: true },
    });
    console.log(`✓ Lecturer created: ${lecturer1User.email}`);
    console.log('Creating lecturer 2...');
    const lecturer2User = await prisma.user.create({
        data: {
            email: 'jane.smith@lecturer.com',
            password: await bcrypt.hash('Lecturer123!', 10),
            role: client_1.UserRole.LECTURER,
            isActive: true,
            isEmailVerified: true,
            lecturer: {
                create: {
                    firstName: 'Jane',
                    lastName: 'Smith',
                    phone: '+1234567891',
                    bio: 'Computer Science expert specializing in algorithms and data structures.',
                    qualifications: 'PhD in Computer Science from Stanford University',
                },
            },
        },
        include: { lecturer: true },
    });
    console.log(`✓ Lecturer created: ${lecturer2User.email}`);
    console.log('Creating students...');
    const student1User = await prisma.user.create({
        data: {
            email: 'alice.johnson@student.com',
            password: await bcrypt.hash('Student123!', 10),
            role: client_1.UserRole.STUDENT,
            isActive: true,
            isEmailVerified: true,
            student: {
                create: {
                    firstName: 'Alice',
                    lastName: 'Johnson',
                    phone: '+1234567892',
                    university: 'University of California',
                    studentId: 'UC2024001',
                },
            },
        },
        include: { student: true },
    });
    console.log(`✓ Student created: ${student1User.email}`);
    const student2User = await prisma.user.create({
        data: {
            email: 'bob.williams@student.com',
            password: await bcrypt.hash('Student123!', 10),
            role: client_1.UserRole.STUDENT,
            isActive: true,
            isEmailVerified: true,
            student: {
                create: {
                    firstName: 'Bob',
                    lastName: 'Williams',
                    phone: '+1234567893',
                    university: 'University of California',
                    studentId: 'UC2024002',
                },
            },
        },
        include: { student: true },
    });
    console.log(`✓ Student created: ${student2User.email}`);
    console.log('Creating courses...');
    const calculus = await prisma.course.create({
        data: {
            lecturerId: lecturer1User.lecturer.id,
            name: 'Advanced Calculus',
            description: 'University level calculus course covering limits, derivatives, integrals, and series.',
            subject: 'Mathematics',
            level: 'Advanced',
            duration: 60,
            hourlyRate: 50.0,
            isActive: true,
        },
    });
    console.log(`✓ Course created: ${calculus.name}`);
    const algorithms = await prisma.course.create({
        data: {
            lecturerId: lecturer2User.lecturer.id,
            name: 'Data Structures and Algorithms',
            description: 'Comprehensive course on algorithms, complexity analysis, and data structures.',
            subject: 'Computer Science',
            level: 'Intermediate',
            duration: 90,
            hourlyRate: 60.0,
            isActive: true,
        },
    });
    console.log(`✓ Course created: ${algorithms.name}`);
    console.log('Creating student group...');
    const studyGroup = await prisma.studentGroup.create({
        data: {
            name: 'UC Study Group',
            description: 'Group of UC students studying together',
            createdBy: student1User.student.id,
            isActive: true,
        },
    });
    console.log(`✓ Student group created: ${studyGroup.name}`);
    await prisma.groupEnrollment.create({
        data: {
            studentId: student2User.student.id,
            groupId: studyGroup.id,
            status: 'APPROVED',
        },
    });
    console.log('Enrolling students in courses...');
    await prisma.courseEnrollment.create({
        data: {
            courseId: calculus.id,
            studentId: student1User.student.id,
            status: 'APPROVED',
            approvedAt: new Date(),
        },
    });
    await prisma.courseEnrollment.create({
        data: {
            courseId: algorithms.id,
            studentId: student2User.student.id,
            status: 'APPROVED',
            approvedAt: new Date(),
        },
    });
    console.log('✓ Students enrolled in courses');
    console.log('Creating lecturer availability...');
    await prisma.availability.createMany({
        data: [
            {
                lecturerId: lecturer1User.lecturer.id,
                dayOfWeek: 1,
                startTime: '09:00',
                endTime: '17:00',
                isRecurring: true,
            },
            {
                lecturerId: lecturer1User.lecturer.id,
                dayOfWeek: 3,
                startTime: '09:00',
                endTime: '17:00',
                isRecurring: true,
            },
        ],
    });
    console.log('✓ Availability created');
    console.log('✅ Seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@onlinelecturer.com / Admin123!');
    console.log('Lecturer 1: john.doe@lecturer.com / Lecturer123!');
    console.log('Lecturer 2: jane.smith@lecturer.com / Lecturer123!');
    console.log('Student 1: alice.johnson@student.com / Student123!');
    console.log('Student 2: bob.williams@student.com / Student123!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map