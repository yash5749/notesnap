


import { Outlet,  } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../auth/AuthContext";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">NoteSnap</h1>

        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </header>

      {/* Page Content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
