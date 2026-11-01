
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Course {
  course_id: string;
  course_name: string;
  credits: number;
  department: string;
}

const emptyForm = {
  course_id: "",
  course_name: "",
  credits: "3",
  department: "",
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch courses
  async function fetchCourses() {
    try {
      const response = await fetch("/api/courses");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data.courses);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load courses"
      );
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch when page loads
  useEffect(() => {
    let ignore = false;

    fetch("/api/courses")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load courses");
        }

        if (!ignore) {
          setCourses(data.courses);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load courses"
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Open Add Course Form
  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Open Edit Course Form
  function openEditForm(course: Course) {
    setEditingId(course.course_id);

    setForm({
      course_id: course.course_id,
      course_name: course.course_name,
      credits: String(course.credits),
      department: course.department,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Add or Update Course
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");
    setSaving(true);

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing
          ? `/api/courses/${encodeURIComponent(editingId)}`
          : "/api/courses",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            course_id: form.course_id,
            course_name: form.course_name,
            credits: Number(form.credits),
            department: form.department,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(
        isEditing
          ? "Course updated successfully!"
          : "Course added successfully!"
      );

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchCourses();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save course"
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete Course
  async function handleDelete(courseId: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete course ${courseId}?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/courses/${encodeURIComponent(courseId)}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete course");
      }

      setMessage("Course deleted successfully!");

      await fetchCourses();

    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete course"
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Courses</h1>

            <p className="text-slate-500 mt-2">
              Manage registered courses
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAddForm}
              className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
            >
              + Add Course
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

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Edit Course" : "Add New Course"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <input
                required
                disabled={editingId !== null}
                placeholder="Course ID (e.g. C106)"
                value={form.course_id}
                onChange={(e) =>
                  setForm({ ...form, course_id: e.target.value })
                }
                className="border p-3 rounded-lg disabled:bg-slate-100"
              />

              <input
                required
                placeholder="Course Name"
                value={form.course_name}
                onChange={(e) =>
                  setForm({ ...form, course_name: e.target.value })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                type="number"
                min="1"
                max="10"
                placeholder="Credits"
                value={form.credits}
                onChange={(e) =>
                  setForm({ ...form, credits: e.target.value })
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

              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Course"
                  : "Save Course"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="bg-slate-500 text-white p-3 rounded-lg hover:bg-slate-600"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Courses Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">
            All Courses ({courses.length})
          </h2>

          {loading ? (
            <p>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-slate-500">No courses found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-4">Course ID</th>
                    <th className="py-4">Course Name</th>
                    <th className="py-4">Credits</th>
                    <th className="py-4">Department</th>
                    <th className="py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course) => (
                    <tr
                      key={course.course_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">{course.course_id}</td>

                      <td className="py-4 font-medium">
                        {course.course_name}
                      </td>

                      <td className="py-4">{course.credits}</td>

                      <td className="py-4">{course.department}</td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(course)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(course.course_id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
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
