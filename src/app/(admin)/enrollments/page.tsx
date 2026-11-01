
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Enrollment = {
  enrollment_id: number | string;
  student_id: string;
  course_id: string;
  enrollment_date: string;
  status: string;
};

const emptyForm = {
  student_id: "",
  course_id: "",
  enrollment_date: "",
  status: "Enrolled",
};

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  // Load enrollments when page opens
  useEffect(() => {
    let ignore = false;

    fetch("/api/enrollments")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load enrollments");
        }

        return data;
      })
      .then((data) => {
        if (!ignore) {
          setEnrollments(data.enrollments);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load enrollments"
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

  // Refresh enrollments after CRUD operations
  async function fetchEnrollments() {
    try {
      const response = await fetch("/api/enrollments");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load enrollments");
      }

      setEnrollments(data.enrollments);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load enrollments"
      );
    }
  }

  // Open Add Enrollment form
  function openAddForm() {
    setEditId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Open Edit Enrollment form
  function openEditForm(enrollment: Enrollment) {
    setEditId(enrollment.enrollment_id);

    setForm({
      student_id: enrollment.student_id,
      course_id: enrollment.course_id,
      enrollment_date: enrollment.enrollment_date.slice(0, 10),
      status: enrollment.status,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Reset form
  function resetForm() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  // Add or Update Enrollment
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const url =
        editId === null
          ? "/api/enrollments"
          : `/api/enrollments/${editId}`;

      const response = await fetch(url, {
        method: editId === null ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Operation failed");
        return;
      }

      setMessage(
        editId === null
          ? "Enrollment added successfully!"
          : "Enrollment updated successfully!"
      );

      resetForm();
      await fetchEnrollments();
    } catch {
      setError("Unable to connect to server");
    }
  }

  // Delete Enrollment
  async function handleDelete(id: number | string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this enrollment?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/enrollments/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to delete enrollment");
        return;
      }

      setMessage("Enrollment deleted successfully!");

      if (editId === id) {
        resetForm();
      }

      await fetchEnrollments();
    } catch {
      setError("Unable to connect to server");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Enrollment
            </h1>

            <p className="text-slate-500 mt-2">
              Manage student course enrollments
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAddForm}
              className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
            >
              + Add Enrollment
            </button>

            <Link
              href="/"
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
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

        {/* Add / Edit Enrollment Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editId !== null ? "Edit Enrollment" : "Add New Enrollment"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <input
                required
                placeholder="Student ID (e.g. S001)"
                value={form.student_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    student_id: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                placeholder="Course ID (e.g. C101)"
                value={form.course_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    course_id: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                type="date"
                value={form.enrollment_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    enrollment_date: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              >
                <option value="Enrolled">Enrolled</option>
                <option value="Completed">Completed</option>
                <option value="Dropped">Dropped</option>
              </select>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700"
              >
                {editId !== null ? "Update Enrollment" : "Save Enrollment"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-500 text-white rounded-lg p-3 hover:bg-slate-600"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Enrollment Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">
            All Enrollments ({enrollments.length})
          </h2>

          {loading ? (
            <p>Loading enrollments...</p>
          ) : enrollments.length === 0 ? (
            <p className="text-slate-500">
              No enrollment records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-4">Enrollment ID</th>
                    <th className="py-4">Student ID</th>
                    <th className="py-4">Course ID</th>
                    <th className="py-4">Date</th>
                    <th className="py-4">Status</th>
                    <th className="py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr
                      key={enrollment.enrollment_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">
                        {enrollment.enrollment_id}
                      </td>

                      <td className="py-4 font-medium">
                        {enrollment.student_id}
                      </td>

                      <td className="py-4">
                        {enrollment.course_id}
                      </td>

                      <td className="py-4">
                        {enrollment.enrollment_date.slice(0, 10)}
                      </td>

                      <td className="py-4">
                        {enrollment.status}
                      </td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(enrollment)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(enrollment.enrollment_id)
                            }
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
