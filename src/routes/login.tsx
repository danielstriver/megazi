import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left visual */}
      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-surface via-background to-background" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Logo />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              Welcome back to <span className="text-gradient-brand">the underground.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Pick up where you left off — your watch streak and unwithdrawn MEGAZI are waiting.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">© MEGAZI · Kigali</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-6"><Logo /></div>
          <h1 className="font-display text-2xl font-bold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Use your email or phone to continue.</p>

          <form className="mt-6 space-y-4">
            <div>
              <Label className="text-xs" htmlFor="id">Email or phone</Label>
              <Input id="id" placeholder="you@megazi.app" className="mt-1 h-11 bg-surface" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs" htmlFor="pw">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <Input id="pw" type="password" placeholder="••••••••" className="mt-1 h-11 bg-surface" />
            </div>
            <Button className="h-11 w-full bg-gradient-brand hover:opacity-90">Sign in</Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="h-11 w-full bg-surface hover:bg-accent">Continue with Google</Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/signup" className="font-semibold text-primary hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
