import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, friendlyAuthError } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const f: { email?: string; password?: string } = {};
      for (const i of result.error.issues) {
        const k = i.path[0] as "email" | "password";
        if (!f[k]) f[k] = i.message;
      }
      setErrors(f);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }
    const name =
      data.user?.user_metadata?.display_name ||
      data.user?.email?.split("@")[0] ||
      "there";
    toast.success(`Welcome back, ${name}!`);
    window.location.href = "/";
  };

  const handleForgotPassword = async () => {
    if (!email || !z.string().email().safeParse(email).success) {
      toast.error("Enter your email in the field above first.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }
    toast.success("Check your inbox — reset link sent.");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Toaster />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Use your email and password to continue.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-xs" htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@megazi.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-10"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs" htmlFor="pw">Password</Label>
              <button
                type="button"
                disabled={submitting}
                onClick={handleForgotPassword}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>
            <Input
              id="pw"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-10"
              aria-invalid={!!errors.password}
            />
            {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={submitting} className="h-10 w-full">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-medium text-foreground hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
