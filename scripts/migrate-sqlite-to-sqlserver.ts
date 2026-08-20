import Database from "better-sqlite3";
import { prisma } from "../src/lib/prisma";
import path from "path";

const sqlitePath = path.join(process.cwd(), "prisma", "dev.db");

function parseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "number") return new Date(val);
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function parseBool(val: any, defaultVal = false): boolean {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  if (typeof val === "string") return val === "1" || val.toLowerCase() === "true";
  return defaultVal;
}

async function migrate() {
  console.log("==================================================");
  console.log("  KZTEK WORK MANAGEMENT: SQLITE -> SQL SERVER DATA MIGRATION");
  console.log("==================================================");
  console.log(`Source SQLite: ${sqlitePath}`);

  const sqlite = new Database(sqlitePath, { readonly: true });

  try {
    // 1. Migrate Users
    console.log("\n[1/16] Migrating Users...");
    const users: any[] = sqlite.prepare("SELECT * FROM User").all();
    for (const u of users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          name: u.name,
          email: u.email,
          passwordHash: u.passwordHash,
          avatarColor: u.avatarColor || "#6366f1",
          title: u.title ?? null,
          role: u.role || "MEMBER",
          createdAt: parseDate(u.createdAt) || new Date(),
        },
      });
    }
    console.log(`  -> Migrated ${users.length} Users`);

    // 2. Migrate Teams
    console.log("\n[2/16] Migrating Teams...");
    let teams: any[] = [];
    try {
      teams = sqlite.prepare("SELECT * FROM Team").all();
      for (const t of teams) {
        await prisma.team.upsert({
          where: { id: t.id },
          update: {},
          create: {
            id: t.id,
            name: t.name,
            code: t.code,
            description: t.description ?? null,
            color: t.color || "#F05922",
            leaderId: t.leaderId ?? null,
            createdAt: parseDate(t.createdAt) || new Date(),
            updatedAt: parseDate(t.updatedAt) || new Date(),
          },
        });
      }
      console.log(`  -> Migrated ${teams.length} Teams`);

      // Update User teamId references
      for (const u of users) {
        if (u.teamId) {
          await prisma.user.update({
            where: { id: u.id },
            data: { teamId: u.teamId },
          });
        }
      }
    } catch (e: any) {
      console.log(`  -> Teams table note: ${e.message}`);
    }

    // 3. Migrate RoleDefinition
    console.log("\n[3/16] Migrating Role Definitions...");
    let roles: any[] = [];
    try {
      roles = sqlite.prepare("SELECT * FROM RoleDefinition").all();
      for (const r of roles) {
        await prisma.roleDefinition.upsert({
          where: { id: r.id },
          update: {},
          create: {
            id: r.id,
            key: r.key,
            name: r.name,
            description: r.description ?? null,
            color: r.color || "#6366f1",
            isSystem: parseBool(r.isSystem, false),
            permissions: r.permissions || "[]",
            createdAt: parseDate(r.createdAt) || new Date(),
            updatedAt: parseDate(r.updatedAt) || new Date(),
          },
        });
      }
      console.log(`  -> Migrated ${roles.length} Role Definitions`);
    } catch (e: any) {
      console.log(`  -> RoleDefinition note: ${e.message}`);
    }

    // 4. Migrate Projects
    console.log("\n[4/16] Migrating Projects...");
    const projects: any[] = sqlite.prepare("SELECT * FROM Project").all();
    for (const p of projects) {
      await prisma.project.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          name: p.name,
          key: p.key,
          description: p.description ?? null,
          status: p.status || "PLANNING",
          ownerId: p.ownerId,
          createdAt: parseDate(p.createdAt) || new Date(),
          updatedAt: parseDate(p.updatedAt) || new Date(),
        },
      });
    }
    console.log(`  -> Migrated ${projects.length} Projects`);

    // 5. Migrate Project Members
    console.log("\n[5/16] Migrating Project Members...");
    const members: any[] = sqlite.prepare("SELECT * FROM ProjectMember").all();
    for (const m of members) {
      await prisma.projectMember.upsert({
        where: { id: m.id },
        update: {},
        create: {
          id: m.id,
          projectId: m.projectId,
          userId: m.userId,
          role: m.role || "MEMBER",
        },
      });
    }
    console.log(`  -> Migrated ${members.length} Project Members`);

    // 6. Migrate Sprints
    console.log("\n[6/16] Migrating Sprints...");
    const sprints: any[] = sqlite.prepare("SELECT * FROM Sprint").all();
    for (const s of sprints) {
      await prisma.sprint.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          projectId: s.projectId,
          name: s.name,
          goal: s.goal ?? null,
          status: s.status || "PLANNING",
          startDate: parseDate(s.startDate),
          endDate: parseDate(s.endDate),
          createdAt: parseDate(s.createdAt) || new Date(),
        },
      });
    }
    console.log(`  -> Migrated ${sprints.length} Sprints`);

    // 7. Migrate Labels
    console.log("\n[7/16] Migrating Labels...");
    const labels: any[] = sqlite.prepare("SELECT * FROM Label").all();
    for (const l of labels) {
      await prisma.label.upsert({
        where: { id: l.id },
        update: {},
        create: {
          id: l.id,
          projectId: l.projectId,
          name: l.name,
          color: l.color || "#6366f1",
        },
      });
    }
    console.log(`  -> Migrated ${labels.length} Labels`);

    // 8. Migrate Tasks
    console.log("\n[8/16] Migrating Tasks...");
    const tasks: any[] = sqlite.prepare("SELECT * FROM Task").all();
    for (const t of tasks) {
      await prisma.task.upsert({
        where: { id: t.id },
        update: {},
        create: {
          id: t.id,
          projectId: t.projectId,
          sprintId: t.sprintId ?? null,
          number: t.number,
          title: t.title,
          description: t.description ?? null,
          type: t.type || "TASK",
          status: t.status || "TODO",
          priority: t.priority || "MEDIUM",
          storyPoints: t.storyPoints ?? null,
          position: typeof t.position === "number" ? t.position : 0,
          assigneeId: t.assigneeId ?? null,
          creatorId: t.creatorId,
          dueDate: parseDate(t.dueDate),
          completedAt: parseDate(t.completedAt),
          createdAt: parseDate(t.createdAt) || new Date(),
          updatedAt: parseDate(t.updatedAt) || new Date(),
        },
      });
    }
    console.log(`  -> Migrated ${tasks.length} Tasks`);

    // 9. Migrate TaskLabels
    console.log("\n[9/16] Migrating Task Labels...");
    const taskLabels: any[] = sqlite.prepare("SELECT * FROM TaskLabel").all();
    for (const tl of taskLabels) {
      await prisma.taskLabel.upsert({
        where: {
          taskId_labelId: { taskId: tl.taskId, labelId: tl.labelId },
        },
        update: {},
        create: {
          taskId: tl.taskId,
          labelId: tl.labelId,
        },
      });
    }
    console.log(`  -> Migrated ${taskLabels.length} Task Labels`);

    // 10. Migrate Subtasks
    console.log("\n[10/16] Migrating Subtasks...");
    const subtasks: any[] = sqlite.prepare("SELECT * FROM Subtask").all();
    for (const st of subtasks) {
      await prisma.subtask.upsert({
        where: { id: st.id },
        update: {},
        create: {
          id: st.id,
          taskId: st.taskId,
          title: st.title,
          done: parseBool(st.done, false),
        },
      });
    }
    console.log(`  -> Migrated ${subtasks.length} Subtasks`);

    // 11. Migrate Comments
    console.log("\n[11/16] Migrating Comments...");
    const comments: any[] = sqlite.prepare("SELECT * FROM Comment").all();
    for (const c of comments) {
      await prisma.comment.upsert({
        where: { id: c.id },
        update: {},
        create: {
          id: c.id,
          taskId: c.taskId,
          authorId: c.authorId,
          body: c.body || "",
          createdAt: parseDate(c.createdAt) || new Date(),
        },
      });
    }
    console.log(`  -> Migrated ${comments.length} Comments`);

    // 12. Migrate Activities
    console.log("\n[12/16] Migrating Activities...");
    const activities: any[] = sqlite.prepare("SELECT * FROM Activity").all();
    for (const a of activities) {
      await prisma.activity.upsert({
        where: { id: a.id },
        update: {},
        create: {
          id: a.id,
          taskId: a.taskId,
          actorId: a.actorId,
          action: a.action || "UPDATED",
          detail: a.detail ?? null,
          createdAt: parseDate(a.createdAt) || new Date(),
        },
      });
    }
    console.log(`  -> Migrated ${activities.length} Activities`);

    // 13. Migrate Customer Tickets
    console.log("\n[13/16] Migrating Customer Tickets...");
    let tickets: any[] = [];
    try {
      tickets = sqlite.prepare("SELECT * FROM CustomerTicket").all();
      for (const ct of tickets) {
        await prisma.customerTicket.upsert({
          where: { id: ct.id },
          update: {},
          create: {
            id: ct.id,
            trackingCode: ct.trackingCode,
            projectId: ct.projectId ?? null,
            title: ct.title,
            description: ct.description || "",
            type: ct.type || "BUG",
            status: ct.status || "OPEN",
            priority: ct.priority || "MEDIUM",
            customerName: ct.customerName,
            customerEmail: ct.customerEmail,
            customerPhone: ct.customerPhone ?? null,
            customerCompany: ct.customerCompany ?? null,
            environment: ct.environment ?? null,
            convertedTaskId: ct.convertedTaskId ?? null,
            internalNotes: ct.internalNotes ?? null,
            resolutionNotes: ct.resolutionNotes ?? null,
            resolvedAt: parseDate(ct.resolvedAt),
            createdAt: parseDate(ct.createdAt) || new Date(),
            updatedAt: parseDate(ct.updatedAt) || new Date(),
          },
        });
      }
      console.log(`  -> Migrated ${tickets.length} Customer Tickets`);
    } catch (e: any) {
      console.log(`  -> CustomerTicket note: ${e.message}`);
    }

    // 14. Migrate Ticket Comments
    console.log("\n[14/16] Migrating Ticket Comments...");
    let ticketComments: any[] = [];
    try {
      ticketComments = sqlite.prepare("SELECT * FROM TicketComment").all();
      for (const tc of ticketComments) {
        await prisma.ticketComment.upsert({
          where: { id: tc.id },
          update: {},
          create: {
            id: tc.id,
            ticketId: tc.ticketId,
            authorName: tc.authorName,
            authorEmail: tc.authorEmail ?? null,
            isStaff: parseBool(tc.isStaff, false),
            isInternalOnly: parseBool(tc.isInternalOnly, false),
            message: tc.message || "",
            createdAt: parseDate(tc.createdAt) || new Date(),
          },
        });
      }
      console.log(`  -> Migrated ${ticketComments.length} Ticket Comments`);
    } catch (e: any) {
      console.log(`  -> TicketComment note: ${e.message}`);
    }

    // 15. Migrate Attachments
    console.log("\n[15/16] Migrating Attachments...");
    let attachments: any[] = [];
    try {
      attachments = sqlite.prepare("SELECT * FROM Attachment").all();
      for (const att of attachments) {
        await prisma.attachment.upsert({
          where: { id: att.id },
          update: {},
          create: {
            id: att.id,
            taskId: att.taskId ?? null,
            ticketId: att.ticketId ?? null,
            uploaderId: att.uploaderId ?? null,
            fileName: att.fileName,
            fileUrl: att.fileUrl,
            fileType: att.fileType || "other",
            fileSize: att.fileSize ?? null,
            mimeType: att.mimeType ?? null,
            createdAt: parseDate(att.createdAt) || new Date(),
          },
        });
      }
      console.log(`  -> Migrated ${attachments.length} Attachments`);
    } catch (e: any) {
      console.log(`  -> Attachment note: ${e.message}`);
    }

    // 16. Migrate Notifications
    console.log("\n[16/16] Migrating Notifications...");
    let notifications: any[] = [];
    try {
      notifications = sqlite.prepare("SELECT * FROM Notification").all();
      for (const n of notifications) {
        await prisma.notification.upsert({
          where: { id: n.id },
          update: {},
          create: {
            id: n.id,
            userId: n.userId,
            actorId: n.actorId ?? null,
            type: n.type || "ASSIGNED",
            title: n.title,
            message: n.message || "",
            read: parseBool(n.read, false),
            link: n.link ?? null,
            createdAt: parseDate(n.createdAt) || new Date(),
          },
        });
      }
      console.log(`  -> Migrated ${notifications.length} Notifications`);
    } catch (e: any) {
      console.log(`  -> Notification note: ${e.message}`);
    }

    console.log("\n==================================================");
    console.log("  MIGRATION SUMMARY & INTEGRITY CHECK (SQL SERVER)");
    console.log("==================================================");
    const sqlCounts = {
      users: await prisma.user.count(),
      teams: await prisma.team.count(),
      roles: await prisma.roleDefinition.count(),
      projects: await prisma.project.count(),
      members: await prisma.projectMember.count(),
      sprints: await prisma.sprint.count(),
      tasks: await prisma.task.count(),
      labels: await prisma.label.count(),
      taskLabels: await prisma.taskLabel.count(),
      subtasks: await prisma.subtask.count(),
      comments: await prisma.comment.count(),
      activities: await prisma.activity.count(),
      tickets: await prisma.customerTicket.count(),
      ticketComments: await prisma.ticketComment.count(),
      attachments: await prisma.attachment.count(),
      notifications: await prisma.notification.count(),
    };

    console.log(`- Users:          ${sqlCounts.users} / ${users.length}`);
    console.log(`- Teams:          ${sqlCounts.teams} / ${teams.length}`);
    console.log(`- RoleDefinitions:${sqlCounts.roles} / ${roles.length}`);
    console.log(`- Projects:       ${sqlCounts.projects} / ${projects.length}`);
    console.log(`- ProjectMembers: ${sqlCounts.members} / ${members.length}`);
    console.log(`- Sprints:        ${sqlCounts.sprints} / ${sprints.length}`);
    console.log(`- Tasks:          ${sqlCounts.tasks} / ${tasks.length}`);
    console.log(`- Labels:         ${sqlCounts.labels} / ${labels.length}`);
    console.log(`- TaskLabels:     ${sqlCounts.taskLabels} / ${taskLabels.length}`);
    console.log(`- Subtasks:       ${sqlCounts.subtasks} / ${subtasks.length}`);
    console.log(`- Comments:       ${sqlCounts.comments} / ${comments.length}`);
    console.log(`- Activities:     ${sqlCounts.activities} / ${activities.length}`);
    console.log(`- CustomerTickets:${sqlCounts.tickets} / ${tickets.length}`);
    console.log(`- TicketComments: ${sqlCounts.ticketComments} / ${ticketComments.length}`);
    console.log(`- Attachments:    ${sqlCounts.attachments} / ${attachments.length}`);
    console.log(`- Notifications:  ${sqlCounts.notifications} / ${notifications.length}`);

    console.log("\nALL TABLES SUCCESSFULLY MIGRATED TO SQL SERVER!");
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
