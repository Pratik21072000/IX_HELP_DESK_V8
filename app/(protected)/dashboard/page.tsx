"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  FileText,
  Search,
  Building,
  Users,
  TrendingUp,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { TicketCard } from "@/components/tickets/TicketCard";
import { EditTicketModal } from "@/components/tickets/EditTicketModal";
import { Input } from "@/components/ui/input";
import type {
  Ticket,
  TicketFilters as ITicketFilters,
  DashboardStats,
} from "@/lib/types";

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filters, setFilters] = useState<ITicketFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchQuery]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        fetch("/api/tickets"),
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
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (filters.department) {
      filtered = filtered.filter(
        (ticket) => ticket.department === filters.department,
      );
    }
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

  const handleStatsCardClick = (status?: string) => {
    if (status && status !== "total") {
      const statusMap: Record<string, any> = {
        open: "OPEN",
        "in-progress": "IN_PROGRESS",
        "on-hold": "ON_HOLD",
        cancelled: "CANCELLED",
        closed: "CLOSED",
      };
      setFilters({ status: statusMap[status] });
    } else {
      setFilters({});
    }
    setSearchQuery(""); // Clear search when clicking stats cards
  };

  const getWelcomeMessage = () => {
    if (!user) return "Welcome";
    if (user.role === "EMPLOYEE") {
      return `Welcome back, ${user.name}`;
    }
    return `${user.department} Department Overview`;
  };

  const getStatsCards = () => {
    if (!stats) return [];

    const getIsActive = (cardType: string) => {
      if (cardType === "total") {
        return !filters.status && !filters.department && !filters.priority;
      }
      const statusMap: Record<string, any> = {
        open: "OPEN",
        "in-progress": "IN_PROGRESS",
        "on-hold": "ON_HOLD",
        cancelled: "CANCELLED",
        closed: "CLOSED",
      };
      return filters.status === statusMap[cardType];
    };

    const cards = [
      {
        title: "Total Tickets",
        value: stats.total,
        icon: FileText,
        color: "blue" as const,
        onClick: () => handleStatsCardClick("total"),
        isActive: getIsActive("total"),
      },
      {
        title: "Open",
        value: stats.open,
        icon: Clock,
        color: "yellow" as const,
        onClick: () => handleStatsCardClick("open"),
        isActive: getIsActive("open"),
      },
      {
        title: "In Progress",
        value: stats.inProgress,
        icon: TrendingUp,
        color: "blue" as const,
        onClick: () => handleStatsCardClick("in-progress"),
        isActive: getIsActive("in-progress"),
      },
      {
        title: "On Hold",
        value: stats.onHold,
        icon: Pause,
        color: "purple" as const,
        onClick: () => handleStatsCardClick("on-hold"),
        isActive: getIsActive("on-hold"),
      },
      {
        title: "Cancelled",
        value: stats.cancelled,
        icon: XCircle,
        color: "red" as const,
        onClick: () => handleStatsCardClick("cancelled"),
        isActive: getIsActive("cancelled"),
      },
      {
        title: "Closed",
        value: stats.closed,
        icon: CheckCircle,
        color: "green" as const,
        onClick: () => handleStatsCardClick("closed"),
        isActive: getIsActive("closed"),
      },
    ];

    if (user?.role === "EMPLOYEE") {
      return cards.slice(0, 4);
    }

    return cards;
  };

  const isManager = user && ["ADMIN", "FINANCE", "HR"].includes(user.role);

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
      <div className="space-y-3">
        <h1 className="text-3xl font-heading font-bold text-black tracking-tight">
          {getWelcomeMessage()}
        </h1>
        <p className="text-incub-gray-600 font-body text-lg">
          {user?.role === "EMPLOYEE"
            ? "Manage your tickets and track their progress"
            : "Monitor and manage department tickets"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {getStatsCards().map((card) => (
          <div
            key={card.title}
            className="transform transition-transform hover:scale-105"
          >
            <StatsCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              color={card.color}
              onClick={card.onClick}
              isActive={card.isActive}
            />
          </div>
        ))}
      </div>

      {/* Department Stats for Managers - Show only their department */}
      {isManager && user?.department && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* <div className="transform transition-transform hover:scale-105">
            <StatsCard
              title={`${user.department === "HR" ? "HR" : user.department.charAt(0).toUpperCase() + user.department.slice(1).toLowerCase()} Tickets`}
              value={
                user.department === "ADMIN"
                  ? stats.byDepartment.admin
                  : user.department === "FINANCE"
                    ? stats.byDepartment.finance
                    : stats.byDepartment.hr
              }
              icon={user.department === "HR" ? Users : Building}
              color={
                user.department === "ADMIN"
                  ? "blue"
                  : user.department === "FINANCE"
                    ? "green"
                    : "purple"
              }
            />
          </div> */}
          {/* <div className="transform transition-transform hover:scale-105">
            <StatsCard
              title="My Department Priority"
              value={stats.byPriority.high + stats.byPriority.medium}
              icon={AlertTriangle}
              color="yellow"
              description="High + Medium priority"
            />
          </div> */}
          {/* <div className="transform transition-transform hover:scale-105">
            <StatsCard
              title="Pending Action"
              value={stats.open + stats.inProgress}
              icon={Clock}
              color="red"
              description="Open + In Progress"
            />
          </div> */}
        </div>
      )}

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-incub-gray-400" />
            <Input
              placeholder="Search tickets by subject or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <TicketFilters
          filters={filters}
          onFiltersChange={setFilters}
          userRole={(user?.role as any) || "EMPLOYEE"}
        />
      </div>

      {/* Recent Tickets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-heading font-semibold text-black">
              {user?.role === "EMPLOYEE" ? "Your Tickets" : "Recent Tickets"}
            </h2>
            {filters.status && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-body text-incub-blue-600 bg-incub-blue-100 px-2 py-1 rounded-md">
                  Filtered by:{" "}
                  {filters.status
                    .split("_")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                    )
                    .join(" ")}{" "}
                  tickets
                </span>
                <button
                  onClick={() => setFilters({})}
                  className="text-xs text-incub-gray-500 hover:text-incub-blue-600 underline"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
          <span className="text-sm font-body text-incub-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-incub-gray-200 shadow-sm">
            <FileText className="h-12 w-12 text-incub-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium text-black mb-2">
              {filters.status
                ? `No ${filters.status
                    .split("_")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                    )
                    .join(" ")} tickets found`
                : "No tickets found"}
            </h3>
            <p className="font-body text-incub-gray-500 mb-4">
              {tickets.length === 0
                ? user?.role === "EMPLOYEE"
                  ? "You haven't created any tickets yet."
                  : "No tickets in your department yet."
                : filters.status
                  ? `There are no tickets with ${filters.status
                      .split("_")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase(),
                      )
                      .join(" ")} status.`
                  : "Try adjusting your search or filter criteria."}
            </p>
            {filters.status && (
              <button
                onClick={() => setFilters({})}
                className="text-sm text-incub-blue-600 hover:text-incub-blue-700 underline"
              >
                View all tickets
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.slice(0, 10).map((ticket) => (
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
        ticket={editingTicket}
        open={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        onSuccess={loadData}
        myTickets={false}
      />
    </div>
  );
};

export default DashboardPage;
