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
import {
  DEPARTMENT_STRUCTURE,
  type Ticket,
  type Department,
  type TicketPriority,
} from "@/lib/types";
import { AlertTriangle, Save } from "lucide-react";

interface EditTicketDialogProps {
  ticket: Ticket;
  open: boolean;
  onClose: () => void;
}

export const EditTicketDialog: React.FC<EditTicketDialogProps> = ({
  ticket,
  open,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    department: "" as Department | "",
    category: "",
    subcategory: "",
    priority: "" as TicketPriority | "",
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

      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          description: formData.description.trim(),
          department: formData.department,
          priority: formData.priority,
          category: formData.category,
          subcategory: formData.subcategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update ticket");
      }

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const departments: Department[] = ["ADMIN", "FINANCE", "HR"];
  const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];

  // Check if ticket can be edited (only open tickets)
  const canEdit = ticket?.status === "OPEN";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Save className="h-5 w-5" />
            Edit Ticket
          </DialogTitle>
        </DialogHeader>

        {!canEdit ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This ticket cannot be edited because it's no longer in "Open"
              status. Only open tickets can be modified.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                      {dept.charAt(0).toUpperCase() +
                        dept.slice(1).toLowerCase()}
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
                        {priority.charAt(0).toUpperCase() +
                          priority.slice(1).toLowerCase()}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Updating Ticket..." : "Update Ticket"}
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
