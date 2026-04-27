import {
  BellRing,
  RefreshCcw,
  Save,
  Settings2,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import AlertBanner from "../components/ui/AlertBanner";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Skeleton from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";
import useSettings from "../hooks/useSettings";
import { resetMockState, updateCurrentUser, updateSettings } from "../services/mockApi";

function ToggleRow({ checked, description, label, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-white px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <span className="relative inline-flex items-center">
        <input checked={checked} className="peer sr-only" onChange={onChange} type="checkbox" />
        <span className="h-7 w-12 rounded-full bg-slate-200 transition peer-checked:bg-primary" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-3xl" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    </div>
  );
}

export default function Settings() {
  const { loading, refresh, settings } = useSettings();
  const { showToast } = useToast();
  const [savingSection, setSavingSection] = useState("");
  const [securityForm, setSecurityForm] = useState({
    confirmPassword: "",
    currentPassword: "",
    newPassword: "",
  });

  const [profileForm, setProfileForm] = useState(null);

  useEffect(() => {
    if (settings) {
      setProfileForm(settings);
    }
  }, [settings]);

  if (loading || !profileForm) {
    return <SettingsSkeleton />;
  }

  const saveProfile = async () => {
    setSavingSection("profile");
    try {
      await updateSettings({
        address: profileForm.address,
        business_email: profileForm.business_email,
        business_name: profileForm.business_name,
        city: profileForm.city,
        owner_name: profileForm.owner_name,
        phone: profileForm.phone,
      });
      await updateCurrentUser({
        business_name: profileForm.business_name,
        email: profileForm.business_email,
        name: profileForm.owner_name,
      });
      showToast("Profile and business settings saved.", "success");
      refresh();
    } catch (error) {
      showToast(error.message || "Unable to save profile settings.", "error");
    } finally {
      setSavingSection("");
    }
  };

  const savePreferences = async () => {
    setSavingSection("preferences");
    try {
      await updateSettings({
        currency: profileForm.currency,
        date_format: profileForm.date_format,
        default_report: profileForm.default_report,
        low_stock_threshold: Number(profileForm.low_stock_threshold),
        timezone: profileForm.timezone,
      });
      showToast("Preferences updated.", "success");
      refresh();
    } catch (error) {
      showToast(error.message || "Unable to save preferences.", "error");
    } finally {
      setSavingSection("");
    }
  };

  const saveNotifications = async () => {
    setSavingSection("notifications");
    try {
      await updateSettings({
        notifications: profileForm.notifications,
      });
      showToast("Notification preferences updated.", "success");
      refresh();
    } catch (error) {
      showToast(error.message || "Unable to save notifications.", "error");
    } finally {
      setSavingSection("");
    }
  };

  const handlePasswordSave = () => {
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      showToast("Complete all password fields first.", "error");
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      showToast("New password and confirmation do not match.", "error");
      return;
    }
    setSecurityForm({ confirmPassword: "", currentPassword: "", newPassword: "" });
    showToast("Password updated for the demo workspace.", "success");
  };

  const handleResetData = () => {
    const confirmed = window.confirm(
      "Reset the demo workspace data? This restores products, sales, insights, team, and settings seeds.",
    );

    if (!confirmed) {
      return;
    }

    resetMockState();
    showToast("Demo workspace reset to seeded data.", "success");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <AlertBanner
        message="Settings are stored locally for this demo. These controls are ready to map to backend endpoints later."
        tone="info"
      />

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel-card rounded-[28px] p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-text">Profile & Business</h2>
              <p className="mt-2 text-base text-muted">
                Update the owner identity and core business contact details.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Owner Name"
              onChange={(event) => setProfileForm((current) => ({ ...current, owner_name: event.target.value }))}
              value={profileForm.owner_name}
            />
            <Input
              label="Business Name"
              onChange={(event) => setProfileForm((current) => ({ ...current, business_name: event.target.value }))}
              value={profileForm.business_name}
            />
            <Input
              label="Business Email"
              onChange={(event) => setProfileForm((current) => ({ ...current, business_email: event.target.value }))}
              type="email"
              value={profileForm.business_email}
            />
            <Input
              label="Phone"
              onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
              value={profileForm.phone}
            />
            <div className="sm:col-span-2">
              <Input
                label="Address"
                onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))}
                value={profileForm.address}
              />
            </div>
            <Input
              label="City"
              onChange={(event) => setProfileForm((current) => ({ ...current, city: event.target.value }))}
              value={profileForm.city}
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={savingSection === "profile"} onClick={saveProfile}>
              <Save className="h-4 w-4" />
              Save Profile
            </Button>
          </div>
        </div>

        <div className="panel-card rounded-[28px] p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-text">Preferences</h2>
              <p className="mt-2 text-base text-muted">
                Control local formatting, report defaults, and your low-stock threshold.
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Currency"
              onChange={(event) => setProfileForm((current) => ({ ...current, currency: event.target.value }))}
              value={profileForm.currency}
            >
              <option value="NGN">NGN</option>
            </Select>
            <Select
              label="Timezone"
              onChange={(event) => setProfileForm((current) => ({ ...current, timezone: event.target.value }))}
              value={profileForm.timezone}
            >
              <option value="Africa/Lagos">Africa/Lagos</option>
              <option value="UTC">UTC</option>
            </Select>
            <Select
              label="Date Format"
              onChange={(event) => setProfileForm((current) => ({ ...current, date_format: event.target.value }))}
              value={profileForm.date_format}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </Select>
            <Input
              label="Low Stock Threshold"
              min="1"
              onChange={(event) =>
                setProfileForm((current) => ({ ...current, low_stock_threshold: event.target.value }))
              }
              type="number"
              value={profileForm.low_stock_threshold}
            />
            <div className="sm:col-span-2">
              <Select
                label="Default Report View"
                onChange={(event) => setProfileForm((current) => ({ ...current, default_report: event.target.value }))}
                value={profileForm.default_report}
              >
                <option value="Sales Report">Sales Report</option>
                <option value="Inventory Report">Inventory Report</option>
              </Select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={savingSection === "preferences"} onClick={savePreferences}>
              <Settings2 className="h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel-card rounded-[28px] p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-text">Notifications</h2>
              <p className="mt-2 text-base text-muted">
                Pick which alerts and summaries matter most to your team.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <ToggleRow
              checked={profileForm.notifications.low_stock_alerts}
              description="Receive alerts when inventory falls below your threshold."
              label="Low-stock alerts"
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    low_stock_alerts: event.target.checked,
                  },
                }))
              }
            />
            <ToggleRow
              checked={profileForm.notifications.daily_summary}
              description="Show a daily performance recap in your workspace."
              label="Daily summary"
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    daily_summary: event.target.checked,
                  },
                }))
              }
            />
            <ToggleRow
              checked={profileForm.notifications.weekly_report}
              description="Prepare a weekly operations summary and reporting reminder."
              label="Weekly report reminder"
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    weekly_report: event.target.checked,
                  },
                }))
              }
            />
            <ToggleRow
              checked={profileForm.notifications.sales_alerts}
              description="Flag unusually high sales activity or sudden spikes."
              label="Sales activity alerts"
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    sales_alerts: event.target.checked,
                  },
                }))
              }
            />
            <ToggleRow
              checked={profileForm.notifications.team_updates}
              description="Stay informed when roles, invites, or access settings change."
              label="Team updates"
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  notifications: {
                    ...current.notifications,
                    team_updates: event.target.checked,
                  },
                }))
              }
            />
          </div>
          <div className="mt-6 flex justify-end">
            <Button disabled={savingSection === "notifications"} onClick={saveNotifications}>
              <Save className="h-4 w-4" />
              Save Notifications
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel-card rounded-[28px] p-6">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-text">Security</h2>
                <p className="mt-2 text-base text-muted">
                  Update your demo password and review admin controls.
                </p>
              </div>
            </div>
            <div className="grid gap-5">
              <Input
                label="Current Password"
                onChange={(event) =>
                  setSecurityForm((current) => ({ ...current, currentPassword: event.target.value }))
                }
                type="password"
                value={securityForm.currentPassword}
              />
              <Input
                label="New Password"
                onChange={(event) =>
                  setSecurityForm((current) => ({ ...current, newPassword: event.target.value }))
                }
                type="password"
                value={securityForm.newPassword}
              />
              <Input
                label="Confirm New Password"
                onChange={(event) =>
                  setSecurityForm((current) => ({ ...current, confirmPassword: event.target.value }))
                }
                type="password"
                value={securityForm.confirmPassword}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handlePasswordSave}>
                <Shield className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </div>

          <div className="rounded-[28px] border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-danger">
                <RefreshCcw className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-3xl font-bold text-red-950">Danger Zone</h2>
                <p className="mt-2 text-base text-red-900/80">
                  Reset the demo workspace back to seeded sample products, sales, insights, team members, and settings.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button onClick={handleResetData} variant="danger">
                    <RefreshCcw className="h-4 w-4" />
                    Reset Demo Data
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
