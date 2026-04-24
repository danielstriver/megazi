import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your profile, security and preferences.</p>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-border">
              <AvatarFallback className="bg-gradient-brand text-lg font-bold">KR</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="secondary" className="bg-surface hover:bg-accent">Change photo</Button>
              <p className="mt-1 text-xs text-muted-foreground">PNG or JPG, max 2MB.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><Label>Username</Label><Input defaultValue="kayz_reign" className="mt-1 h-11 bg-surface" /></div>
            <div><Label>Email</Label><Input defaultValue="artist@megazi.app" className="mt-1 h-11 bg-surface" /></div>
            <div><Label>Display name</Label><Input defaultValue="Kayz Reign" className="mt-1 h-11 bg-surface" /></div>
            <div><Label>Phone</Label><Input defaultValue="+250 788 000 000" className="mt-1 h-11 bg-surface" /></div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold">Security</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><Label>Current password</Label><Input type="password" defaultValue="········" className="mt-1 h-11 bg-surface" /></div>
            <div><Label>New password</Label><Input type="password" placeholder="••••••••" className="mt-1 h-11 bg-surface" /></div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold">Preferences</h2>
          <div className="mt-4 divide-y divide-border">
            {[
              { t: "Email notifications", d: "Get updates about your campaigns and earnings." },
              { t: "Push notifications", d: "Real-time alerts on new payouts." },
              { t: "Dark theme", d: "Built for the night. Always on for MEGAZI." },
              { t: "Auto-play next video", d: "Keep the rewards rolling." },
            ].map((p, i) => (
              <div key={p.t} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{p.t}</p>
                  <p className="text-sm text-muted-foreground">{p.d}</p>
                </div>
                <Switch defaultChecked={i !== 1} />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost">Cancel</Button>
          <Button className="bg-gradient-brand shadow-glow hover:opacity-90">Save changes</Button>
        </div>
      </div>
    </Layout>
  );
}
