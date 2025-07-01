"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import {
  Ticket,
  BarChart3,
  Plus,
  FileText,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import brand_logo from "../../assets/images/Incubxperts.f3f7b50e (1).png";

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const isManager = user && ["ADMIN", "FINANCE", "HR"].includes(user.role);

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: BarChart3,
      show:
        user.role === "ADMIN" || user.role === "FINANCE" || user.role === "HR",
    },
    {
      name: "Create Ticket",
      href: "/create-ticket",
      icon: Plus,
      show: true, // Show for all users (employees and managers)
    },
    {
      name: "My Tickets",
      href: "/my-tickets",
      icon: FileText,
      show: true, // Show for all users to manage their own created tickets
    },
    {
      name: "My Profile",
      href: "/profile",
      icon: User,
      show: true,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-incub-blue-100 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-9 border-b border-incub-blue-100">
        <div className="flex items-center gap-3">
          <div>
            <Image src={brand_logo} alt="Brand_logo" width={148} height={24} />

            <p className="text-md font-body text-incub-gray-500 text-center pt-2 pl-5">
              HelpDesk System
            </p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-incub-blue-100 bg-incub-blue-50/30">
        <div className="flex items-center gap-3">
          <div className="bg-incub-blue-100 p-2 rounded-full">
            <User className="h-4 w-4 text-incub-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-heading font-medium text-black truncate">
              {user?.name}
            </p>
            <p className="text-xs font-body text-incub-gray-500 capitalize truncate">
              {user?.role === "EMPLOYEE"
                ? "Employee"
                : `${user?.department} Manager`}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigationItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-body font-medium transition-all duration-200",
                  isActive
                    ? "bg-incub-blue-100 text-incub-blue-700 shadow-sm"
                    : "text-incub-gray-600 hover:bg-incub-blue-50 hover:text-incub-blue-700",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-incub-blue-100">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 font-body text-incub-gray-600 hover:text-incub-blue-700 hover:bg-incub-blue-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
};
