# College Course Registration System (CourseHub)

## 1. Project Overview

CourseHub is a DBMS mini project developed to manage college course registration and academic records.

The system integrates **PostgreSQL** as a relational database and **Neo4j** as a graph database. It provides separate Admin and Student interfaces using role-based authentication.

The project demonstrates relational database operations, graph-based course prerequisite relationships, database connectivity, authentication, and full-stack web application development.

## 2. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Relational Database | PostgreSQL |
| Graph Database | Neo4j |
| Authentication | JWT, bcryptjs |
| Development Environment | VS Code |
| Version Control | Git and GitHub |

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
- Access an Admin Dashboard

### Student Features

- Student login and logout
- View personal academic profile
- View enrolled courses and enrollment status
- View personal attendance records
- View marks and grades
- Access a dedicated Student Dashboard

### Security Features

- Password verification using bcryptjs
- JWT-based session authentication
- Role-based access control
- Admin-only API endpoints
- Server-side protection of Admin pages
- Student access restricted to their own dashboard
- Environment variables for database credentials and session secrets
- Password hashing for newly created accounts

## 4. Database Design

### 4.1 PostgreSQL

The relational database is named:

`college_course_registration`

The project contains nine main tables:

1. `students`
2. `courses`
3. `faculty`
4. `enrollments`
5. `attendance`
6. `marks`
7. `faculty_courses`
8. `course_prerequisites`
9. `app_users`

PostgreSQL manages structured academic records and relationships between students, courses, faculty, enrollments, attendance, and marks.

The project demonstrates the following SQL concepts:

- Primary keys and foreign keys
- Relational constraints
- SQL joins
- CRUD operations
- SQL functions
- Views
- Triggers
- Indexes

The database schema is provided in:

`database_schema.sql`

This file contains the database structure, including tables, functions, views, triggers, indexes, and constraints.

**Note:** The SQL file is a schema-only backup. It does not contain the original student, course, faculty, or login-account records.

### 4.2 ER Diagram and Relational Schema PDF

The ER diagram and the formatted relational schema document are available in the repository under `ER-Diagram and Relational_Schema/`.

**Entity–Relationship Diagram**

![CourseHub Entity–Relationship Diagram](ER-Diagram%20and%20Relational_Schema/ER-Diagram.jpeg)

**Relational Schema Document**

[View or download the Relational Schema PDF](ER-Diagram%20and%20Relational_Schema/Relational%20Schema.pdf)

These files are stored in the repository so readers can view the ER diagram directly in this README and open the relational schema PDF.

### 4.3 Neo4j

Neo4j is used to represent course prerequisite relationships.

Example:

`(Course)-[:HAS_PREREQUISITE]->(PrerequisiteCourse)`

This allows prerequisite dependencies to be stored and queried using a graph structure.

The Neo4j setup script is provided in:

`neo4j_setup.cypher`

The script creates five course nodes:

- C101 – Programming Fundamentals
- C102 – Data Structures
- C103 – Database Management Systems
- C104 – Operating Systems
- C105 – Computer Networks

It also creates five prerequisite relationships.

The script uses `MERGE` to avoid creating duplicate nodes or relationships when executed repeatedly against the same graph.

## 5. Project Structure

```text
College-Course-Registration-System/
├── scripts/
│   └── setup-accounts.js
├── src/
│   ├── app/
│   │   ├── (admin)/
│   │   │   ├── attendance/
│   │   │   ├── courses/
│   │   │   ├── enrollments/
│   │   │   ├── faculty/
│   │   │   ├── marks/
│   │   │   ├── prerequisites/
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   ├── attendance/
│   │   │   ├── auth/
│   │   │   ├── courses/
│   │   │   ├── enrollments/
│   │   │   ├── faculty/
│   │   │   ├── marks/
│   │   │   ├── prerequisites/
│   │   │   ├── students/
│   │   │   ├── test-db/
│   │   │   └── test-neo4j/
│   │   ├── login/
│   │   ├── student-dashboard/
│   │   ├── students/
│   │   └── page.tsx
│   ├── components/
│   │   └── LogoutButton.tsx
│   └── lib/
│       ├── auth.ts
│       ├── db.ts
│       ├── neo4j.ts
│       └── requireAdmin.ts
├── ER-Diagram and Relational_Schema/
│   ├── ER-Diagram.jpeg
│   └── Relational Schema.pdf
├── database_schema.sql
├── neo4j_setup.cypher
├── README.md
├── package.json
└── .gitignore
```

## 6. Installation and Setup

### 6.1 Prerequisites

Install the following software:

- Node.js (version supporting `process.loadEnvFile`) and npm
- PostgreSQL
- pgAdmin (optional)
- Neo4j
- Git
- VS Code (recommended)

