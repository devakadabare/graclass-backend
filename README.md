# GradClass Backend API

Backend API server for the GradClass Online Lecturer Management System built with NestJS, Prisma, and MySQL.

## Tech Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **ORM**: Prisma 5.22.0
- **Database**: MySQL 8.x
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm
- MySQL 8.0+
- Git

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Configure the following environment variables:

```env
# Database
DATABASE_URL="mysql://root:root@localhost:3306/grad_class"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRATION="1h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRATION="7d"

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Security Notes:**
- Change all secret keys in production
- Use strong, randomly generated secrets
- Never commit `.env` file to version control

### 3. Database Setup

#### Create Database
```bash
# MySQL CLI
mysql -u root -p
CREATE DATABASE grad_class;
exit;
```

#### Run Migrations
```bash
npm run prisma:migrate
```

#### Seed Database (Optional)
```bash
npm run prisma:seed
```

### 4. Start Development Server

```bash
npm run start:dev
```

The server will start on http://localhost:3000

### 5. Access API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api
- **API Base URL**: http://localhost:3000/api/v1

## Available Scripts

### Development
```bash
npm run start:dev      # Start in watch mode (recommended for development)
npm run start          # Start in production mode
npm run start:debug    # Start in debug mode
```

### Building
```bash
npm run build          # Build for production
```

### Database Management
```bash
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm run prisma:seed      # Seed the database with test data
```

### Testing
```bash
npm run test           # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:e2e       # Run end-to-end tests
```

### Code Quality
```bash
npm run lint           # Lint code
npm run format         # Format code with Prettier
```

## Project Structure

```
backend/
├── src/
│   ├── common/                 # Shared utilities and decorators
│   │   ├── decorators/        # Custom decorators (CurrentUser, Roles, etc.)
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth guards (JWT, Roles)
│   │   ├── interceptors/      # Response interceptors
│   │   └── pipes/             # Validation pipes
│   ├── config/                # Configuration files
│   ├── modules/               # Feature modules
│   │   ├── auth/             # Authentication & authorization
│   │   ├── lecturer/         # Lecturer management
│   │   ├── student/          # Student management
│   │   ├── admin/            # Admin features
│   │   ├── course/           # Course management
│   │   ├── class/            # Class scheduling
│   │   ├── enrollment/       # Enrollment management
│   │   ├── availability/     # Lecturer availability
│   │   ├── group/            # Student groups
│   │   ├── dashboard/        # Dashboard statistics
│   │   └── prisma/           # Prisma service
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migration files
│   └── seed.ts               # Database seeder
├── test/                     # Test files
├── .env                      # Environment variables (create this)
├── .env.example              # Environment variables template
├── nest-cli.json             # NestJS CLI configuration
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This file
```

## API Modules

### Authentication (`/api/v1/auth`)
- Register (Lecturer/Student)
- Login
- Refresh Token
- Logout

### Lecturer (`/api/v1/lecturer`)
- Profile management
- Public profile viewing
- Lecturer listing

### Student (`/api/v1/student`)
- Profile management
- Course enrollment
- Enrollment status tracking
- Class viewing

### Admin (`/api/v1/admin`)
- User management (list, view, activate/deactivate)
- System statistics
- Course oversight
- Enrollment monitoring

### Courses (`/api/v1/courses`)
- Create, read, update, delete courses
- Search courses
- View course details
- Lecturer-owned courses

### Classes (`/api/v1/classes`)
- Schedule classes
- View scheduled classes
- Update class details
- Cancel classes

### Enrollments (`/api/v1/enrollments`)
- View enrollment requests
- Approve/reject enrollments
- Enrollment statistics
- Filter by status

### Availability (`/api/v1/availability`)
- Set lecturer availability slots
- View availability by lecturer
- Manage recurring slots
- Update/delete slots

### Groups (`/api/v1/groups`)
- Create student study groups
- Join/leave groups
- View group members
- Group management

### Dashboard (`/api/v1/dashboard`)
- Lecturer statistics
- Student statistics
- Course analytics

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with the following flow:

1. **Register/Login**: Receive access token + refresh token
2. **Authenticated Requests**: Include access token in `Authorization` header
3. **Token Refresh**: Use refresh token to get new access token when expired

### Making Authenticated Requests

```bash
# Include JWT token in Authorization header
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     http://localhost:3000/api/v1/lecturer/profile
```

### Token Expiration
- **Access Token**: 1 hour (configurable via `JWT_EXPIRATION`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_EXPIRATION`)

