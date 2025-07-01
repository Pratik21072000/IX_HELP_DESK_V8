"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Settings,
  Search,
  Users,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  FileText,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { TicketCard } from "@/components/tickets/TicketCard";
import { EditTicketModal } from "@/components/tickets/EditTicketModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Ticket,
  TicketFilters as ITicketFilters,
  DashboardStats,
  Department,
} from "@/lib/types";

const ManageTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<ITicketFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | "ALL"
  >("ALL");

  useEffect(() => {
    loadData();
  }, [selectedDepartment]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // For non-managers, show all tickets they can access
      // For managers, show tickets based on selectedDepartment
      let url = "/api/tickets";
      if (isManager && selectedDepartment !== "ALL") {
        url += `?department=${selectedDepartment}`;
      }

      const [ticketsRes, statsRes] = await Promise.all([
        fetch(url),
        fetch("/api/dashboard/stats"),
      ]);

      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTickets(ticketsData.tickets);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    // if (filters.department) {
    //   filtered = filtered.filter(
    //     (ticket) => ticket.department === filters.department,
    //   );
    // }
    if (filters.priority) {
      filtered = filtered.filter(
        (ticket) => ticket.priority === filters.priority,
      );
    }
    if (filters.status) {
      filtered = filtered.filter((ticket) => ticket.status === filters.status);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query),
      );
    }

    setFilteredTickets(filtered);
  };

  const isManager = user && ["ADMIN", "FINANCE", "HR"].includes(user.role);
  const isSystemAdmin = user?.role === "ADMIN";

  const getPageTitle = () => {
    if (!user) return "Manage Tickets";

    if (user.role === "EMPLOYEE") {
      return "All Accessible Tickets";
    }

    if (isSystemAdmin) {
      return selectedDepartment === "ALL"
        ? "All Department Tickets"
        : `${selectedDepartment} Department Tickets`;
    }

    return `${user.department} Department Management`;
  };

  const getPageDescription = () => {
    if (!user) return "";

    if (user.role === "EMPLOYEE") {
      return "View and track tickets you have access to";
    }

    if (isSystemAdmin) {
      return selectedDepartment === "ALL"
        ? "Monitor and manage tickets across all departments"
        : `Manage tickets for the ${selectedDepartment} department`;
    }

    return `Manage and update tickets for your department`;
  };

  const getStatsCards = () => {
    if (!stats) return [];

    return [
      {
        title: "Total Tickets",
        value: stats.total,
        icon: FileText,
        color: "blue" as const,
      },
      {
        title: "Open",
        value: stats.open,
        icon: Clock,
        color: "yellow" as const,
      },
      {
        title: "In Progress",
        value: stats.inProgress,
        icon: AlertTriangle,
        color: "blue" as const,
      },
      {
        title: "On Hold",
        value: stats.onHold,
        icon: Pause,
        color: "purple" as const,
      },
      {
        title: "Cancelled",
        value: stats.cancelled,
        icon: XCircle,
        color: "red" as const,
      },
      {
        title: "Closed",
        value: stats.closed,
        icon: CheckCircle,
        color: "green" as const,
      },
    ];
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleExport = () => {
    // Export functionality can be implemented here
    console.log("Export tickets:", filteredTickets);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-incub-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-incub-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-heading font-bold text-black flex items-center gap-3 tracking-tight">
            <Settings className="h-7 w-7 text-incub-blue-600" />
            {getPageTitle()}
          </h1>
          <p className="text-incub-gray-600 font-body text-lg">
            {getPageDescription()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Department Selector for System Admin */}
          {isSystemAdmin && (
            <Select
              value={selectedDepartment}
              onValueChange={(value) =>
                setSelectedDepartment(value as Department | "ALL")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              {/* <SelectContent>
                <SelectItem value="ALL">All Departments</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="FINANCE">Finance</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent> */}
            </Select>
          )}

          <Button variant="outline" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>

          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Role Information */}
      <Card className="border border-incub-blue-100 bg-incub-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-incub-blue-100 p-2 rounded-full">
                <Users className="h-4 w-4 text-incub-blue-600" />
              </div>
              <div>
                <p className="text-sm font-heading font-medium text-black">
                  {user?.name} ({user?.role})
                </p>
                <p className="text-xs font-body text-incub-gray-600">
                  {user?.role === "EMPLOYEE"
                    ? "Limited access to assigned tickets"
                    : isSystemAdmin
                      ? "Full system access - can manage all departments"
                      : `Department manager - can manage ${user?.department} tickets`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white">
                {user?.role === "EMPLOYEE" ? "View Only" : "Manager Access"}
              </Badge>
              {user?.department && (
                <Badge
                  variant="outline"
                  className="bg-incub-blue-100 text-incub-blue-700"
                >
                  {user.department}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {getStatsCards().map((card) => (
          <StatsCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-incub-gray-400" />
            <Input
              placeholder="Search tickets by subject, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-incub-gray-500" />
            <span className="text-sm font-body text-incub-gray-600">
              Filters:
            </span>
          </div>
        </div>

        <TicketFilters
          filters={filters}
          onFiltersChange={setFilters}
          userRole={(user?.role as any) || "EMPLOYEE"}
        />
      </div>

      {/* Tickets Management Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-heading font-semibold text-black">
              {filters.status
                ? `${filters.status
                    .split("_")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                    )
                    .join(" ")} Tickets`
                : "All Tickets"}
            </h2>
            <div className="flex items-center gap-4 text-sm font-body text-incub-gray-500">
              <span>
                Showing {filteredTickets.length} of {tickets.length} tickets
              </span>
              {selectedDepartment !== "ALL" && isSystemAdmin && (
                <span>• Department: {selectedDepartment}</span>
              )}
            </div>
          </div>

          {(filters.status ||
            filters.department ||
            filters.priority ||
            searchQuery) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({});
                setSearchQuery("");
              }}
              className="gap-2"
            >
              <XCircle className="h-3 w-3" />
              Clear All Filters
            </Button>
          )}
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-incub-gray-200 shadow-sm">
            <FileText className="h-12 w-12 text-incub-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium text-black mb-2">
              No tickets found
            </h3>
            <p className="font-body text-incub-gray-500 mb-4">
              {tickets.length === 0
                ? selectedDepartment === "ALL"
                  ? "No tickets have been created yet."
                  : `No tickets found for ${selectedDepartment} department.`
                : "No tickets match your current search and filter criteria."}
            </p>
            {(filters.status ||
              filters.department ||
              filters.priority ||
              searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({});
                  setSearchQuery("");
                }}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showActions={isManager}
                showEdit={true}
                onStatusUpdate={loadData}
                onEdit={() => setEditingTicket(ticket)}
                userRole={user?.role}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditTicketModal
        myTickets={false}
        ticket={editingTicket}
        open={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default ManageTicketsPage;
