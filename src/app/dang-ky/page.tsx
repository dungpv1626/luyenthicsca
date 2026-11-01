import { AuthForm } from "@/components/AuthForm";
import { signUp } from "../actions";

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string; audience?: string }> }) {
  const { next = "/dashboard", audience } = await searchParams;
  return <AuthForm mode="register" action={signUp} next={next} audience={audience} />;
}
