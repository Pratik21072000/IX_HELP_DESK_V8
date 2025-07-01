"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  User,
  Settings,
  LogOut,
  Shield,
  Building,
  ChevronDown,
} from "lucide-react";

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleDisplay = (role: string) => {
    if (role === "EMPLOYEE") return "Employee";
    if (role === "HR") return "HR Manager";
    return `${role.charAt(0)}${role.slice(1).toLowerCase()} Manager`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "FINANCE":
        return "bg-green-100 text-green-800";
      case "HR":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-auto pl-3 pr-2 gap-2 hover:bg-incub-blue-50"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-incub-blue-100 text-incub-blue-700 text-xs font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium font-heading text-black">
              {user.name}
            </span>
            <span className="text-xs text-incub-gray-500 font-body">
              {getRoleDisplay(user.role)}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-incub-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="p-4 bg-incub-blue-50">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-incub-blue-100 text-incub-blue-700 font-medium">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-heading font-medium text-black">
                {user.name}
              </p>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${getRoleBadgeColor(user.role)}`}
                >
                  {getRoleDisplay(user.role)}
                </Badge>
                {user.department && (
                  <Badge variant="outline" className="text-xs bg-white">
                    <Building className="h-3 w-3 mr-1" />
                    {user.department === "HR"
                      ? "HR"
                      : user.department.charAt(0) +
                        user.department.slice(1).toLowerCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="gap-2 cursor-pointer"
        >
          <User className="h-4 w-4" />
          <span className="font-body">My Profile</span>
        </DropdownMenuItem>

        {/* <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="gap-2 cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          <span className="font-body">Settings</span>
        </DropdownMenuItem> */}

        {/* {user.role !== "EMPLOYEE" && (
          <DropdownMenuItem
            onClick={() => router.push("/manage-tickets")}
            className="gap-2 cursor-pointer"
          >
            <Shield className="h-4 w-4" />
            <span className="font-body">Admin Panel</span>
          </DropdownMenuItem>
        )} */}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="gap-2 cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          <span className="font-body">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
