"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-incub-blue-50 via-white to-incub-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-incub-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-black">
            Loading TicketFlow...
          </h1>
          <p className="text-incub-gray-600 font-body">
            Please wait while we set up your workspace
          </p>
        </div>
      </div>
    );
  }

  return null;
}
