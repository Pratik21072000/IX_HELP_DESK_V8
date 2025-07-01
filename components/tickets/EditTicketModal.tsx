import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DEPARTMENT_STRUCTURE,
  type Ticket,
  type Department,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/types";
import { AlertTriangle, Save, X, Clock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface EditTicketModalProps {
  ticket: Ticket | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  myTickets: boolean;
}

export const EditTicketModal: React.FC<EditTicketModalProps> = ({
  ticket,
  open,
  onClose,
  onSuccess,
  myTickets,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    department: "" as Department | "",
    category: "",
    subcategory: "",
    priority: "" as TicketPriority | "",
    status: "" as TicketStatus | "",
    comment: "",
  });

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when ticket changes
  useEffect(() => {
    if (ticket) {
      // Parse the subject to extract category and subcategory if present
      const subjectMatch = ticket.subject.match(/^\[(.+?) - (.+?)\] (.+)$/);
      let parsedSubject = ticket.subject;
      let parsedCategory = "";
      let parsedSubcategory = "";

      if (subjectMatch) {
        parsedCategory = subjectMatch[1];
        parsedSubcategory = subjectMatch[2];
        parsedSubject = subjectMatch[3];
      }

      setFormData({
        subject: parsedSubject,
        description: ticket.description,
        department: ticket.department as any,
        category: parsedCategory,
        subcategory: parsedSubcategory,
        priority: ticket.priority as any,
        status: ticket.status as any,
        comment: ticket.comment,
      });
    }
  }, [ticket]);

  // Update categories when department changes
  useEffect(() => {
    if (formData.department) {
      const categories = Object.keys(DEPARTMENT_STRUCTURE[formData.department]);
      setAvailableCategories(categories);
      if (!categories.includes(formData.category)) {
        setFormData((prev) => ({ ...prev, category: "", subcategory: "" }));
        setAvailableSubcategories([]);
      }
    } else {
      setAvailableCategories([]);
      setAvailableSubcategories([]);
    }
  }, [formData.department]);

  // Update subcategories when category changes
  useEffect(() => {
    if (formData.department && formData.category) {
      const subcategories =
        DEPARTMENT_STRUCTURE[formData.department][formData.category] || [];
      setAvailableSubcategories(subcategories);
      if (!subcategories.includes(formData.subcategory)) {
        setFormData((prev) => ({ ...prev, subcategory: "" }));
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.department, formData.category]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;

    setError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.subject.trim()) {
        throw new Error("Subject is required");
      }
      if (!formData.description.trim()) {
        throw new Error("Description is required");
      }
      if (!formData.department) {
        throw new Error("Department is required");
      }
      if (!formData.priority) {
        throw new Error("Priority is required");
      }

      const updateData: any = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        department: formData.department,
        priority: formData.priority,
        category: formData.category,
        subcategory: formData.subcategory,
        comment: formData.comment,
      };

      // Managers can also update status
      const isManager = user && ["ADMIN", "FINANCE", "HR"].includes(user.role);
      if (isManager && formData.status) {
        updateData.status = formData.status;
      }

      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ticket");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments: Department[] = ["ADMIN", "FINANCE", "HR"];
  const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];
  const statuses: TicketStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "ON_HOLD",
    "CANCELLED",
    "CLOSED",
  ];

  // Check if ticket can be edited
  const editableStatuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "ON_HOLD"];
  const canEdit =
    ticket && editableStatuses.includes(ticket.status as TicketStatus);
  const isManager = user && ["ADMIN", "FINANCE", "HR"].includes(user.role);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    if (status === "HR") return "HR";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (!ticket) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Save className="h-5 w-5" />
            Edit Ticket #{ticket.id}
          </DialogTitle>
        </DialogHeader>

        {/* Ticket Info Header */}
        <div className="bg-incub-blue-50 p-4 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  ticket.status === "OPEN"
                    ? "bg-yellow-100 text-yellow-800"
                    : ticket.status === "IN_PROGRESS"
                      ? "bg-blue-100 text-blue-800"
                      : ticket.status === "ON_HOLD"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                }
              >
                {formatStatus(ticket.status)}
              </Badge>
              <Badge variant="outline" className="bg-white">
                {formatStatus(ticket.priority)} Priority
              </Badge>
            </div>
            <div className="text-sm text-incub-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Created {formatDate(ticket.createdAt.toString())}
            </div>
          </div>
          <div className="text-sm text-incub-gray-600 flex items-center gap-1">
            <User className="h-3 w-3" />
            Department: {formatStatus(ticket.department)}
          </div>
        </div>

        {!canEdit ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This ticket cannot be edited because it is{" "}
              {ticket.status === "CLOSED" ? "closed" : "cancelled"}. Only
              tickets with Open, In Progress, or On Hold status can be modified.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Enter a brief summary of your request"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about your request..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
                required
              />
            </div>
            {/* Department Selection */}
            <div className="space-y-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleInputChange("department", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "HR" ? "HR" : formatStatus(dept)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Selection */}
            {availableCategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subcategory Selection */}
            {availableSubcategories.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Sub-category</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) =>
                    handleInputChange("subcategory", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-category" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubcategories.map((subcategory) => (
                      <SelectItem key={subcategory} value={subcategory}>
                        {subcategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority level" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`h-3 w-3 ${
                            priority === "HIGH"
                              ? "text-red-500"
                              : priority === "MEDIUM"
                                ? "text-orange-500"
                                : "text-green-500"
                          }`}
                        />
                        {formatStatus(priority)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Selection - Only for Managers */}
            {isManager && !myTickets && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatStatus(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isManager && formData.status && (
              <div className="space-y-2">
                <Label htmlFor="comment">Comment</Label>
                <Input
                  id="comment"
                  placeholder="Enter comment"
                  value={formData.comment}
                  onChange={(e) => handleInputChange("comment", e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 justify-end pt-4 ">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Ticket"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border border-blue-500"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
