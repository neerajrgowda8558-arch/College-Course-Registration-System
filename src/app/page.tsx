
import Link from "next/link";
import { redirect } from "next/navigation";
import pool from "../lib/db";
import { getSessionUser } from "../lib/auth";
import LogoutButton from "../components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Verify administrator access
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/student-dashboard");
  }

  // Fetch dashboard statistics
  const [
    studentCount,
    courseCount,
    enrollmentCount,
    facultyCount,
  ] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS count FROM students"),
    pool.query("SELECT COUNT(*)::int AS count FROM courses"),
    pool.query("SELECT COUNT(*)::int AS count FROM enrollments"),
    pool.query("SELECT COUNT(*)::int AS count FROM faculty"),
  ]);

  // Fetch student details
  const studentsResult = await pool.query(`
    SELECT student_id, student_name, department, semester
    FROM students
    ORDER BY student_id
    LIMIT 5
  `);

  // Fetch courses and their assigned faculty
  const coursesResult = await pool.query(`
    SELECT
      c.course_id,
      c.course_name,
      c.credits,
      COALESCE(
        STRING_AGG(f.faculty_name, ', '),
        'Not assigned'
      ) AS faculty
    FROM courses c
    LEFT JOIN faculty_courses fc
      ON c.course_id = fc.course_id
    LEFT JOIN faculty f
      ON fc.faculty_id = f.faculty_id
    GROUP BY c.course_id, c.course_name, c.credits
    ORDER BY c.course_id
  `);

  const students = studentsResult.rows;
  const courses = coursesResult.rows;

  const menu = [
    { label: "Dashboard", href: "/" },
    { label: "Students", href: "/students" },
    { label: "Courses", href: "/courses" },
    { label: "Faculty", href: "/faculty" },
    { label: "Enrollments", href: "/enrollments" },
    { label: "Attendance", href: "/attendance" },
    { label: "Marks", href: "/marks" },
    { label: "Prerequisites", href: "/prerequisites" },
  ];

  const stats = [
    {
      label: "Total Students",
      value: studentCount.rows[0].count,
      icon: "🎓",
    },
    {
      label: "Total Courses",
      value: courseCount.rows[0].count,
      icon: "📚",
    },
    {
      label: "Enrollments",
      value: enrollmentCount.rows[0].count,
      icon: "📝",
    },
    {
      label: "Faculty Members",
      value: facultyCount.rows[0].count,
      icon: "👨‍🏫",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 bg-slate-950 p-6 text-white md:block">
          <h1 className="mb-2 text-2xl font-bold">
            CourseHub
          </h1>

          <p className="mb-10 text-sm text-slate-400">
            College Registration System
          </p>

          <nav className="space-y-2">
            {menu.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`block rounded-lg px-4 py-3 ${
                  item.href === "/"
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-16 border-t border-slate-700 pt-5">
            <p className="text-sm text-slate-400">
              Academic Year
            </p>
            <p className="mt-1 font-semibold">
              2026 - 2027
            </p>
          </div>
        </aside>

        {/* Main Dashboard */}
        <main className="flex-1 p-6 md:p-10">
          {/* Header */}
          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold">
                Dashboard
              </h2>
              <p className="mt-2 text-slate-500">
                College Course Registration Management
              </p>
            </div>

            {/* Administrator information and Logout */}
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
                <p className="font-semibold">
                  Administrator
                </p>
                <p className="text-xs text-slate-500">
                  System Admin
                </p>
              </div>

              <LogoutButton />
            </div>
          </header>

          {/* Statistics */}
          <section className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl bg-white p-6 shadow-sm"
              >
                <p className="text-2xl">
                  {stat.icon}
                </p>
                <p className="mt-4 text-sm text-slate-500">
                  {stat.label}
                </p>
                <h3 className="mt-1 text-3xl font-bold">
                  {stat.value}
                </h3>
              </div>
            ))}
          </section>

          {/* Student Details */}
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Student Details
              </h3>

              <Link
                href="/students"
                className="text-sm text-blue-600 hover:underline"
              >
                View all students
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="py-3">Student ID</th>
                    <th className="py-3">Student Name</th>
                    <th className="py-3">Department</th>
                    <th className="py-3">Semester</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.student_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">
                        {student.student_id}
                      </td>
                      <td className="py-4 font-medium">
                        {student.student_name}
                      </td>
                      <td className="py-4">
                        {student.department}
                      </td>
                      <td className="py-4">
                        {student.semester}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Available Courses */}
          <section className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                Available Courses
              </h3>

              <Link
                href="/courses"
                className="text-sm text-blue-600 hover:underline"
              >
                View all courses
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-slate-500">
                    <th className="py-3">Course ID</th>
                    <th className="py-3">Course Name</th>
                    <th className="py-3">Credits</th>
                    <th className="py-3">Faculty</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.course_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">
                        {course.course_id}
                      </td>
                      <td className="py-4 font-medium">
                        {course.course_name}
                      </td>
                      <td className="py-4">
                        {course.credits}
                      </td>
                      <td className="py-4">
                        {course.faculty}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-10 text-center text-sm text-slate-500">
            College Course Registration System © 2026
          </footer>
        </main>
      </div>
    </div>
  );
}
