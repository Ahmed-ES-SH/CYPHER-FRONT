import SignInComponent from "@/app/_components/_auth/SignInComponent";
import { getSharedMetadata } from "@/app/helpers/getSharedMetadata";

export function generateMetadata() {
  const title = "CYPHER – Electronics Store ECommerce - Login Page";
  const description =
    "Sign in to your CYPHER account to access exclusive deals, track your orders, and manage your electronic purchases securely and easily.";
  const sharedMetadata = getSharedMetadata(title, description);

  return sharedMetadata;
}

export default function SignInPage() {
  return <SignInComponent />;
}
