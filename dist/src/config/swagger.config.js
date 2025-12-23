"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = require("@nestjs/swagger");
function setupSwagger(app) {
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Online Lecturer Management System API')
        .setDescription('RESTful API for managing online/visiting lectures, courses, students, and scheduling for university visiting lecturers.')
        .setVersion('1.0')
        .addTag('Auth', 'Authentication and authorization endpoints')
        .addTag('Lecturers', 'Lecturer management endpoints')
        .addTag('Students', 'Student management endpoints')
        .addTag('Admin', 'Admin management endpoints')
        .addTag('Courses', 'Course management endpoints')
        .addTag('Classes', 'Class/Session management endpoints')
        .addTag('Payments', 'Payment tracking endpoints')
        .addTag('Content', 'Learning content management endpoints')
        .addTag('Student Groups', 'Student group management endpoints')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationsSorter: 'alpha',
        },
    });
}
//# sourceMappingURL=swagger.config.js.map