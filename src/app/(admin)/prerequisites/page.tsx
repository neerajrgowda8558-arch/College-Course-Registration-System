
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Prerequisite = {
  course_id: string;
  course_name: string;
  prerequisite_id: string;
  prerequisite_name: string;
};

export default function PrerequisitesPage() {
  const [prerequisites, setPrerequisites] = useState<Prerequisite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPrerequisites() {
      try {
        const response = await fetch("/api/prerequisites");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load prerequisites");
        }

        if (active) {
          setPrerequisites(data.prerequisites);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Something went wrong"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPrerequisites();

    return () => {
      active = false;
    };
  }, []);

  const filtered = prerequisites.filter((item) => {
    const query = search.toLowerCase();

    return (
      item.course_name.toLowerCase().includes(query) ||
      item.course_id.toLowerCase().includes(query) ||
      item.prerequisite_name.toLowerCase().includes(query) ||
      item.prerequisite_id.toLowerCase().includes(query)
    );
  });

  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">
              Course Prerequisites
            </h1>
            <p className="mt-2 text-slate-600">
              View course prerequisite relationships stored in Neo4j
            </p>
          </div>

          <Link
            href="/"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Total Prerequisite Relationships
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {prerequisites.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Database
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              Neo4j Graph Database
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-slate-900">
              Prerequisite Records ({filtered.length})
            </h2>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 sm:w-72"
            />
          </div>

          {loading ? (
            <p className="text-slate-700">Loading prerequisites...</p>
          ) : error ? (
            <p className="font-medium text-red-600">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-slate-700">
              No prerequisite relationships found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b-2 border-slate-300 text-slate-700">
                    <th className="px-4 py-4">Course ID</th>
                    <th className="px-4 py-4">Course Name</th>
                    <th className="px-4 py-4">Relationship</th>
                    <th className="px-4 py-4">Prerequisite ID</th>
                    <th className="px-4 py-4">Prerequisite Course</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((item, index) => (
                    <tr
                      key={`${item.course_id}-${item.prerequisite_id}-${index}`}
                      className="border-b border-slate-200 text-slate-900"
                    >
                      <td className="px-4 py-4 font-medium">
                        {item.course_id}
                      </td>
                      <td className="px-4 py-4">{item.course_name}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-800">
                          Requires
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium">
                        {item.prerequisite_id}
                      </td>
                      <td className="px-4 py-4">
                        {item.prerequisite_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
