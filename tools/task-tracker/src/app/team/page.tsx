"use client";

import { useState } from "react";
import type { Member } from "@/lib/schema/task.schema";
import { useTaskStore } from "@/lib/store/task-store";
import { useNow } from "@/lib/utils/use-now";
import { PageHeader } from "@/components/common/PageHeader";
import { MemberCard } from "@/components/team/MemberCard";
import { EditMemberDialog } from "@/components/team/EditMemberDialog";

export default function TeamPage() {
  const { tasks, members, updateMember } = useTaskStore();
  const now = useNow();

  const [editing, setEditing] = useState<Member | null>(null);
  const [open, setOpen] = useState(false);

  const openEdit = (member: Member) => {
    setEditing(member);
    setOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Team"
        description="Who's carrying what, and how each person's workload is tracking. Tap Edit to update a name or role."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} tasks={tasks} now={now} onEdit={openEdit} />
        ))}
      </div>

      <EditMemberDialog
        open={open}
        member={editing}
        onClose={() => setOpen(false)}
        onSubmit={(id, patch) => updateMember(id, patch)}
      />
    </div>
  );
}
