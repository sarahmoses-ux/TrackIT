import {
  Mail,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import KPICard from "../components/ui/KPICard";
import Modal from "../components/ui/Modal";
import Select from "../components/ui/Select";
import Skeleton, { TableSkeleton } from "../components/ui/Skeleton";
import Table, { TableEmpty, TableHead } from "../components/ui/Table";
import { useToast } from "../context/ToastContext";
import useTeam from "../hooks/useTeam";
import { inviteTeamMember, removeTeamMember, updateTeamMember } from "../services/mockApi";
import { formatDate, formatRelativeTime } from "../utils/dateHelpers";

const roleOptions = ["Owner", "Inventory Manager", "Sales Associate", "Operations Lead", "Accountant"];
const accessOptions = ["Full Access", "Inventory", "Sales", "Reports", "Insights"];
const statusOptions = ["Active", "Pending Invite", "Inactive"];

const emptyForm = {
  access_level: "Inventory",
  email: "",
  name: "",
  role: "Sales Associate",
  status: "Pending Invite",
};

function getStatusTone(status) {
  if (status === "Active") return "success";
  if (status === "Pending Invite") return "warning";
  return "neutral";
}

function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-40 w-full rounded-3xl" />
      <TableSkeleton columns={7} rows={6} />
    </div>
  );
}

export default function Team() {
  const { loading, refresh, team } = useTeam();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState(emptyForm);
  const deferredQuery = useDeferredValue(query);

  const filteredTeam = useMemo(() => {
    const search = deferredQuery.trim().toLowerCase();
    return team.filter((member) => {
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      const matchesQuery =
        !search ||
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search) ||
        member.role.toLowerCase().includes(search);
      return matchesStatus && matchesQuery;
    });
  }, [deferredQuery, statusFilter, team]);

  const summary = useMemo(() => {
    const active = team.filter((member) => member.status === "Active").length;
    const pending = team.filter((member) => member.status === "Pending Invite").length;
    const roles = new Set(team.map((member) => member.role)).size;
    return {
      active,
      pending,
      roles,
      total: team.length,
    };
  }, [team]);

  const closeModal = () => {
    setModalOpen(false);
    setEditingMember(null);
    setErrors({});
    setForm(emptyForm);
  };

  const openInvite = () => {
    setEditingMember(null);
    setErrors({});
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setErrors({});
    setForm({
      access_level: member.access_level,
      email: member.email,
      name: member.name,
      role: member.role,
      status: member.status,
    });
    setModalOpen(true);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!form.role) nextErrors.role = "Role is required.";
    if (!form.access_level) nextErrors.access_level = "Access level is required.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      showToast("Please fix the highlighted team fields.", "error");
      return;
    }

    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, {
          access_level: form.access_level,
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          role: form.role,
          status: form.status,
        });
        showToast("Team member updated.", "success");
      } else {
        await inviteTeamMember({
          access_level: form.access_level,
          email: form.email.trim().toLowerCase(),
          name: form.name.trim(),
          role: form.role,
          status: form.status,
        });
        showToast("Invitation created for team member.", "success");
      }
      closeModal();
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to save team member.", "error");
    }
  };

  const handleRemove = async (member) => {
    if (member.role === "Owner") {
      showToast("The owner seat cannot be removed from the team.", "warning");
      return;
    }

    const confirmed = window.confirm(`Remove ${member.name} from the team?`);
    if (!confirmed) {
      return;
    }

    try {
      await removeTeamMember(member.id);
      showToast("Team member removed.", "success");
      startTransition(() => refresh());
    } catch (error) {
      showToast(error.message || "Unable to remove team member.", "error");
    }
  };

  if (loading) {
    return <TeamSkeleton />;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard icon={Users} label="Total Members" trend="+12% team growth" value={summary.total} />
        <KPICard icon={UserCheck} label="Active Members" trend={`${summary.active} active today`} value={summary.active} />
        <KPICard icon={Mail} label="Pending Invites" trend="Follow up on new seats" value={summary.pending} />
        <KPICard icon={ShieldCheck} label="Roles In Use" trend="Balanced access setup" value={summary.roles} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="panel-card rounded-[28px] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-text">Team Management</h2>
              <p className="mt-2 text-base text-muted">
                Invite staff, assign access, and keep track of who can work inside TrackIt.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <Input
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, email, or role"
                value={query}
              />
              <Select onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                <option value="All">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
              <Button onClick={openInvite}>
                <Plus className="h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>
        </div>

        <div className="panel-card rounded-[28px] p-6">
          <h2 className="font-display text-xl font-semibold text-text">Access Levels</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-primary-light/60 p-4">
              <p className="text-sm font-semibold text-primary">Full Access</p>
              <p className="mt-1 text-sm text-muted">Manage products, sales, reports, insights, and team settings.</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-text">Inventory / Sales / Reports / Insights</p>
              <p className="mt-1 text-sm text-muted">Assign focused access to keep staff workflows simple and safe.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <Table>
          <TableHead columns={["Member", "Role", "Access", "Status", "Last Active", "Joined", "Actions"]} />
          {filteredTeam.length ? (
            <tbody className="divide-y divide-border">
              {filteredTeam.map((member) => (
                <tr key={member.id} className="interactive-row">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-text">{member.name}</p>
                        <p className="text-sm text-muted">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{member.role}</td>
                  <td className="px-4 py-4">
                    <Badge tone="primary">{member.access_level}</Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={getStatusTone(member.status)}>{member.status}</Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{formatRelativeTime(member.last_active)}</td>
                  <td className="px-4 py-4 text-sm text-muted">{formatDate(member.joined_at)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-muted transition-colors hover:bg-primary-light hover:text-primary"
                        onClick={() => openEdit(member)}
                        title="Edit member"
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-danger transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={member.role === "Owner"}
                        onClick={() => handleRemove(member)}
                        title="Remove member"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <TableEmpty message="No team members match your current filters." />
          )}
        </Table>
      </section>

      <Modal
        onClose={closeModal}
        open={modalOpen}
        subtitle={
          editingMember
            ? "Update this team member's role, access, and status."
            : "Invite a new teammate and choose exactly what they can access."
        }
        title={editingMember ? "Edit Team Member" : "Add Team Member"}
      >
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              error={errors.name}
              label="Full Name*"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
            <Input
              error={errors.email}
              label="Email*"
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              type="email"
              value={form.email}
            />
            <Select
              error={errors.role}
              label="Role*"
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              value={form.role}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
            <Select
              error={errors.access_level}
              label="Access Level*"
              onChange={(event) => setForm((current) => ({ ...current, access_level: event.target.value }))}
              value={form.access_level}
            >
              {accessOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
            <div className="sm:col-span-2">
              <Select
                label="Status"
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                value={form.status}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="rounded-2xl border border-primary/15 bg-primary-light/50 px-4 py-3 text-sm text-primary">
            Suggested use: keep `Full Access` for owners only, and assign focused access to staff.
          </div>
          <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
            <Button onClick={closeModal} variant="ghost">
              Cancel
            </Button>
            <Button type="submit">
              {editingMember ? "Save Changes" : "Invite Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
