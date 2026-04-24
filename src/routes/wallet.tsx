import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmt, megaziToFrw, transactions } from "@/lib/mock";
import { ArrowDownLeft, ArrowUpRight, Smartphone, Wallet as WalletIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

const withdrawSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+250[0-9]{9}$/, "Phone must be in format +250XXXXXXXXX"),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .int("Amount must be a whole number")
    .min(1000, "Minimum withdrawal is 1,000 FRW")
    .max(500_000, "Maximum withdrawal is 500,000 FRW"),
});

function WalletPage() {
  const balance = 12_480;
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState<string>("5000");
  const [errors, setErrors] = useState<{ phone?: string; amount?: string }>({});

  const handleWithdraw = () => {
    const result = withdrawSchema.safeParse({
      phone,
      amount: Number(amount),
    });
    if (!result.success) {
      const fieldErrors: { phone?: string; amount?: string } = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as "phone" | "amount";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors before withdrawing");
      return;
    }
    setErrors({});
    toast.success("Withdrawal request submitted");
  };

  return (
    <Layout>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Wallet</h1>
          <p className="mt-1 text-muted-foreground">Your MEGAZI balance and transaction history.</p>
        </div>
        <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
          Rate: <span className="font-semibold text-foreground">1 FRW = 10 MGZ</span>
        </span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Balance card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-background to-background p-6 shadow-card">
          <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <WalletIcon className="h-4 w-4 text-primary" /> Available balance
            </div>
            <p className="mt-3 font-display text-5xl font-bold tracking-tight">
              {fmt(balance)} <span className="text-2xl text-muted-foreground">MGZ</span>
            </p>
            <p className="mt-1 text-lg text-muted-foreground">
              ≈ <span className="font-semibold text-foreground">{fmt(megaziToFrw(balance))} FRW</span>
            </p>

            <div className="mt-6 flex gap-3">
              <Button className="bg-gradient-brand shadow-glow hover:opacity-90">
                <ArrowDownLeft className="mr-2 h-4 w-4" /> Top up
              </Button>
              <Button variant="secondary" className="bg-surface hover:bg-accent">
                <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
              </Button>
            </div>
          </div>
        </div>

        {/* Withdraw box */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="font-display text-lg font-bold">Withdraw to Mobile Money</h2>
          <p className="mt-1 text-sm text-muted-foreground">Funds arrive within minutes via MTN MoMo or Airtel Money.</p>
          <div className="mt-4 space-y-3">
            <div>
              <Label className="text-xs">Phone number</Label>
              <div className="relative mt-1">
                <Smartphone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="h-11 bg-surface pl-9"
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
                className="mt-1 h-11 bg-surface"
                aria-invalid={!!errors.amount}
              />
              {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount}</p>}
            </div>
            <p className="text-[11px] text-muted-foreground">Minimum withdrawal: <span className="font-semibold text-foreground">1,000 FRW</span> · Maximum: <span className="font-semibold text-foreground">500,000 FRW</span> · arrives in &lt; 5 min</p>
            <Button onClick={handleWithdraw} className="h-11 w-full bg-gradient-brand hover:opacity-90">Withdraw now</Button>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="mt-10 mb-4 font-display text-xl font-bold">Recent transactions</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {transactions.map((t, i) => (
          <div
            key={t.id}
            className={`flex items-center gap-4 p-4 ${i !== 0 ? "border-t border-border" : ""}`}
          >
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl ${
                t.amount > 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              }`}
            >
              {t.amount > 0 ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t.label}</p>
              <p className="text-xs text-muted-foreground">{t.type} · {t.date}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${t.amount > 0 ? "text-success" : "text-destructive"}`}>
                {t.amount > 0 ? "+" : ""}{fmt(t.amount)} MGZ
              </p>
              <p className="text-xs text-muted-foreground">≈ {fmt(megaziToFrw(Math.abs(t.amount)))} FRW</p>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
