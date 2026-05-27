"use client";

import { FiUsers, FiShield, FiCheckCircle, FiXCircle } from "react-icons/fi";
import type { UserStats } from "../../types/user.types";

interface UserStatsCardsProps {
  stats: UserStats | undefined;
  isLoading: boolean;
}

export default function UserStatsCards({ stats, isLoading }: UserStatsCardsProps) {
  const cards = [
    {
      label: "Admins",
      value: stats?.adminsNumber ?? 0,
      icon: FiShield,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Verified Users",
      value: stats?.verifiedUsersNumber ?? 0,
      icon: FiCheckCircle,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Unverified Users",
      value: stats?.unverifiedUsersNumber ?? 0,
      icon: FiXCircle,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Total Users",
      value: (stats?.verifiedUsersNumber ?? 0) + (stats?.unverifiedUsersNumber ?? 0),
      icon: FiUsers,
      color: "text-blue-600 bg-blue-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-200 bg-white p-5 flex items-center gap-4"
        >
          <div className={`rounded-lg p-3 ${card.color}`}>
            <card.icon className="size-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {isLoading ? (
                <span className="inline-block w-8 h-5 rounded bg-gray-200 animate-pulse" />
              ) : (
                card.value
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
