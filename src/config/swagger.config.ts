import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Configure Swagger documentation
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Online Lecturer Management System API')
    .setDescription(
      'RESTful API for managing online/visiting lectures, courses, students, and scheduling for university visiting lecturers.',
    )
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
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
