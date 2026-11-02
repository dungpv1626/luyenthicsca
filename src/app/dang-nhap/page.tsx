import { AuthForm } from "@/components/AuthForm";
import { signIn } from "../actions";

export const metadata = { title: "Đăng nhập" };

export default async function Page({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = "/dashboard" } = await searchParams;
  return <AuthForm mode="login" action={signIn} next={next} />;
}
