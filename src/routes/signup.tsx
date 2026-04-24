import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-6"><Logo /></div>
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start earning MEGAZI in under a minute.</p>

          <form className="mt-6 space-y-4">
            <div>
              <Label className="text-xs" htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Kayz Reign" className="mt-1 h-11 bg-surface" />
            </div>
            <div>
              <Label className="text-xs" htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@megazi.app" className="mt-1 h-11 bg-surface" />
            </div>
            <div>
              <Label className="text-xs" htmlFor="phone">Phone number</Label>
              <div className="mt-1 flex gap-2">
                <Input id="phone" placeholder="+250 7•• ••• •••" className="h-11 flex-1 bg-surface" />
                <Button type="button" variant="outline" className="h-11 shrink-0 bg-surface hover:bg-accent" onClick={() => setSent(true)}>
                  {sent ? "Resend" : "Send code"}
                </Button>
              </div>
            </div>

            {sent && (
              <div className="rounded-xl border border-border bg-surface/50 p-3">
                <Label className="text-xs">Verification code</Label>
                <div className="mt-2">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <InputOTPSlot key={i} index={i} className="h-11 w-11 bg-background text-base" />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">We sent a 6-digit code to your phone.</p>
              </div>
            )}

            <div>
              <Label className="text-xs" htmlFor="pw">Password</Label>
              <Input id="pw" type="password" placeholder="At least 8 characters" className="mt-1 h-11 bg-surface" />
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground">
              <Checkbox className="mt-0.5" />
              <span>I agree to the <a className="text-primary hover:underline" href="#">Terms</a> and <a className="text-primary hover:underline" href="#">Privacy Policy</a>.</span>
            </label>

            <Button className="h-11 w-full bg-gradient-brand hover:opacity-90">Create account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-surface" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div />
          <div>
            <h2 className="font-display text-4xl font-bold leading-tight">
              100 videos = <span className="text-gradient-brand">1,000 FRW</span>
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground">
              Watch the artists you love. Stack MEGAZI. Withdraw straight to MoMo.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Free to join — no card required</li>
              <li>• Withdraw from 1,000 FRW</li>
              <li>• Daily streaks earn bonus rewards</li>
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">© MEGAZI · Kigali</p>
        </div>
      </div>
    </div>
  );
}
