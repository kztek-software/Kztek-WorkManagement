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

export type BoardData = {
  project: ProjectDto;
  tasks: TaskDto[];
  sprints: SprintDto[];
  labels: LabelDto[];
  members: MemberDto[];
};
