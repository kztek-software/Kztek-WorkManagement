/**
 * Automated Verification Script for Mobile Responsive Optimization (GD2)
 * Tests CSS utilities, AppShell Navigation, Kanban Board mobile tabs & snap scroll,
 * Dialog responsiveness, and Subpage grids.
 */

const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, assertion) {
  totalTests++;
  try {
    if (assertion()) {
      console.log(`  \x1b[32m✔ PASS\x1b[0m : ${name}`);
      passedTests++;
    } else {
      console.error(`  \x1b[31m✘ FAIL\x1b[0m : ${name}`);
      failedTests++;
    }
  } catch (err) {
    console.error(`  \x1b[31m✘ ERROR\x1b[0m : ${name} -> ${err.message}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('📱 KIỂM TRA TỐI ƯU GIAO DIỆN DI ĐỘNG (MOBILE RESPONSIVE - GD2)');
console.log('======================================================\n');

// 1. Check globals.css touch & safe area utilities
console.log('1. CSS Utilities (globals.css):');
const globalsCss = fs.readFileSync(path.join(__dirname, '../src/app/globals.css'), 'utf8');
test('globals.css chứa class .safe-top và .safe-bottom (env(safe-area-inset-*))', () => {
  return globalsCss.includes('safe-top') && globalsCss.includes('safe-bottom') && globalsCss.includes('env(safe-area-inset-bottom)');
});
test('globals.css chứa utility .no-scrollbar', () => {
  return globalsCss.includes('no-scrollbar') && globalsCss.includes('scrollbar-width: none');
});
test('globals.css chứa touch utilities (-webkit-tap-highlight-color & touch-action)', () => {
  return globalsCss.includes('-webkit-tap-highlight-color: transparent') && globalsCss.includes('touch-pan-x');
});

// 2. Check AppShell Mobile Navigation
console.log('\n2. AppShell Mobile Navigation (app-shell.tsx):');
const appShell = fs.readFileSync(path.join(__dirname, '../src/components/app-shell.tsx'), 'utf8');
test('AppShell có state mobileDrawerOpen & hiệu ứng backdrop', () => {
  return appShell.includes('mobileDrawerOpen') && appShell.includes('bg-black/75 backdrop-blur-sm');
});
test('AppShell có nút Hamburger (< lg)', () => {
  return appShell.includes('lg:hidden') && appShell.includes('setMobileDrawerOpen(true)');
});
test('AppShell có Mobile Thumb-zone Bottom Navigation Bar (< lg)', () => {
  return appShell.includes('<nav className="lg:hidden fixed bottom-0') && appShell.includes('safe-bottom');
});
test('Thẻ <main> có padding-bottom pb-16 lg:pb-0 để tránh bị Bottom Bar che khuất', () => {
  return appShell.includes('pb-16 lg:pb-0');
});

// 3. Check Kanban Board Mobile Responsiveness
console.log('\n3. Kanban Board Mobile Optimizations:');
const boardPage = fs.readFileSync(path.join(__dirname, '../src/app/projects/[projectId]/board/page.tsx'), 'utf8');
const boardColumn = fs.readFileSync(path.join(__dirname, '../src/components/board/board-column.tsx'), 'utf8');
test('BoardPage có Mobile Column Quick Switcher Tab Bar & Scroll Sync', () => {
  return boardPage.includes('activeMobileColumn') && (boardPage.includes('scrollToMobileColumn') || boardPage.includes('scrollIntoView'));
});
test('Board container có snap-x snap-mandatory & touch-pan-x', () => {
  return boardPage.includes('snap-x snap-mandatory touch-pan-x');
});
test('BoardColumn có snap-center và kích thước co giãn theo viewport', () => {
  return boardColumn.includes('snap-center') && (boardColumn.includes('w-[84vw]') || boardColumn.includes('w-[88vw]')) && boardColumn.includes('sm:w-80');
});
test('BoardColumn có ID duy nhất để tab switcher cuộn tới', () => {
  return boardColumn.includes('id={`board-col-${status.id}`}');
});

// 4. Check Modals and Dialogs Mobile Responsiveness
console.log('\n4. Modals & Dialogs Responsiveness:');
const dialogUi = fs.readFileSync(path.join(__dirname, '../src/components/ui/dialog.tsx'), 'utf8');
const taskDialog = fs.readFileSync(path.join(__dirname, '../src/components/board/task-dialog.tsx'), 'utf8');
const newTaskDialog = fs.readFileSync(path.join(__dirname, '../src/components/board/new-task-dialog.tsx'), 'utf8');
test('DialogContent (Radix UI) co giãn w-[calc(100vw-1.5rem)] sm:w-full', () => {
  return dialogUi.includes('w-[calc(100vw-1.5rem)]') && dialogUi.includes('max-h-[92vh]');
});
test('TaskDialog có layout 1 cột trên mobile và 2 cột trên desktop', () => {
  return taskDialog.includes('grid-cols-1 lg:grid-cols-[1fr_260px]') && taskDialog.includes('divide-y lg:divide-y-0 lg:divide-x');
});
test('NewTaskDialog có form responsive với grid-cols-1 sm:grid-cols-3', () => {
  return newTaskDialog.includes('grid-cols-1 sm:grid-cols-3 gap-3');
});

// 5. Check Subpages (Users, Dashboard, Sprints, Reports, Tickets)
console.log('\n5. Subpages & Grids Optimizations:');
const usersPage = fs.readFileSync(path.join(__dirname, '../src/app/projects/[projectId]/users/page.tsx'), 'utf8');
const dashboardPage = fs.readFileSync(path.join(__dirname, '../src/app/projects/[projectId]/dashboard/page.tsx'), 'utf8');
const sprintsPage = fs.readFileSync(path.join(__dirname, '../src/app/projects/[projectId]/sprints/page.tsx'), 'utf8');
const reportsPage = fs.readFileSync(path.join(__dirname, '../src/app/projects/[projectId]/reports/page.tsx'), 'utf8');
const ticketsListView = fs.readFileSync(path.join(__dirname, '../src/components/tickets/ticket-list-view.tsx'), 'utf8');

test('Users & RBAC page hiển thị 3 tab cuộn ngang trên mobile (đã bỏ hidden md:flex)', () => {
  return !usersPage.includes('hidden md:flex items-center rounded-xl bg-surface-2') && usersPage.includes('overflow-x-auto no-scrollbar rounded-xl bg-surface-2');
});
test('Users & RBAC Roles matrix chuyển sang 1 cột trên mobile', () => {
  return usersPage.includes('grid-cols-1 lg:grid-cols-[320px_1fr]');
});
test('Dashboard KPI cards chuyển sang grid-cols-2 sm:grid-cols-3 lg:grid-cols-5', () => {
  return dashboardPage.includes('grid-cols-2 sm:grid-cols-3 lg:grid-cols-5');
});
test('Dashboard cho phép cuộn dọc mượt mà trên màn hình nhỏ (overflow-y-auto lg:overflow-hidden)', () => {
  return dashboardPage.includes('overflow-y-auto lg:overflow-hidden');
});
test('Sprints page có layout responsive & nút rút gọn trên mobile', () => {
  return sprintsPage.includes('flex-col sm:flex-row') && sprintsPage.includes('sm:hidden');
});
test('Reports page có tab bar scrollable no-scrollbar và KPI grids responsive', () => {
  return reportsPage.includes('overflow-x-auto no-scrollbar') && reportsPage.includes('grid-cols-2 sm:grid-cols-4');
});
test('Tickets list view có tab scope scrollable no-scrollbar', () => {
  return ticketsListView.includes('overflow-x-auto no-scrollbar');
});

console.log('\n------------------------------------------------------');
console.log(`Kết quả: ${passedTests}/${totalTests} bài kiểm tra đạt yêu cầu (${failedTests === 0 ? '100% THÀNH CÔNG' : 'CÓ LỖI'})`);
console.log('------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
}
