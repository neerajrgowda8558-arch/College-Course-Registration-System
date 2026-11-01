
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type Mark = {
  mark_id: number | string;
  enrollment_id: number | string;
  student_id: string;
  student_name: string;
  course_id: string;
  course_name: string;
  internal_marks: number | string;
  external_marks: number | string;
  total_marks: number | string;
  grade: string | null;
};

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    enrollment_id: "",
    internal_marks: "",
    external_marks: "",
    grade: "",
  });

  useEffect(() => {
    let cancelled = false;

    fetch("/api/marks")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load marks");
        }

        if (!cancelled) {
          setMarks(data.marks);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load marks"
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchMarks() {
    try {
      const response = await fetch("/api/marks");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load marks");
      }

      setMarks(data.marks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load marks");
    }
  }

  function resetForm() {
    setForm({
      enrollment_id: "",
      internal_marks: "",
      external_marks: "",
      grade: "",
    });
    setEditingId(null);
    setShowForm(false);
  }

  function openAddForm() {
    setMessage("");
    setError("");
    setForm({
      enrollment_id: "",
      internal_marks: "",
      external_marks: "",
      grade: "",
    });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(record: Mark) {
    setMessage("");
    setError("");
    setEditingId(record.mark_id);

    setForm({
      enrollment_id: String(record.enrollment_id),
      internal_marks: String(record.internal_marks),
      external_marks: String(record.external_marks),
      grade: record.grade || "",
    });

    setShowForm(true);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    const internal = Number(form.internal_marks);
    const external = Number(form.external_marks);
    const enrollment = Number(form.enrollment_id);

    if (
      !Number.isInteger(enrollment) ||
      enrollment <= 0 ||
      form.internal_marks === "" ||
      form.external_marks === "" ||
      !Number.isFinite(internal) ||
      !Number.isFinite(external) ||
      internal < 0 ||
      external < 0
    ) {
      setError("Enter a valid enrollment ID and non-negative marks.");
      return;
    }

    const url = editingId ? `/api/marks/${editingId}` : "/api/marks";

    try {
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollment_id: enrollment,
          internal_marks: internal,
          external_marks: external,
          grade: form.grade.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save marks");
      }

      setMessage(data.message);
      resetForm();
      await fetchMarks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save marks");
    }
  }

  async function handleDelete(id: number | string) {
    if (!window.confirm("Are you sure you want to delete this marks record?")) {
      return;
    }

    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/marks/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete marks");
      }

      setMessage(data.message);
      await fetchMarks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete marks");
    }
  }

  const total =
    Number(form.internal_marks || 0) +
    Number(form.external_marks || 0);

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-800">
              Marks Management
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Manage student examination marks
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openAddForm}
              className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
            >
              + Add Marks
            </button>

            <Link
              href="/"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {message && (
          <div className="mb-5 rounded-lg bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Add / Edit Form */}
        {showForm && (
          <section className="mb-8 rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-2xl font-bold text-slate-800">
              {editingId ? "Edit Marks" : "Add New Marks"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">

                <div>
                  <label className="mb-2 block font-medium text-slate-700">
                    Enrollment ID
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.enrollment_id}
                    onChange={(e) =>
                      setForm({ ...form, enrollment_id: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter enrollment ID"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-slate-700">
                    Internal Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.internal_marks}
                    onChange={(e) =>
                      setForm({ ...form, internal_marks: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter internal marks"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-slate-700">
                    External Marks
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={form.external_marks}
                    onChange={(e) =>
                      setForm({ ...form, external_marks: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter external marks"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-slate-700">
                    Grade (Optional)
                  </label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) =>
                      setForm({ ...form, grade: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter grade, e.g. A"
                  />
                </div>
              </div>

              <p className="mt-4 font-semibold text-slate-800">
                Calculated Total: {total.toFixed(2)}
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                >
                  {editingId ? "Update Marks" : "Save Marks"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-slate-500 px-6 py-3 font-semibold text-white hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Marks Table */}
        <section className="rounded-xl bg-white p-6 shadow">
          <h2 className="mb-6 text-2xl font-bold text-slate-800">
            All Marks Records ({marks.length})
          </h2>

          {loading ? (
            <p className="py-6 text-slate-500">Loading marks...</p>
          ) : marks.length === 0 ? (
            <p className="py-6 text-slate-500">
              No marks records found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-500">
                    <th className="p-3">ID</th>
                    <th className="p-3">Enrollment</th>
                    <th className="p-3">Student</th>
                    <th className="p-3">Course</th>
                    <th className="p-3">Internal</th>
                    <th className="p-3">External</th>
                    <th className="p-3">Total</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {marks.map((record) => (
                    <tr
                      key={record.mark_id}
                      className="border-b border-slate-300 text-slate-800"
                    >
                      <td className="p-3">{record.mark_id}</td>
                      <td className="p-3">{record.enrollment_id}</td>
                      <td className="p-3">
                        {record.student_name} ({record.student_id})
                      </td>
                      <td className="p-3">
                        {record.course_name} ({record.course_id})
                      </td>
                      <td className="p-3">{record.internal_marks}</td>
                      <td className="p-3">{record.external_marks}</td>
                      <td className="p-3 font-semibold">
                        {record.total_marks}
                      </td>
                      <td className="p-3">{record.grade || "-"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditForm(record)}
                            className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(record.mark_id)}
                            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
        </section>
      </div>
    </main>
  );
}
