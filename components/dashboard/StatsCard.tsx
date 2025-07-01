import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "gray";
  description?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const colorVariants = {
  blue: "bg-incub-blue-50 text-incub-blue-600 border-incub-blue-200",
  green: "bg-green-50 text-green-600 border-green-200",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  red: "bg-red-50 text-red-600 border-red-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  gray: "bg-incub-gray-50 text-incub-gray-600 border-incub-gray-200",
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  description,
  onClick,
  isActive = false,
}) => {
  return (
    <Card
      className={cn(
        "border-0 shadow-sm hover:shadow-md transition-all duration-200",
        onClick && "cursor-pointer hover:scale-105",
        isActive && "ring-2 ring-incub-blue-500 shadow-lg bg-incub-blue-50/50",
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-body font-medium text-incub-gray-600">
          {title}
        </CardTitle>
        <div className={cn("p-2 rounded-xl border", colorVariants[color])}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-heading font-bold text-black">
          {value}
        </div>
        {description && (
          <p className="text-xs font-body text-incub-gray-500 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
