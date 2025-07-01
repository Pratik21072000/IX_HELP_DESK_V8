"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  MessageSquare,
  User,
  Calendar,
} from "lucide-react";
import type { Ticket, TicketStatus } from "@/lib/types";

interface StatusUpdateModalProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  ticket,
  open,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState<TicketStatus | "">("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    setError("");
    setIsSubmitting(true);

    try {
      if (!newStatus) {
        throw new Error("Please select a new status");
      }

      if (!comment.trim()) {
        throw new Error("Please add a comment explaining the status change");
      }

      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          comment: comment.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ticket status");
      }

      onSuccess?.();
      onClose();
      setNewStatus("");
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statuses: TicketStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "ON_HOLD",
    "CANCELLED",
    "CLOSED",
  ];

  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return <Clock className="h-3 w-3" />;
      case "IN_PROGRESS":
        return <AlertTriangle className="h-3 w-3" />;
      case "ON_HOLD":
        return <Pause className="h-3 w-3" />;
      case "CANCELLED":
        return <XCircle className="h-3 w-3" />;
      case "CLOSED":
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ON_HOLD":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "CLOSED":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status: string) => {
    if (status === "HR") return "HR";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!ticket) return null;

  const isManager = user && ["ADMIN", "FINANCE", "HR"].includes(user.role);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <MessageSquare className="h-5 w-5" />
            Update Ticket Status
          </DialogTitle>
        </DialogHeader>

        {/* Ticket Info */}
        <div className="bg-incub-blue-50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${getStatusColor(ticket.status as TicketStatus)} flex items-center gap-1`}
              >
                {getStatusIcon(ticket.status as TicketStatus)}
                {formatStatus(ticket.status)}
              </Badge>
            </div>
            <span className="text-xs text-incub-gray-500">
              #{ticket.id.toString().slice(-8)}
            </span>
          </div>

          <h4 className="font-heading font-medium text-black text-sm">
            {ticket.subject}
          </h4>

          <div className="flex items-center gap-4 text-xs text-incub-gray-600">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {formatStatus(ticket.department)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(ticket.createdAt.toString())}
            </div>
          </div>
        </div>

        {!isManager ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Only department managers can update ticket status.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">
                New Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as TicketStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses
                    .filter((status) => status !== ticket.status)
                    .map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          {formatStatus(status)}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">
                Comment <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="comment"
                placeholder="Explain the reason for this status change..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                required
              />
              <p className="text-xs text-incub-gray-500">
                This comment will be visible to the ticket creator and other
                managers.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Updating..." : "Update Status"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
