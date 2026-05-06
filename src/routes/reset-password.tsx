import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { friendlyAuthError } from "@/lib/auth";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPasswordPage });

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [exchanging, setExchanging] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setExchanging(false);
      toast.error("Invalid or expired reset link.");
      return;
    }
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      setExchanging(false);
      if (error) {
        toast.error("Reset link is invalid or has expired.");
      } else {
        setReady(true);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast.error(friendlyAuthError(error.message));
      return;
    }
    toast.success("Password updated! Taking you home...");
    setTimeout(() => { window.location.href = "/"; }, 1200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Toaster />
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-semibold">Set new password</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Choose a strong password for your account.
        </p>

        {exchanging ? (
          <div className="mt-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ready ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label className="text-xs">New password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1 h-10"
              />
            </div>
            <div>
              <Label className="text-xs">Confirm password</Label>
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat your new password"
                className="mt-1 h-10"
              />
            </div>
            <Button type="submit" disabled={submitting} className="h-10 w-full">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update password
            </Button>
          </form>
        ) : (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            This link is invalid or has expired.{" "}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Request a new one
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
