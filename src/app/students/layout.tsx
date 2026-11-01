
import { redirect } from "next/navigation";
import { getSessionUser } from "../../lib/auth";

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/student-dashboard");
  }

  return <>{children}</>;
}