### 6.2 Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/neerajrgowda8558-arch/College-Course-Registration-System.git
cd College-Course-Registration-System
```

### 6.3 Install Dependencies

Run:

```bash
npm install
```

This installs the required packages from `package.json`.

### 6.4 Configure PostgreSQL

**Step 1:** Start PostgreSQL.

**Step 2:** Open pgAdmin or another PostgreSQL client.

**Step 3:** Create a database named:

`college_course_registration`

**Step 4:** Import the PostgreSQL schema.

Using the `psql` command-line client:

```bash
psql -U postgres -d college_course_registration -f database_schema.sql
```

Alternatively, open `database_schema.sql` in pgAdmin's Query Tool for the newly created database and execute it.

This creates the database objects required by the application.

**Important:** Because the schema export does not contain application data, the database will initially have empty tables. Course, student, faculty, enrollment, and authentication records must be populated separately.

### 6.5 Configure Neo4j

**Step 1:** Start the Neo4j database.

**Step 2:** Open Neo4j Browser or the Neo4j query interface.

**Step 3:** Open the provided file:

`neo4j_setup.cypher`

**Step 4:** Execute its Cypher statements against the intended Neo4j database.

The script creates five course nodes and five prerequisite relationships.

**Step 5:** Verify the graph by running:

```cypher
MATCH (c:Course)-[:HAS_PREREQUISITE]->(p:Course)
RETURN c.course_id, c.course_name,
       p.course_id, p.course_name;
```

The query should return five prerequisite relationships.

### 6.6 Configure Environment Variables

Create a file named `.env.local` in the project root.

Add the following configuration:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_NAME=college_course_registration

# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password

# Authentication
SESSION_SECRET=replace_with_a_long_random_secret
```

Replace the placeholder values with your actual PostgreSQL credentials, Neo4j credentials, and a securely generated session secret.

The Neo4j URI may differ depending on whether Neo4j is installed locally or hosted remotely.

**Security:** Never upload `.env.local`, actual database passwords, or session secrets to GitHub.

The `NODE_ENV` variable is normally managed automatically by Next.js.

### 6.7 Configure Login Accounts

The application uses the PostgreSQL `app_users` table for authentication.

The schema backup creates this table but does not include existing user accounts.

The project provides an account setup script:

`scripts/setup-accounts.js`

**Step 1:** Make sure PostgreSQL is running and `.env.local` is configured.

**Step 2:** Open a terminal in the project folder.

**Step 3:** Run:

```bash
node scripts/setup-accounts.js
```

**Step 4:** Follow the terminal prompts.

The script asks for:

- Account role (`admin` or `student`)
- Username
- Password (minimum 12 characters)
- Existing student ID (required for Student accounts)

The script uses bcryptjs to securely hash passwords before storing them in PostgreSQL.

**For Admin accounts:** Select `admin`. A student ID is not required.

**For Student accounts:** Select `student` and provide an existing `student_id` from the `students` table.

A Student record must exist before its login account can be created because the database enforces a foreign key relationship between `app_users.student_id` and `students.student_id`.

The script creates new accounts and does not update existing accounts. Use a unique username.

**Security note:** Passwords are visible while entering them in the terminal. Run the script privately and do not share or record the passwords in screenshots, documentation, or GitHub.

### 6.8 Run the Application

Start the development server:

```bash
npm run dev
```

Open your browser and visit:

http://localhost:3000

The application will be accessible locally after the development server starts successfully.

### 6.9 Production Build

To verify the application builds successfully:

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

## 8. Database Integration

### PostgreSQL Integration

The Next.js backend connects to PostgreSQL to perform relational database operations.

PostgreSQL stores student information, course details, faculty records, enrollments, attendance, marks, and authentication data.

### Neo4j Integration

The application connects to Neo4j to retrieve course prerequisite relationships.

The graph database represents course dependencies using nodes and directed relationships.

Together, PostgreSQL and Neo4j demonstrate the integration of relational and graph database technologies in a single application.

## 9. Testing and Validation

The project has been tested for:

- PostgreSQL database connectivity
- Neo4j database connectivity
- Admin login and dashboard access
- Student login and dashboard access
- Admin access to management pages
- Student restrictions on Admin pages
- Student restrictions on protected API endpoints
- Logout functionality
- Successful Next.js production build
- TypeScript build checks
- Account setup script startup and JavaScript syntax validation

**Note:** The account setup script has been checked for syntax and confirmed to start. Successful creation of a new account through the script has not yet been verified.

### Database Verification

PostgreSQL tables can be verified using:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Neo4j prerequisite relationships can be verified using:

```cypher
MATCH (c:Course)-[r:HAS_PREREQUISITE]->(p:Course)
RETURN c, r, p;
```

## 10. Future Enhancements

Possible future improvements include:

- Online course registration requests by students
- Automatic prerequisite eligibility validation
- Faculty-specific dashboards
- Academic performance reports and analytics
- Timetable and semester scheduling
- Advanced course recommendations
- Additional student self-service features

## 11. Conclusion

The College Course Registration System demonstrates the integration of relational and graph databases in a full-stack web application.

PostgreSQL manages structured academic records, while Neo4j represents course prerequisite relationships.

Next.js provides the application interface and backend APIs, with role-based authentication separating Admin and Student access.

The project demonstrates important DBMS concepts, including database design, relational constraints, CRUD operations, SQL functions, views, triggers, indexes, graph relationships, and database-backed application development.

## 12. GitHub Repository

Project source code:

https://github.com/neerajrgowda8558-arch/College-Course-Registration-System

The repository contains the application source code, PostgreSQL schema, Neo4j setup script, project documentation, and account setup utility.
