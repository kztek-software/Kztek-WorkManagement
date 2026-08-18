import Database from "better-sqlite3";
import path from "path";
import { publish } from "@/lib/bus";
import { prisma } from "@/lib/prisma";
import type { CustomerTicketDto, TicketCommentDto } from "@/lib/types";

let dbInstance: Database.Database | null = null;

function getDb(): Database.Database {
  if (!dbInstance) {
    const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
    dbInstance = new Database(dbPath);
    // Ensure WAL mode for optimal concurrent reads and writes
    dbInstance.pragma("journal_mode = WAL");
  }
  return dbInstance;
}

export function generateTrackingCode(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TK-${dateStr}-${random}`;
}

function generateId(): string {
  return "c" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export type CreateTicketParams = {
  projectId: string;
  title: string;
  description: string;
  type?: string;
  priority?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCompany?: string | null;
  environment?: string | null;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType?: string;
    fileSize?: number | null;
    mimeType?: string | null;
  }>;
};

export async function createTicket(params: CreateTicketParams): Promise<CustomerTicketDto> {
  const db = getDb();
  let trackingCode = generateTrackingCode();
  
  // Ensure unique tracking code
  while (true) {
    const existing = db.prepare("SELECT id FROM CustomerTicket WHERE trackingCode = ?").get(trackingCode);
    if (!existing) break;
    trackingCode = generateTrackingCode();
  }

  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO CustomerTicket (
      id, trackingCode, projectId, title, description, type, status, priority,
      customerName, customerEmail, customerPhone, customerCompany, environment,
      createdAt, updatedAt
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?
    )
  `);

  stmt.run(
    id,
    trackingCode,
    params.projectId,
    params.title,
    params.description,
    params.type || "BUG",
    "OPEN",
    params.priority || "MEDIUM",
    params.customerName,
    params.customerEmail,
    params.customerPhone || null,
    params.customerCompany || null,
    params.environment || null,
    now,
    now
  );

  // Insert attachments if any
  if (params.attachments && params.attachments.length > 0) {
    const attachStmt = db.prepare(`
      INSERT INTO Attachment (id, ticketId, fileName, fileUrl, fileType, fileSize, mimeType, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const att of params.attachments) {
      attachStmt.run(
        generateId(),
        id,
        att.fileName,
        att.fileUrl,
        att.fileType || "other",
        att.fileSize || null,
        att.mimeType || null,
        now
      );
    }
  }

  publish(params.projectId, {
    type: "TICKET_CREATED",
    ticketId: id,
    actorId: "customer",
  });

  const created = await getTicketById(id);
  if (!created) throw new Error("Không thể tải ticket vừa tạo");
  return created;
}

export async function getTicketByTrackingCode(trackingCode: string): Promise<CustomerTicketDto | null> {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM CustomerTicket WHERE trackingCode = ? COLLATE NOCASE
  `).get(trackingCode) as any;

  if (!row) return null;
  return formatTicketRow(row, false);
}

export async function getTicketById(id: string, includeInternal = true): Promise<CustomerTicketDto | null> {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM CustomerTicket WHERE id = ?
  `).get(id) as any;

  if (!row) return null;
  return formatTicketRow(row, includeInternal);
}

export async function getTicketsByProject(
  projectId: string,
  options?: {
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
  }
): Promise<{
  tickets: CustomerTicketDto[];
  stats: {
    total: number;
    open: number;
    triaged: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
}> {
  const db = getDb();
  let query = `SELECT * FROM CustomerTicket WHERE projectId = ?`;
  const params: any[] = [projectId];

  if (options?.status && options.status !== "ALL") {
    query += ` AND status = ?`;
    params.push(options.status);
  }

  if (options?.priority && options.priority !== "ALL") {
    query += ` AND priority = ?`;
    params.push(options.priority);
  }

  if (options?.type && options.type !== "ALL") {
    query += ` AND type = ?`;
    params.push(options.type);
  }

  if (options?.search && options.search.trim()) {
    query += ` AND (title LIKE ? OR trackingCode LIKE ? OR customerName LIKE ? OR customerEmail LIKE ?)`;
    const searchParam = `%${options.search.trim()}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  query += ` ORDER BY createdAt DESC`;

  const rows = db.prepare(query).all(...params) as any[];

  // Calculate stats for the project
  const allProjectRows = db.prepare(`
    SELECT status, COUNT(*) as count FROM CustomerTicket WHERE projectId = ? GROUP BY status
  `).all(projectId) as { status: string; count: number }[];

  const stats = {
    total: 0,
    open: 0,
    triaged: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  };

  for (const r of allProjectRows) {
    stats.total += r.count;
    if (r.status === "OPEN") stats.open = r.count;
    else if (r.status === "TRIAGED") stats.triaged = r.count;
    else if (r.status === "IN_PROGRESS") stats.inProgress = r.count;
    else if (r.status === "RESOLVED") stats.resolved = r.count;
    else if (r.status === "CLOSED" || r.status === "REJECTED") stats.closed += r.count;
  }

  const tickets = await Promise.all(rows.map((r) => formatTicketRow(r, true)));

  return { tickets, stats };
}

