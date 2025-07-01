"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ProfileDropdown } from "@/components/layout/ProfileDropdown";
import { Loader2 } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-incub-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-incub-blue-600 mx-auto mb-4" />
          <p className="text-incub-gray-600 font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className="flex h-screen bg-incub-gray-50"
      style={{ fontFamily: "poppins" }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Top Header with Profile */}
        <header className="bg-white border-b border-incub-blue-100 p-4 flex justify-end">
          <ProfileDropdown />
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-white via-incub-blue-50/30 to-incub-blue-100/20">
          {children}
        </main>
      </div>
    </div>
  );
}
