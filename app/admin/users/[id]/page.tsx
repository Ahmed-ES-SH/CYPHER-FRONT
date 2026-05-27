import { ProfileSettingsPage } from "@/src/modules/user/components/pages/ProfileSettingsPage";
import type { PageProps } from "next";

export default async function AdminUserDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <ProfileSettingsPage userId={Number(id)} />;
}
