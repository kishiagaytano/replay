"use client";

import { useEffect, useState } from "react";
import type { Member } from "@/lib/schema/task.schema";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Label, TextInput } from "@/components/ui/Field";

/** Edit a teammate's display name, role, and initials. */
export function EditMemberDialog({
  open,
  member,
  onClose,
  onSubmit,
}: {
  open: boolean;
  member: Member | null;
  onClose: () => void;
  onSubmit: (id: string, patch: Pick<Member, "name" | "role" | "initials">) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [initials, setInitials] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !member) return;
    setError(null);
    setName(member.name);
    setRole(member.role);
    setInitials(member.initials);
  }, [open, member]);

  const handleSubmit = () => {
    if (!member) return;
    const trimmedName = name.trim();
    const trimmedInitials = initials.trim().slice(0, 2).toUpperCase();
    if (!trimmedName) {
      setError("Name can't be empty.");
      return;
    }
    if (!trimmedInitials) {
      setError("Initials can't be empty.");
      return;
    }
    onSubmit(member.id, { name: trimmedName, role: role.trim(), initials: trimmedInitials });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={member ? `Edit ${member.name}` : "Edit member"}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="member-name">Name</Label>
          <TextInput id="member-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="member-role">Role</Label>
          <TextInput
            id="member-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Design & Frontend"
          />
        </div>
        <div>
          <Label htmlFor="member-initials">Initials (avatar)</Label>
          <TextInput
            id="member-initials"
            value={initials}
            maxLength={2}
            onChange={(e) => setInitials(e.target.value)}
            className="w-24 uppercase"
          />
        </div>

        {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Save changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
