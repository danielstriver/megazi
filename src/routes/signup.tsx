import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, friendlyAuthError } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/signup")({ component: SignupPage });

const signupSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function SignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({ displayName, email, password });
    if (!result.success) {
      const f: Record<string, string> = {};
      for (const i of result.error.issues) {
        const k = i.path[0] as string;
        if (!f[k]) f[k] = i.message;
      }
      setErrors(f);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) {
      setSubmitting(false);
      toast.error(friendlyAuthError(error.message));
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .upsert({ user_id: data.user.id, display_name: displayName }, { onConflict: "user_id" });
    }

    setSubmitting(false);
    toast.success(`Welcome to MEGAZI, ${displayName}! You're all set.`);
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Toaster />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Start earning MEGAZI in under a minute.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label className="text-xs">Display name</Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Kayz Reign"
              className="mt-1 h-10"
              aria-invalid={!!errors.displayName}
            />
            {errors.displayName && (
              <p className="mt-1 text-xs text-destructive">{errors.displayName}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@megazi.app"
              className="mt-1 h-10"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>
          <div>
            <Label className="text-xs">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1 h-10"
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" disabled={submitting} className="h-10 w-full">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
