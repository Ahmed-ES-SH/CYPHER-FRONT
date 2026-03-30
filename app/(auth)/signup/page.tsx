import SignUpComponent from "@/app/_components/_auth/SignupComponent";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "CYPHER – Electronics Store ECommerce - Register Page",
  description:
    "Create your CYPHER account to start shopping the latest electronics, access exclusive deals, and manage your orders with ease and security.",
};

export default function SignupPage() {
  return <SignUpComponent />;
}
