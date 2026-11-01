
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  student_id: string;
  student_name: string;
  email: string;
  department: string;
  semester: number;
}

const initialForm = {
  student_id: "",
  student_name: "",
  email: "",
  department: "",
  semester: "4",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(initialForm);

  // Fetch all students
  async function fetchStudents() {
    try {
      const response = await fetch("/api/students");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load students");
      }

      setStudents(data.students);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to server"
      );
    } finally {
      setLoading(false);
    }
  }

  // Load students when page opens
  useEffect(() => {
    let ignore = false;

    async function loadStudents() {
      try {
        const response = await fetch("/api/students");
        const data = await response.json();

        if (ignore) return;

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load students");
        }

        setStudents(data.students);
      } catch {
        if (!ignore) {
          setError("Unable to load students");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      ignore = true;
    };
  }, []);

  // Open form for adding a student
  function handleAddClick() {
    setEditingId(null);
    setForm(initialForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  // Open form for editing a student
  function handleEdit(student: Student) {
    setEditingId(student.student_id);

    setForm({
      student_id: student.student_id,
      student_name: student.student_name,
      email: student.email,
      department: student.department,
      semester: String(student.semester),
    });

    setError("");
    setMessage("");
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Add or update student
  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing
          ? `/api/students/${editingId}`
          : "/api/students",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_name: form.student_name,
            email: form.email,
            department: form.department,
            semester: Number(form.semester),
            ...(isEditing ? {} : { student_id: form.student_id }),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(
        isEditing
          ? "Student updated successfully!"
          : "Student added successfully!"
      );

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);

      await fetchStudents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect to server"
      );
    }
  }

  // Delete student
  async function handleDelete(studentId: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete student ${studentId}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/students/${studentId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete student");
      }

      setMessage("Student deleted successfully!");

      await fetchStudents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete student"
      );
    }
  }

  // Close form
  function handleCloseForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(initialForm);
    setError("");
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Students
            </h1>

            <p className="text-slate-500 mt-2">
              Manage registered students
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddClick}
              className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
            >
              + Add Student
            </button>

            <Link
              href="/"
              className="bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Success Message */}
        {message && (
          <p className="bg-green-100 text-green-700 p-4 rounded-lg mb-5">
            {message}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p className="bg-red-100 text-red-700 p-4 rounded-lg mb-5">
            {error}
          </p>
        )}

        {/* Add / Edit Student Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Student" : "Add New Student"}
              </h2>

              <button
                onClick={handleCloseForm}
                className="text-red-600 hover:text-red-800"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <input
                required
                disabled={editingId !== null}
                placeholder="Student ID (e.g. S007)"
                value={form.student_id}
                onChange={(e) =>
                  setForm({ ...form, student_id: e.target.value })
                }
                className="border p-3 rounded-lg disabled:bg-slate-100"
              />

              <input
                required
                placeholder="Student Name"
                value={form.student_name}
                onChange={(e) =>
                  setForm({ ...form, student_name: e.target.value })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                placeholder="Department (e.g. CSE)"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="border p-3 rounded-lg"
              />

              <select
                value={form.semester}
                onChange={(e) =>
                  setForm({ ...form, semester: e.target.value })
                }
                className="border p-3 rounded-lg"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700"
              >
                {editingId ? "Update Student" : "Save Student"}
              </button>
            </form>
          </div>
        )}

        {/* Student Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">

          <h2 className="text-xl font-bold mb-6">
            All Students ({students.length})
          </h2>

          {loading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p className="text-slate-500">
              No students found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-4">Student ID</th>
                    <th className="py-4">Name</th>
                    <th className="py-4">Email</th>
                    <th className="py-4">Department</th>
                    <th className="py-4">Semester</th>
                    <th className="py-4">Actions</th>
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
                        {student.email}
                      </td>

                      <td className="py-4">
                        {student.department}
                      </td>

                      <td className="py-4">
                        {student.semester}
                      </td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(student.student_id)
                            }
                            className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
