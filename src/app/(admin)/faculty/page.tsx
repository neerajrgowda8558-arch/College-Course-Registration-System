
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Faculty {
  faculty_id: string;
  faculty_name: string;
  email: string;
  department: string;
}

const emptyForm = {
  faculty_id: "",
  faculty_name: "",
  email: "",
  department: "",
};

export default function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(emptyForm);

  // Fetch faculty when page loads
  useEffect(() => {
    let ignore = false;

    fetch("/api/faculty")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load faculty");
        }

        return data;
      })
      .then((data) => {
        if (!ignore) {
          setFaculty(data.faculty);
          setError("");
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load faculty"
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

  // Fetch faculty again after add, edit or delete
  async function fetchFaculty() {
    try {
      const response = await fetch("/api/faculty");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load faculty");
      }

      setFaculty(data.faculty);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load faculty"
      );
    }
  }

  // Open Add Faculty form
  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Open Edit Faculty form
  function openEditForm(member: Faculty) {
    setEditingId(member.faculty_id);

    setForm({
      faculty_id: member.faculty_id,
      faculty_name: member.faculty_name,
      email: member.email,
      department: member.department,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  // Add or Update Faculty
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const url = editingId
        ? `/api/faculty/${editingId}`
        : "/api/faculty";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faculty_id: form.faculty_id,
          faculty_name: form.faculty_name,
          email: form.email,
          department: form.department,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Operation failed");
        return;
      }

      setMessage(
        editingId
          ? "Faculty updated successfully!"
          : "Faculty added successfully!"
      );

      setForm(emptyForm);
      setEditingId(null);
      setShowForm(false);

      await fetchFaculty();
    } catch {
      setError("Unable to connect to server");
    }
  }

  // Delete Faculty
  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this faculty member?"
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/faculty/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to delete faculty");
        return;
      }

      setMessage("Faculty deleted successfully!");

      await fetchFaculty();
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
              Faculty
            </h1>

            <p className="text-slate-500 mt-2">
              Manage registered faculty members
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAddForm}
              className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700"
            >
              + Add Faculty
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

        {/* Add / Edit Faculty Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-6">
              {editingId ? "Edit Faculty" : "Add New Faculty"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              <input
                required
                placeholder="Faculty ID (e.g. F004)"
                value={form.faculty_id}
                disabled={!!editingId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    faculty_id: e.target.value,
                  })
                }
                className="border p-3 rounded-lg disabled:bg-slate-100"
              />

              <input
                required
                placeholder="Faculty Name"
                value={form.faculty_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    faculty_name: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <input
                required
                placeholder="Department (e.g. CSE)"
                value={form.department}
                onChange={(e) =>
                  setForm({
                    ...form,
                    department: e.target.value,
                  })
                }
                className="border p-3 rounded-lg"
              />

              <button
                type="submit"
                className="bg-blue-600 text-white rounded-lg p-3 hover:bg-blue-700"
              >
                {editingId ? "Update Faculty" : "Save Faculty"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="bg-slate-500 text-white rounded-lg p-3 hover:bg-slate-600"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Faculty Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-6">
            All Faculty ({faculty.length})
          </h2>

          {loading ? (
            <p>Loading faculty...</p>
          ) : faculty.length === 0 ? (
            <p className="text-slate-500">
              No faculty records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-4">Faculty ID</th>
                    <th className="py-4">Name</th>
                    <th className="py-4">Email</th>
                    <th className="py-4">Department</th>
                    <th className="py-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {faculty.map((member) => (
                    <tr
                      key={member.faculty_id}
                      className="border-b last:border-0"
                    >
                      <td className="py-4">
                        {member.faculty_id}
                      </td>

                      <td className="py-4 font-medium">
                        {member.faculty_name}
                      </td>

                      <td className="py-4">
                        {member.email}
                      </td>

                      <td className="py-4">
                        {member.department}
                      </td>

                      <td className="py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(member)}
                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(member.faculty_id)
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
