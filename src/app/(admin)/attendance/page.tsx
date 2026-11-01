
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

interface Attendance {
  attendance_id: number | string;
  enrollment_id: number | string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  attendance_date: string;
  status: string;
}

const emptyForm = {
  enrollment_id: "",
  attendance_date: "",
  status: "Present",
};

// Convert database date into a local date for the date input
function formatDate(value: string) {
  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch attendance records
  async function fetchAttendance() {
    try {
      const response = await fetch("/api/attendance");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load attendance");
      }

      setAttendance(data.attendance);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load attendance"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;

    async function loadAttendance() {
      try {
        const response = await fetch("/api/attendance");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load attendance");
        }

        if (!ignore) {
          setAttendance(data.attendance);
        }
      } catch {
        if (!ignore) {
          setError("Unable to load attendance");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      ignore = true;
    };
  }, []);

  // Open Add form
  function openAddForm() {
    setEditId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Open Edit form
  function openEditForm(record: Attendance) {
    setEditId(record.attendance_id);

    setForm({
      enrollment_id: String(record.enrollment_id),
      attendance_date: formatDate(record.attendance_date),
      status: record.status,
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

  // Add or Update attendance
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        editId === null
          ? "/api/attendance"
          : `/api/attendance/${editId}`,
        {
          method: editId === null ? "POST" : "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            enrollment_id: Number(form.enrollment_id),
            attendance_date: form.attendance_date,
            status: form.status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Operation failed");
      }

      setMessage(
        editId === null
          ? "Attendance added successfully!"
          : "Attendance updated successfully!"
      );

      resetForm();
      await fetchAttendance();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save attendance"
      );
    }
  }

  // Delete attendance
  async function handleDelete(id: number | string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this attendance record?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/attendance/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Delete failed");
      }

      setMessage("Attendance deleted successfully!");

      if (editId === id) {
        resetForm();
      }

      await fetchAttendance();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete attendance"
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-8 text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Attendance</h1>
            <p className="text-slate-500 mt-2">
              Manage student attendance records
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAddForm}
              className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
            >
              + Add Attendance
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

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editId !== null
                ? "Edit Attendance"
                : "Add New Attendance"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <input
                required
                type="number"
                min="1"
                placeholder="Enrollment ID"
                value={form.enrollment_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    enrollment_id: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                type="date"
                value={form.attendance_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance_date: e.target.value,
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
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700"
              >
                {editId !== null
                  ? "Update Attendance"
                  : "Save Attendance"}
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

        {/* Attendance Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">
            All Attendance Records ({attendance.length})
          </h2>

          {loading ? (
            <p>Loading attendance...</p>
          ) : attendance.length === 0 ? (
            <p className="text-slate-500">
              No attendance records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-4">ID</th>
                    <th className="py-4">Enrollment ID</th>
                    <th className="py-4">Student</th>
                    <th className="py-4">Course</th>
                    <th className="py-4">Date</th>
                    <th className="py-4">Status</th>
                    <th className="py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((record) => (
                    <tr
                      key={record.attendance_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">
                        {record.attendance_id}
                      </td>

                      <td className="py-4">
                        {record.enrollment_id}
                      </td>

                      <td className="py-4 font-medium">
                        {record.student_name} ({record.student_id})
                      </td>

                      <td className="py-4">
                        {record.course_name} ({record.course_id})
                      </td>

                      <td className="py-4">
                        {formatDate(record.attendance_date)}
                      </td>

                      <td className="py-4">
                        {record.status}
                      </td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(record)}
                            className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(record.attendance_id)
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
