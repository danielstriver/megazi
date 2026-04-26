import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { initialsOf } from "@/lib/format";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: Settings });

function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile?.display_name) setDisplayName(profile.display_name);
  }, [profile]);

  if (!user) {
    return (
      <Layout>
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to access settings.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/login" })}>Sign in</Button>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ display_name: displayName }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and preferences.</p>

        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Profile</h2>
          <div className="mt-4 flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-lg font-semibold">{initialsOf(displayName || user.email || "U")}</AvatarFallback>
            </Avatar>
            <div>
              <Button variant="secondary" disabled>Change photo</Button>
              <p className="mt-1 text-xs text-muted-foreground">Coming soon.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><Label>Display name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 h-10" /></div>
            <div><Label>Email</Label><Input value={user.email || ""} disabled className="mt-1 h-10" /></div>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Preferences</h2>
          <div className="mt-2 divide-y divide-border">
            {[
              { t: "Email notifications", d: "Get updates about your campaigns and earnings." },
              { t: "Auto-play next video", d: "Keep the rewards rolling." },
            ].map((p, i) => (
              <div key={p.t} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium">{p.t}</p>
                  <p className="text-xs text-muted-foreground">{p.d}</p>
                </div>
                <Switch defaultChecked={i === 0} />
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 flex justify-between gap-3">
          <Button variant="ghost" className="text-destructive" onClick={handleSignOut}>Sign out</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save changes
          </Button>
        </div>
      </div>
    </Layout>
  );
}
