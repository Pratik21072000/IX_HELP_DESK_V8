"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Ticket, User, Shield } from "lucide-react";
import Image from "next/image";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result) {
        // result is the user object
        if (result.role === "EMPLOYEE") {
          router.push("/my-tickets");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { username: "pratikka@incubxperts.com", role: "Employee" },
    { username: "harikaa@incubxperts.com", role: "Admin Manager" },
    { username: "vrushalim@incubxperts.com", role: "Finance Manager" },
    // { username: "hr.manager", role: "HR Manager" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-incub-blue-50 via-white to-incub-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Brand */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className=" p-4 rounded-2xl shadow-lg">
              <Image
                src="/favicon.ico"
                height={40}
                width={130}
                alt="HelpDesk System Logo"
              />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-black tracking-tight">
            HelpDesk System
          </h1>
        </div>

        {/* Login Form */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl text-center font-heading font-semibold text-black">
              Welcome back
            </CardTitle>
            <CardDescription className="text-center font-body text-incub-gray-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                type="submit"
                className="w-full h-10"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Users */}
        <Card className="border border-incub-blue-100 bg-incub-blue-50/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-heading font-medium flex items-center gap-2 text-incub-blue-800">
              <Shield className="h-4 w-4" />
              Demo Users
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs font-body text-incub-gray-600 mb-3">
              Use any of these usernames with password:{" "}
              <strong>password123</strong>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {demoUsers.map((user) => (
                <button
                  key={user.username}
                  onClick={() => setUsername(user.username)}
                  className="text-left p-3 rounded-lg bg-white hover:bg-incub-blue-50 border border-incub-blue-100 transition-all duration-200 hover:shadow-md"
                >
                  <div className="text-sm font-heading font-medium text-incub-blue-900">
                    {user.username}
                  </div>
                  <div className="text-xs font-body text-incub-blue-600 mt-1">
                    {user.role}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
