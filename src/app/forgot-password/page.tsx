import ForgotPasswordForm from "@/components/forgot-password/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex items-center justify-center min-h-screen">
      <ForgotPasswordForm setEmail={() => console.log("hi")} />
    </main>
  );
}
