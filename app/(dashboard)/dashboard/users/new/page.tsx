"use client";

import React from "react";
import UserCreateForm from "@/app/_components/_dashboard/Users/UserCreateForm";

export default function NewUserPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-text-primary mb-1">
            Add New User
          </h2>
          <p className="text-sm text-text-secondary">
            Create a new user account with access credentials.
          </p>
        </div>
      </div>

      <UserCreateForm />
    </div>
  );
}
