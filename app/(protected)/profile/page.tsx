"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Edit3,
  Save,
  X,
  Shield,
  Building,
  Calendar,
  Key,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";

interface ProfileData {
  id: string;
  username: string;
  name: string;
  role: string;
  department: string | null;
  createdAt: string;
  updatedAt: string;
}

const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/profile");

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFormData((prev) => ({
          ...prev,
          name: data.profile.name,
        }));
      } else {
        setError("Failed to load profile");
      }
    } catch (error) {
      console.error("Load profile error:", error);
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (
      formData.newPassword &&
      formData.newPassword !== formData.confirmPassword
    ) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }

    if (formData.newPassword && !formData.currentPassword) {
      setError("Current password is required to change password");
      return;
    }

    try {
      setIsSaving(true);

      const updateData: any = {
        name: formData.name.trim(),
      };

      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (response.ok) {
        setProfile(result.profile);
        setSuccess(result.message);
        setIsEditing(false);

        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));

        // Refresh user data in auth context to update sidebar
        await refreshUser();
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Save profile error:", error);
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-700 border-red-200";
      case "FINANCE":
        return "bg-green-100 text-green-700 border-green-200";
      case "HR":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getDepartmentName = (department: string | null) => {
    if (!department) return "N/A";
    return department === "HR"
      ? "HR"
      : department.charAt(0).toUpperCase() + department.slice(1).toLowerCase();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-incub-gray-200 rounded w-64"></div>
            <div className="h-96 bg-incub-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="max-w-3xl mx-auto text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-heading font-semibold text-black mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-incub-gray-600 font-body">
            Unable to load your profile information. Please try again.
          </p>
          <Button onClick={loadProfile} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-black flex items-center gap-3 tracking-tight">
              <User className="h-7 w-7 text-incub-blue-600" />
              My Profile
            </h1>
            <p className="text-incub-gray-600 font-body text-lg mt-3">
              Manage your account information and settings
            </p>
          </div>

          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="gap-2 font-body"
            >
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Information */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2">
              <Shield className="h-5 w-5 text-incub-blue-600" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="p-3 bg-incub-gray-50 border border-incub-gray-200 rounded-md">
                    <span className="font-body text-black">{profile.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Username</Label>
                <div className="p-3 bg-incub-gray-50 border border-incub-gray-200 rounded-md">
                  <span className="font-body text-incub-gray-700">
                    {profile.username}
                  </span>
                </div>
              </div>
            </div>

            {/* Role and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center gap-2">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {profile.role === "EMPLOYEE"
                      ? "Employee"
                      : `${getDepartmentName(profile.department)} Manager`}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Department</Label>
                <div className="p-3 bg-incub-gray-50 border border-incub-gray-200 rounded-md flex items-center gap-2">
                  <Building className="h-4 w-4 text-incub-gray-500" />
                  <span className="font-body text-incub-gray-700">
                    {getDepartmentName(profile.department)}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Account Created</Label>
                <div className="p-3 bg-incub-gray-50 border border-incub-gray-200 rounded-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-incub-gray-500" />
                  <span className="font-body text-incub-gray-700">
                    {format(new Date(profile.createdAt), "PPP")}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="p-3 bg-incub-gray-50 border border-incub-gray-200 rounded-md flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-incub-gray-500" />
                  <span className="font-body text-incub-gray-700">
                    {format(new Date(profile.updatedAt), "PPp")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change Section - Only show when editing */}
        {/* {isEditing && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2">
                <Key className="h-5 w-5 text-incub-blue-600" />
                Change Password
              </CardTitle>
              <p className="text-sm text-incub-gray-600 font-body">
                Leave password fields empty if you don't want to change your
                password
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Enter your current password"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 justify-end">
            <Button onClick={handleSave} disabled={isSaving} className=" gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
