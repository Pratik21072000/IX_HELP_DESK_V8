import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  Calendar,
  Building,
  Edit,
} from "lucide-react";
import type { Ticket, TicketStatus } from "@/lib/types";
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface TicketCardProps {
  ticket: Ticket;
  showActions?: boolean;
  showEdit?: boolean;
  onStatusUpdate?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
  userRole?: string;
}

export const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  showActions = false,
  showEdit = false,
  onStatusUpdate,
  onEdit,
  onClick,
  userRole,
}) => {
  const handleStatusChange = async (newStatus: TicketStatus) => {
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok && onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error("Failed to update ticket status:", error);
    }
  };

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatStatus = (status: string) => {
    if (status === "HR") return "HR";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const availableStatuses: TicketStatus[] = [
    "OPEN",
    "IN_PROGRESS",
    "ON_HOLD",
    "CANCELLED",
    "CLOSED",
  ];

  // Determine if edit should be shown based on status and role
  const canEditTicket = () => {
    const editableStatuses: TicketStatus[] = ["OPEN", "IN_PROGRESS", "ON_HOLD"];
    return editableStatuses.includes(ticket.status as TicketStatus);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!canEditTicket()) {
      // Show warning for non-editable tickets
      alert("This ticket cannot be edited because it is closed or cancelled.");
      return;
    }

    onEdit?.();
  };

  const shouldShowEdit = (showEdit || userRole) && canEditTicket();

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 border-incub-gray-200 bg-white ${onClick ? "cursor-pointer hover:scale-[1.01]" : ""}`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-black truncate">
              {ticket.subject}
            </h3>
            <p className="text-sm font-body text-incub-gray-600 mt-1 line-clamp-2">
              {ticket.description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`${getStatusColor(ticket.status as TicketStatus)} flex items-center gap-1`}
              >
                {getStatusIcon(ticket.status as TicketStatus)}
                {formatStatus(ticket.status)}
              </Badge>
              {(shouldShowEdit &&
                ticket.status === "OPEN" &&
                userRole === "EMPLOYEE") ||
              (shouldShowEdit && userRole !== "EMPLOYEE") ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEditClick}
                  className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  title={
                    canEditTicket()
                      ? "Edit ticket"
                      : "This ticket cannot be edited"
                  }
                >
                  <Edit className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <Badge
              variant="outline"
              className={getPriorityColor(ticket.priority)}
            >
              {formatStatus(ticket.priority)} Priority
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs font-body text-incub-gray-500 mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {formatStatus(ticket.department)}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(ticket.createdAt.toString())}
            </div>
          </div>
          <div className="text-incub-gray-400 font-heading font-medium">
            #{ticket.id}
          </div>
        </div>

        {showActions && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-600 mr-2">Quick Status:</span>
            <Select
              value={ticket.status}
              onValueChange={(value) =>
                handleStatusChange(value as TicketStatus)
              }
            >
              <SelectTrigger className="h-8 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
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
        )}

        {ticket.attachments.length !== 0 && (
          <div className="pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-600 mr-2">Attachments</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const files = Array.isArray(ticket.attachments)
                  ? ticket.attachments
                  : JSON.parse(ticket.attachments);

                const zip = new JSZip();
                let added = 0;

                for (let i = 0; i < files.length; i++) {
                  const url = files[i];
                  const fileName =
                    url.split("/").pop()?.split("?")[0] || `file-${i}`;

                  try {
                    const response = await fetch(url);

                    if (!response.ok) {
                      console.warn(
                        `⛔ Skipping ${fileName}: ${response.status}`,
                      );
                      continue;
                    }

                    const contentType =
                      response.headers.get("Content-Type") || "";
                    if (
                      contentType.includes("html") ||
                      contentType.includes("xml")
                    ) {
                      console.warn(`⛔ Skipping ${fileName}: HTML/XML`);
                      continue;
                    }

                    const blob = await response.blob();
                    if (!blob || blob.size === 0) {
                      console.warn(`⛔ Skipping ${fileName}: empty blob`);
                      continue;
                    }

                    zip.file(fileName, blob);
                    added++;
                  } catch (err) {
                    console.error(`❌ Failed to fetch ${fileName}`, err);
                  }
                }

                if (added === 0) {
                  alert("❌ No valid files to zip. All were skipped.");
                  return;
                }

                const zipBlob = await zip.generateAsync({ type: "blob" });
                saveAs(zipBlob, "attachments.zip");
              }}
            >
              DOWNLOAD FILES
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
