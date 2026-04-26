import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmt, frwToMegazi, megaziToFrw } from "@/lib/format";
import { ArrowDownLeft, ArrowUpRight, Loader2, Smartphone, Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useTransactions, useWalletBalance } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

const withdrawSchema = z.object({
  phone: z.string().trim().regex(/^\+250[0-9]{9}$/, "Phone must be +250 followed by 9 digits"),
  amount: z.number().int().min(1000, "Minimum 1,000 FRW").max(500_000, "Maximum 500,000 FRW"),
});

function WalletPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: balance = 0 } = useWalletBalance();
  const { data: transactions } = useTransactions();
  const qc = useQueryClient();
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("5000");
  const [errors, setErrors] = useState<{ phone?: string; amount?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to view your wallet.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/login" })}>Sign in</Button>
        </div>
      </Layout>
    );
  }

  const handleWithdraw = async () => {
    const result = withdrawSchema.safeParse({ phone, amount: Number(amount) });
    if (!result.success) {
      const f: { phone?: string; amount?: string } = {};
      for (const i of result.error.issues) {
        const k = i.path[0] as "phone" | "amount";
        if (!f[k]) f[k] = i.message;
      }
      setErrors(f);
      return;
    }
    setErrors({});
    const mgzNeeded = frwToMegazi(result.data.amount);
    if (mgzNeeded > balance) {
      toast.error(`Insufficient balance. You need ${fmt(mgzNeeded)} MGZ`);
      return;
    }
    setSubmitting(true);
    const { error: walletErr } = await supabase
      .from("wallets")
      .update({ balance_megazi: balance - mgzNeeded })
      .eq("user_id", user.id);
    if (walletErr) { setSubmitting(false); toast.error(walletErr.message); return; }
    const { error: txErr } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "Withdrawal",
      label: `MoMo · ${phone.slice(-4).padStart(phone.length, "*")}`,
      amount_megazi: -mgzNeeded,
    });
    setSubmitting(false);
    if (txErr) { toast.error(txErr.message); return; }
    toast.success(`Withdrawal of ${fmt(result.data.amount)} FRW submitted`);
    qc.invalidateQueries({ queryKey: ["wallet"] });
    qc.invalidateQueries({ queryKey: ["transactions"] });
    setPhone("");
  };

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your MEGAZI balance and transaction history.</p>
        </div>
        <span className="rounded-md bg-surface px-3 py-1 text-xs text-muted-foreground">
          Rate: <span className="font-medium text-foreground">1 FRW = 10 MGZ</span>
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <WalletIcon className="h-4 w-4" /> Available balance
          </div>
          <p className="mt-3 text-4xl font-bold">{fmt(balance)} <span className="text-xl text-muted-foreground">MGZ</span></p>
          <p className="mt-1 text-base text-muted-foreground">≈ <span className="font-medium text-foreground">{fmt(megaziToFrw(balance))} FRW</span></p>
          <div className="mt-6 flex gap-3">
            <Button><ArrowDownLeft className="mr-2 h-4 w-4" /> Top up</Button>
            <Button variant="secondary"><ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw</Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-base font-semibold">Withdraw to Mobile Money</h2>
          <p className="mt-1 text-xs text-muted-foreground">Funds arrive within minutes via MTN MoMo or Airtel Money.</p>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">Phone number</Label>
              <div className="relative mt-1">
                <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-10 pl-9"
                  placeholder="+250788000000"
                  value={phone}
                  maxLength={13}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
            </div>
            <div>
              <Label className="text-xs">Amount (FRW)</Label>
              <Input
                type="number"
                min={1000}
                max={500000}
                step={100}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 h-10"
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
            </div>
            <p className="text-[11px] text-muted-foreground">Min 1,000 FRW · Max 500,000 FRW</p>
            <Button onClick={handleWithdraw} disabled={submitting} className="h-10 w-full">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Withdraw now
            </Button>
          </div>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-lg font-semibold">Recent transactions</h2>
      <div className="overflow-hidden rounded-xl border border-border">
        {!transactions || transactions.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No transactions yet. Watch some videos to start earning.</p>
        ) : (
          transactions.map((t, i) => {
            const amt = Number(t.amount_megazi);
            return (
              <div key={t.id} className={`flex items-center gap-4 p-4 ${i !== 0 ? "border-t border-border" : ""}`}>
                <div className={`grid h-10 w-10 place-items-center rounded-lg ${
                  amt > 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
                }`}>
                  {amt > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.type} · {new Date(t.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${amt > 0 ? "text-success" : "text-destructive"}`}>
                    {amt > 0 ? "+" : ""}{fmt(amt)} MGZ
                  </p>
                  <p className="text-xs text-muted-foreground">≈ {fmt(megaziToFrw(Math.abs(amt)))} FRW</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Layout>
  );
}