## Database Schema

### Core Entities

**User**
- Base authentication entity
- Roles: `LECTURER`, `STUDENT`, `ADMIN`
- Email, password, active status

**Lecturer**
- Profile information (name, bio, qualifications)
- Related to User (one-to-one)
- Courses, availability, classes

**Student**
- Profile information (name, university, student ID)
- Related to User (one-to-one)
- Enrollments, groups

**Course**
- Name, description, subject, level
- Duration, hourly rate
- Created by lecturer

**Class**
- Scheduled class session
- Date, time, location/meeting link
- Related to course and enrollment

**CourseEnrollment**
- Student enrollment in a course
- Status: `PENDING`, `APPROVED`, `REJECTED`
- Approval workflow

**StudentGroup**
- Study group created by students
- Multiple students can join
- Related to courses (optional)

**Availability**
- Lecturer availability slots
- Day of week, start/end time
- Recurring or one-time

## Role-Based Access Control (RBAC)

### Roles
- **ADMIN**: Full system access
- **LECTURER**: Course and class management
- **STUDENT**: Enrollment and group management

### Protected Routes
Routes are protected using `@Roles()` decorator:

```typescript
@Roles(UserRole.LECTURER)
@Get('profile')
getProfile() { ... }
```

## Error Handling

The API returns consistent error responses:

```json
{
  "statusCode": 400,
  "timestamp": "2025-12-23T12:00:00.000Z",
  "path": "/api/v1/courses",
  "method": "POST",
  "message": "Validation failed"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Validation

Request validation is handled using:
- `class-validator` decorators in DTOs
- `ValidationPipe` globally applied
- Custom validation rules where needed

Example:
```typescript
export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
```

## Swagger Documentation

Interactive API documentation is available at http://localhost:3000/api

Features:
- Try out endpoints directly
- View request/response schemas
- Authentication support
- Example values

## Development Tips

### Hot Reload
The development server (`npm run start:dev`) supports hot reload. Changes to TypeScript files will automatically restart the server.

### Debugging
1. Start in debug mode: `npm run start:debug`
2. Attach debugger in VS Code (port 9229)
3. Set breakpoints in your code

### Database Changes
1. Modify `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name your_migration_name`
3. Prisma Client updates automatically

### Viewing Database
```bash
npm run prisma:studio
```
Opens a web interface to browse and edit database records.

## Testing

### Unit Tests
Located in `*.spec.ts` files alongside source files.

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:cov          # With coverage report
```

### E2E Tests
Located in `test/` directory.

```bash
npm run test:e2e
```

## Deployment

### Production Build

```bash
# Build the application
npm run build

# The compiled JavaScript is in the dist/ folder
# Start production server
npm run start:prod
```

### Environment Variables
Ensure all production environment variables are properly set:
- Use strong, unique secrets
- Configure production database URL
- Set `NODE_ENV=production`

### Database Migrations
Run migrations on production:

```bash
npx prisma migrate deploy
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists and is accessible

### Port Already in Use
```bash
# Change PORT in .env file, or
# Kill process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill //PID <PID> //F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Prisma Client Issues
```bash
# Regenerate Prisma Client
npm run prisma:generate
```

### JWT Authentication Errors
- Verify JWT_SECRET is set in `.env`
- Check token expiration settings
- Ensure Authorization header format: `Bearer <token>`

## Support & Documentation

- **API Documentation**: http://localhost:3000/api (when server is running)
- **Prisma Documentation**: https://www.prisma.io/docs
- **NestJS Documentation**: https://docs.nestjs.com
- **Project Documentation**: See `../.claude/` folder

## Contributing

1. Follow TypeScript and NestJS best practices
2. Write tests for new features
3. Update Swagger documentation
4. Run linter before committing: `npm run lint`
5. Use conventional commit messages

## License

UNLICENSED - Private project

---

**GradClass Backend** - Built with ❤️ using NestJS, Prisma, and MySQL