export async function updateTicket(
  id: string,
  data: {
    status?: string;
    priority?: string;
    type?: string;
    internalNotes?: string | null;
    resolutionNotes?: string | null;
    convertedTaskId?: string | null;
  }
): Promise<CustomerTicketDto | null> {
  const db = getDb();
  const current = await getTicketById(id);
  if (!current) return null;

  const now = new Date().toISOString();
  let resolvedAt = current.resolvedAt;

  if (data.status === "RESOLVED" && current.status !== "RESOLVED") {
    resolvedAt = now;
  } else if (data.status && data.status !== "RESOLVED") {
    resolvedAt = null;
  }

  const stmt = db.prepare(`
    UPDATE CustomerTicket SET
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      type = COALESCE(?, type),
      internalNotes = COALESCE(?, internalNotes),
      resolutionNotes = COALESCE(?, resolutionNotes),
      convertedTaskId = COALESCE(?, convertedTaskId),
      resolvedAt = ?,
      updatedAt = ?
    WHERE id = ?
  `);

  stmt.run(
    data.status ?? null,
    data.priority ?? null,
    data.type ?? null,
    data.internalNotes !== undefined ? data.internalNotes : null,
    data.resolutionNotes !== undefined ? data.resolutionNotes : null,
    data.convertedTaskId !== undefined ? data.convertedTaskId : null,
    resolvedAt,
    now,
    id
  );

  publish(current.projectId, {
    type: "TICKET_UPDATED",
    ticketId: id,
    actorId: "staff",
  });

  return getTicketById(id);
}

export async function addTicketComment(params: {
  ticketId: string;
  authorName: string;
  authorEmail?: string | null;
  isStaff?: boolean;
  isInternalOnly?: boolean;
  message: string;
}): Promise<TicketCommentDto> {
  const db = getDb();
  const id = generateId();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO TicketComment (
      id, ticketId, authorName, authorEmail, isStaff, isInternalOnly, message, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    params.ticketId,
    params.authorName,
    params.authorEmail || null,
    params.isStaff ? 1 : 0,
    params.isInternalOnly ? 1 : 0,
    params.message,
    now
  );

  // Update ticket's updatedAt timestamp
  db.prepare("UPDATE CustomerTicket SET updatedAt = ? WHERE id = ?").run(now, params.ticketId);

  const ticket = await getTicketById(params.ticketId);
  if (ticket) {
    publish(ticket.projectId, {
      type: "TICKET_UPDATED",
      ticketId: params.ticketId,
      actorId: params.isStaff ? "staff" : "customer",
    });
  }

  return {
    id,
    ticketId: params.ticketId,
    authorName: params.authorName,
    authorEmail: params.authorEmail || null,
    isStaff: !!params.isStaff,
    isInternalOnly: !!params.isInternalOnly,
    message: params.message,
    createdAt: now,
  };
}

export async function getTicketComments(
  ticketId: string,
  includeInternal = true
): Promise<TicketCommentDto[]> {
  const db = getDb();
  let query = `SELECT * FROM TicketComment WHERE ticketId = ?`;
  if (!includeInternal) {
    query += ` AND isInternalOnly = 0`;
  }
  query += ` ORDER BY createdAt ASC`;

  const rows = db.prepare(query).all(ticketId) as any[];

  return rows.map((r) => ({
    id: r.id,
    ticketId: r.ticketId,
    authorName: r.authorName,
    authorEmail: r.authorEmail,
    isStaff: Boolean(r.isStaff),
    isInternalOnly: Boolean(r.isInternalOnly),
    message: r.message,
    createdAt: r.createdAt,
  }));
}

async function formatTicketRow(row: any, includeInternal: boolean): Promise<CustomerTicketDto> {
  const comments = await getTicketComments(row.id, includeInternal);
  const db = getDb();

  // Query attachments for this ticket
  const attachmentRows = db.prepare(`
    SELECT * FROM Attachment WHERE ticketId = ? ORDER BY createdAt ASC
  `).all(row.id) as any[];

  const attachments = attachmentRows.map((a) => ({
    id: a.id,
    ticketId: a.ticketId,
    taskId: a.taskId,
    fileName: a.fileName,
    fileUrl: a.fileUrl,
    fileType: a.fileType,
    fileSize: a.fileSize,
    mimeType: a.mimeType,
    createdAt: a.createdAt,
  }));

  let convertedTask = null;
  if (row.convertedTaskId) {
    const task = await prisma.task.findUnique({
      where: { id: row.convertedTaskId },
      select: { id: true, number: true, title: true, status: true, type: true },
    });
    convertedTask = task;
  }

  return {
    id: row.id,
    trackingCode: row.trackingCode,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    type: row.type,
    status: row.status,
    priority: row.priority,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    customerCompany: row.customerCompany,
    environment: row.environment,
    convertedTaskId: row.convertedTaskId,
    convertedTask,
    internalNotes: includeInternal ? row.internalNotes : undefined,
    resolutionNotes: row.resolutionNotes,
    resolvedAt: row.resolvedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    comments,
    attachments,
    _count: { comments: comments.length },
  };
}
