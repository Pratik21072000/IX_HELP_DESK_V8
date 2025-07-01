"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  FileText,
  Search,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Pause,
  Edit,
} from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { TicketFilters } from "@/components/tickets/TicketFilters";
import { TicketCard } from "@/components/tickets/TicketCard";
import { EditTicketModal } from "@/components/tickets/EditTicketModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  Ticket,
  TicketFilters as ITicketFilters,
  DashboardStats,
} from "@/lib/types";

const MyTicketsPage: React.FC = () => {
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
    loadTickets();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [tickets, filters, searchQuery]);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        fetch("/api/tickets?myTickets=true"), // Only get tickets created by this user
        fetch("/api/dashboard/stats?myTickets=true"), // Only get stats for tickets created by this user
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

  const handleEditTicket = (ticket: Ticket) => {
    setEditingTicket(ticket);
  };

  const handleEditClose = () => {
    setEditingTicket(null);
    loadTickets(); // This will use myTickets=true parameter
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
        title: "Closed",
        value: stats.closed,
        icon: CheckCircle,
        color: "green" as const,
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-incub-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-incub-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log(tickets);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-black flex items-center gap-3 tracking-tight">
            <FileText className="h-7 w-7 text-incub-blue-600" />
            My Tickets
          </h1>
          <p className="text-incub-gray-600 font-body text-lg mt-3">
            View and track all tickets you have created
          </p>
        </div>
        <Button
          onClick={() => router.push("/create-ticket")}
          className="gap-2 bg-incub-blue-500 hover:bg-incub-blue-600 font-body font-medium px-6 py-2.5 rounded-lg"
        >
          <Plus className="h-4 w-4" />
          Create New Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {getStatsCards().map((card) => (
          <Card
            key={card.title}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-body font-medium text-incub-gray-600">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-xl border ${
                  card.color === "blue"
                    ? "bg-incub-blue-50 text-incub-blue-600 border-incub-blue-200"
                    : card.color === "yellow"
                      ? "bg-yellow-50 text-yellow-600 border-yellow-200"
                      : card.color === "purple"
                        ? "bg-purple-50 text-purple-600 border-purple-200"
                        : card.color === "green"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-incub-gray-50 text-incub-gray-600 border-incub-gray-200"
                }`}
              >
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-heading font-bold text-black">
                {card.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-incub-gray-400" />
            <Input
              placeholder="Search your tickets by subject or description..."
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

      {/* Tickets List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-heading font-semibold text-black">
            Your Tickets
          </h2>
          <span className="text-sm font-body text-incub-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-incub-gray-200 shadow-sm">
            <FileText className="h-12 w-12 text-incub-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-heading font-medium text-black mb-2">
              {tickets.length === 0
                ? "No tickets created yet"
                : "No tickets found"}
            </h3>
            <p className="font-body text-incub-gray-500 mb-4">
              {tickets.length === 0
                ? "Create your first support ticket to get started."
                : "Try adjusting your search or filter criteria."}
            </p>
            {tickets.length === 0 && (
              <Button
                onClick={() => router.push("/create-ticket")}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Ticket
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                showActions={false}
                showEdit={true}
                onEdit={() => handleEditTicket(ticket)}
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
        onClose={handleEditClose}
        onSuccess={loadTickets}
        myTickets={true}
      />
    </div>
  );
};

export default MyTicketsPage;
