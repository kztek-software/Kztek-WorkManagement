---
step: 1.1
title: Nâng cấp API tasks/route.ts trả về thông tin Team & Email của thành viên
agent: junior-developer
status: in_progress
---

# STEP 1.1: Nâng cấp API tasks/route.ts trả về thông tin Team & Email của thành viên

## Nhiệm vụ
1. Cập nhật src/app/api/projects/[projectId]/tasks/route.ts:
   - prisma.projectMember.findMany include user: { select: { id: true, name: true, avatarColor: true, title: true, email: true, team: { select: { id: true, name: true, code: true, color: true } } } }.