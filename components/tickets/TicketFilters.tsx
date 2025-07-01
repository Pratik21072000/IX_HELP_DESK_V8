import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type {
  TicketFilters as ITicketFilters,
  UserRole,
  Department,
  TicketPriority,
  TicketStatus,
} from "@/lib/types";

interface TicketFiltersProps {
  filters: ITicketFilters;
  onFiltersChange: (filters: ITicketFilters) => void;
  userRole: UserRole;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  filters,
  onFiltersChange,
  userRole,
}) => {
  const updateFilter = (
    key: keyof ITicketFilters,
    value: string | undefined,
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined,
  );

  const departments: Department[] = ["ADMIN", "FINANCE", "HR"];
  const priorities: TicketPriority[] = ["LOW", "MEDIUM", "HIGH"];
  const statuses: TicketStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "ON_HOLD",
    "CANCELLED",
    "CLOSED",
  ];

  const formatLabel = (value: string) => {
    return value
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Department Filter - Only show for managers */}
      {/* {(userRole === "ADMIN" ||
        userRole === "FINANCE" ||
        userRole === "HR") && (
        <Select
          value={filters.department || "all"}
          onValueChange={(value) => updateFilter("department", value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {formatLabel(dept)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )} */}

      {/* Priority Filter */}
      <Select
        value={filters.priority || "all"}
        onValueChange={(value) => updateFilter("priority", value)}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          {priorities.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {formatLabel(priority)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "all"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {formatLabel(status)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          <X className="h-3 w-3 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
};
