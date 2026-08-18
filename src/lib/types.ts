export type UserLite = {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  title?: string | null;
};

export type LabelDto = {
  id: string;
  name: string;
  color: string;
};

export type SubtaskDto = {
  id: string;
  title: string;
  done: boolean;
};

export type TaskDto = {
  id: string;
  projectId: string;
  sprintId: string | null;
  number: number;
  title: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  storyPoints: number | null;
  position: number;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string | null;
  notionUrl?: string | null;
  notionPageId?: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: UserLite | null;
  labels: { label: LabelDto }[];
  subtasks: SubtaskDto[];
  customerTicket?: {
    id: string;
    trackingCode: string;
    customerName: string;
    customerEmail: string;
  } | null;
  _count: { comments: number };
};

export type SprintDto = {
  id: string;
  name: string;
  goal: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
};

export type ProjectDto = {
  id: string;
  name: string;
  key: string;
  description: string | null;
};

export type MemberDto = {
  id: string;
  role: string;
  user: UserLite;
};

export type CommentDto = {
  id: string;
  body: string;
  createdAt: string;
  author: UserLite;
};

export type ActivityDto = {
  id: string;
  action: string;
  detail: string | null;
  createdAt: string;
  actor: UserLite;
};

export type TicketCommentDto = {
  id: string;
  ticketId: string;
  authorName: string;
  authorEmail?: string | null;
  isStaff: boolean;
  isInternalOnly: boolean;
  message: string;
  createdAt: string;
};

export type CustomerTicketDto = {
  id: string;
  trackingCode: string;
  projectId: string;
  title: string;
  description: string;
  type: string; // BUG | SUPPORT | INQUIRY | FEATURE_REQ
  status: string; // OPEN | TRIAGED | IN_PROGRESS | RESOLVED | CLOSED | REJECTED
  priority: string; // LOW | MEDIUM | HIGH | URGENT
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCompany?: string | null;
  environment?: string | null;
  convertedTaskId?: string | null;
  convertedTask?: {
    id: string;
    number: number;
    title: string;
    status: string;
    type: string;
  } | null;
  internalNotes?: string | null;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  comments?: TicketCommentDto[];
  _count?: { comments: number };
};

export type BoardData = {
  project: ProjectDto;
  tasks: TaskDto[];
  sprints: SprintDto[];
  labels: LabelDto[];
  members: MemberDto[];
  currentRole?: string;
};
