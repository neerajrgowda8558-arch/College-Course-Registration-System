# College Course Registration System (CourseHub)

## 1. Project Overview

CourseHub is a DBMS mini project designed to manage college course registration and academic records.

The system integrates **PostgreSQL** as a relational database and **Neo4j** as a graph database. It provides separate Admin and Student interfaces using role-based authentication.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Relational Database | PostgreSQL |
| Graph Database | Neo4j |
| Authentication | JWT, bcrypt |
| Development Environment | VS Code |

## 3. Features

### Admin Features

- Admin login and logout
- Manage student records
- Manage course records
- Manage faculty records
- Manage student enrollments
- Manage attendance records
- Manage student marks and grades
- View course prerequisites using Neo4j
- Perform CRUD operations through PostgreSQL-backed APIs

### Student Features

- Student login and logout
- View personal academic profile
- View enrolled courses and enrollment status
- View personal attendance records
- View marks and grades
- Access a dedicated Student Dashboard

### Security Features

- Password verification using bcrypt
- JWT-based session authentication
- Role-based access control
- Admin-only API endpoints
- Server-side protection of Admin pages
- Student access restricted to their own dashboard

## 4. Database Design

### PostgreSQL

The relational database is named:

`college_course_registration`

Main tables:

1. students
2. courses
3. faculty
4. enrollments
5. attendance
6. marks
7. faculty_courses
8. course_prerequisites
9. app_users

The database supports relationships between students, courses, faculty, enrollments, attendance, and assessments.

The project also uses SQL features including joins, functions, views, triggers, and indexes.

### Neo4j

Neo4j is used to represent course prerequisite relationships.

Example graph relationship:

`(Course)-[:HAS_PREREQUISITE]->(PrerequisiteCourse)`

Neo4j allows prerequisite dependencies to be represented and queried as a graph.

## 5. Project Structure

```text
src/
  app/
    (admin)/
      attendance/
      courses/
      enrollments/
      faculty/
      marks/
      prerequisites/
      layout.tsx
    api/
      attendance/
      auth/
      courses/
      enrollments/
      faculty/
      marks/
      prerequisites/
      students/
      test-db/
      test-neo4j/
    login/
    student-dashboard/
    students/
    page.tsx
  components/
    LogoutButton.tsx
  lib/
    auth.ts
    db.ts
    neo4j.ts
    requireAdmin.ts
```

## 6. Installation and Setup

### Prerequisites

Install the following software:

- Node.js and npm
- PostgreSQL
- pgAdmin (optional)
- Neo4j
- VS Code (recommended)

### Clone the Repository

```bash
git clone https://github.com/neerajrgowda8558-arch/College-Course-Registration-System.git
cd College-Course-Registration-System
```

### Install Dependencies

```bash
npm install
```

### Configure PostgreSQL

Create a PostgreSQL database named:

`college_course_registration`

Create the required tables and database objects using the project's SQL schema.

### Configure Neo4j

Start the Neo4j database and configure the course nodes and prerequisite relationships.

### Configure Environment Variables

Create a `.env.local` file in the project root.

Configure the PostgreSQL connection, Neo4j connection, and session secret using the environment variable names expected by the source code.

Do not commit `.env.local` or share actual database passwords.

### Run the Application

```bash
npm run dev
```

Open:

http://localhost:3000

### Production Build

```bash
npm run build
```

## 7. Application Pages

| Page | URL | Access |
|---|---|---|
| Login | `/login` | Public |
| Admin Dashboard | `/` | Admin |
| Student Dashboard | `/student-dashboard` | Student |
| Students | `/students` | Admin |
| Courses | `/courses` | Admin |
| Faculty | `/faculty` | Admin |
| Enrollments | `/enrollments` | Admin |
| Attendance | `/attendance` | Admin |
| Marks | `/marks` | Admin |
| Prerequisites | `/prerequisites` | Admin |

## 8. Testing

The project has been tested for:

- PostgreSQL database connectivity
- Neo4j database connectivity
- Admin login and dashboard access
- Student login and dashboard access
- Student restrictions on Admin pages
- Student restrictions on protected APIs
- Successful Next.js production build and TypeScript checks

## 9. Future Enhancements

- Online course registration requests by students
- Automatic prerequisite eligibility validation
- Faculty-specific dashboards
- Academic reports and analytics
- Timetable and semester scheduling

## 10. Conclusion

The College Course Registration System demonstrates the integration of relational and graph databases in a web application.

PostgreSQL manages structured academic records, while Neo4j represents course prerequisite relationships. Next.js provides the application interface and backend APIs, with role-based authentication separating Admin and Student access.
