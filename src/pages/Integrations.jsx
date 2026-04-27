import { Link2, Plug, RefreshCcw, ShieldCheck, Wallet } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import KPICard from "../components/ui/KPICard";
import Modal from "../components/ui/Modal";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";
import useIntegrations from "../hooks/useIntegrations";
import { updateIntegration } from "../services/mockApi";
import { formatDateTime } from "../utils/dateHelpers";

export default function Integrations() {
  const { integrations, loading, refresh } = useIntegrations();
  const { showToast } = useToast();
  const [active, setActive] = useState(null);
  const [form, setForm] = useState(null);

  const summary = useMemo(() => {
    const connected = integrations.filter((item) => item.status === "Connected").length;
    const categories = new Set(integrations.map((item) => item.category)).size;
    return { categories, connected, total: integrations.length };
  }, [integrations]);

  const openConfig = (integration) => {
    setActive(integration);
    setForm(integration);
  };

  const closeConfig = () => {
    setActive(null);
    setForm(null);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    try {
      await updateIntegration(active.id, form);
      showToast(`${form.name} configuration saved.`, "success");
      closeConfig();
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to save integration.", "error");
    }
  };

  const handleToggle = async (integration) => {
    const nextStatus = integration.status === "Connected" ? "Disconnected" : "Connected";
    try {
      await updateIntegration(integration.id, { ...integration, status: nextStatus });
      showToast(`${integration.name} ${nextStatus.toLowerCase()}.`, "success");
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to update integration.", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-3xl" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-72 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={Plug} label="Integration Slots" trend="Payments, exports, messaging" value={summary.total} />
        <KPICard icon={Link2} label="Connected" trend="Ready to use" value={summary.connected} />
        <KPICard icon={Wallet} label="Payment Rails" trend="Checkout options" value={integrations.filter((item) => item.category === "Payments").length} />
        <KPICard icon={ShieldCheck} label="Categories" trend="Operations coverage" value={summary.categories} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        {integrations.map((integration) => (
          <div key={integration.id} className="panel-card rounded-[28px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  {integration.category}
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold text-text">{integration.name}</h2>
                <p className="mt-3 text-base leading-7 text-muted">{integration.description}</p>
              </div>
              <Badge tone={integration.status === "Connected" ? "success" : "neutral"}>
                {integration.status}
              </Badge>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-text">{integration.account_label}</p>
              <p className="mt-2 text-sm text-muted">
                {integration.account_value || "No account configured yet"}
              </p>
              <p className="mt-3 text-xs text-muted">
                Last sync: {integration.last_sync_at ? formatDateTime(integration.last_sync_at) : "Never"}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={() => handleToggle(integration)} variant={integration.status === "Connected" ? "subtle" : "primary"}>
                {integration.status === "Connected" ? "Disconnect" : "Connect"}
              </Button>
              <Button onClick={() => openConfig(integration)} variant="outline">
                Configure
              </Button>
              <Button
                onClick={() =>
                  showToast(`${integration.name} sync queued in the demo workspace.`, "info")
                }
                variant="ghost"
              >
                <RefreshCcw className="h-4 w-4" />
                Sync Now
              </Button>
            </div>
          </div>
        ))}
      </section>

      <Modal
        onClose={closeConfig}
        open={Boolean(active && form)}
        subtitle="Store account labels, API keys, and webhook endpoints for your selected integration."
        title={active ? `Configure ${active.name}` : "Configure Integration"}
      >
        {form ? (
          <form className="space-y-5" onSubmit={handleSave}>
            <div className="grid gap-5">
              <Input
                label={form.account_label}
                onChange={(event) => setForm((current) => ({ ...current, account_value: event.target.value }))}
                value={form.account_value}
              />
              <Input
                label="API Key / Token"
                onChange={(event) => setForm((current) => ({ ...current, api_key: event.target.value }))}
                value={form.api_key}
              />
              <Input
                label="Webhook URL"
                onChange={(event) => setForm((current) => ({ ...current, webhook_url: event.target.value }))}
                value={form.webhook_url}
              />
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button onClick={closeConfig} variant="ghost">
                Cancel
              </Button>
              <Button type="submit">Save Configuration</Button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  );
}
