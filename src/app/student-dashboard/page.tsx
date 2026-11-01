
import { redirect } from "next/navigation";
import Link from "next/link";
import pool from "../../lib/db";
import { getSessionUser } from "../../lib/auth";
import LogoutButton from "../../components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  // Verify the logged-in student
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "student" || !session.studentId) {
    redirect("/");
  }

  const studentId = session.studentId;

  // Fetch student details
  const studentResult = await pool.query(
    `SELECT student_id, student_name, department, semester
     FROM students
     WHERE student_id = $1`,
    [studentId]
  );

  if (studentResult.rows.length === 0) {
    return (
      <div className="min-h-screen bg-slate-100 p-10 text-slate-800">
        <h1 className="text-2xl font-bold">
          Student record not found
        </h1>
        <p className="mt-3">
          Please contact your administrator.
        </p>
      </div>
    );
  }

  const student = studentResult.rows[0];

  // Fetch enrolled courses
  const enrollmentResult = await pool.query(
    `SELECT
       e.enrollment_id,
       e.enrollment_date,
       e.status,
       c.course_id,
       c.course_name,
       c.credits
     FROM enrollments e
     JOIN courses c
       ON e.course_id = c.course_id
     WHERE e.student_id = $1
     ORDER BY c.course_id`,
    [studentId]
  );

  // Fetch attendance using actual PostgreSQL columns
  const attendanceResult = await pool.query(
    `SELECT
       c.course_name,
       COUNT(a.attendance_id)::int AS total_classes,
       COUNT(a.attendance_id) FILTER (
         WHERE LOWER(a.status) = 'present'
       )::int AS attended_classes
     FROM enrollments e
     JOIN courses c
       ON e.course_id = c.course_id
     LEFT JOIN attendance a
       ON a.enrollment_id = e.enrollment_id
     WHERE e.student_id = $1
     GROUP BY e.enrollment_id, c.course_id, c.course_name
     ORDER BY c.course_name`,
    [studentId]
  );

  // Fetch marks
  const marksResult = await pool.query(
    `SELECT
       c.course_name,
       m.internal_marks,
       m.external_marks,
       m.total_marks,
       m.grade
     FROM marks m
     JOIN enrollments e
       ON m.enrollment_id = e.enrollment_id
     JOIN courses c
       ON e.course_id = c.course_id
     WHERE e.student_id = $1
     ORDER BY c.course_name`,
    [studentId]
  );

  const enrollments = enrollmentResult.rows;
  const attendance = attendanceResult.rows;
  const marks = marksResult.rows;

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-slate-800 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">
              CourseHub
            </h1>
            <p className="mt-2 text-slate-500">
              Student Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
  <div className="rounded-xl bg-white px-5 py-3 shadow-sm">
    <p className="font-semibold">
      {student.student_name}
    </p>
    <p className="text-sm text-slate-500">
      Student Account
    </p>
  </div>

  <LogoutButton />
</div>
        </header>

        {/* Student Profile */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            My Profile
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-slate-500">
                Student ID
              </p>
              <p className="font-semibold">
                {student.student_id}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Student Name
              </p>
              <p className="font-semibold">
                {student.student_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Department
              </p>
              <p className="font-semibold">
                {student.department}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">
                Semester
              </p>
              <p className="font-semibold">
                {student.semester}
              </p>
            </div>
          </div>
        </section>

        {/* Enrolled Courses */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            My Enrolled Courses ({enrollments.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="py-3">Course ID</th>
                  <th className="py-3">Course Name</th>
                  <th className="py-3">Credits</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {enrollments.map((enrollment) => (
                  <tr
                    key={enrollment.enrollment_id}
                    className="border-b last:border-0"
                  >
                    <td className="py-4">
                      {enrollment.course_id}
                    </td>
                    <td className="py-4 font-medium">
                      {enrollment.course_name}
                    </td>
                    <td className="py-4">
                      {enrollment.credits}
                    </td>
                    <td className="py-4">
                      {enrollment.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {enrollments.length === 0 && (
              <p className="py-5 text-slate-500">
                No enrolled courses found.
              </p>
            )}
          </div>
        </section>

        {/* Attendance */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            My Attendance
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="py-3">Course</th>
                  <th className="py-3">Total Classes</th>
                  <th className="py-3">Attended</th>
                  <th className="py-3">Percentage</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((record, index) => {
                  const total = Number(record.total_classes);
                  const attended = Number(record.attended_classes);

                  const percentage =
                    total > 0
                      ? ((attended / total) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr
                      key={index}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">
                        {record.course_name}
                      </td>
                      <td className="py-4">
                        {total}
                      </td>
                      <td className="py-4">
                        {attended}
                      </td>
                      <td className="py-4 font-semibold">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {attendance.length === 0 && (
              <p className="py-5 text-slate-500">
                No attendance records found.
              </p>
            )}
          </div>
        </section>

        {/* Marks */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold">
            My Marks
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-sm text-slate-500">
                  <th className="py-3">Course</th>
                  <th className="py-3">Internal</th>
                  <th className="py-3">External</th>
                  <th className="py-3">Total</th>
                  <th className="py-3">Grade</th>
                </tr>
              </thead>

              <tbody>
                {marks.map((mark, index) => (
                  <tr
                    key={index}
                    className="border-b last:border-0"
                  >
                    <td className="py-4">
                      {mark.course_name}
                    </td>
                    <td className="py-4">
                      {mark.internal_marks}
                    </td>
                    <td className="py-4">
                      {mark.external_marks}
                    </td>
                    <td className="py-4 font-semibold">
                      {mark.total_marks}
                    </td>
                    <td className="py-4">
                      {mark.grade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {marks.length === 0 && (
              <p className="py-5 text-slate-500">
                No marks available.
              </p>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-10 text-center text-sm text-slate-500">
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Login Page
          </Link>

          <p className="mt-3">
            College Course Registration System © 2026
          </p>
        </footer>

      </div>
    </div>
  );
}
