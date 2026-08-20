using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using KztekWorkManagement.Mobile.Common;
using KztekWorkManagement.Mobile.Models;
using KztekWorkManagement.Mobile.Services;

namespace KztekWorkManagement.Mobile.ViewModels
{
    public class KanbanBoardViewModel : ViewModelBase
    {
        private readonly ITaskService _taskService;
        private readonly IProjectService _projectService;
        private readonly Action<TaskItem> _openTaskDetail;
        private readonly Action _openCreateTask;

        private Project? _currentProject;
        private string _selectedStatusTab = "TODO"; // TODO | IN_PROGRESS | IN_REVIEW | DONE | ALL
        private string _selectedPriority = "ALL";
        private string _searchKeyword = "";

        public Project? CurrentProject
        {
            get => _currentProject;
            set
            {
                if (SetProperty(ref _currentProject, value))
                {
                    _ = LoadTasksAsync();
                }
            }
        }

        public string SelectedStatusTab
        {
            get => _selectedStatusTab;
            set
            {
                if (SetProperty(ref _selectedStatusTab, value))
                {
                    ApplyFilter();
                }
            }
        }

        public string SelectedPriority
        {
            get => _selectedPriority;
            set
            {
                if (SetProperty(ref _selectedPriority, value))
                {
                    ApplyFilter();
                }
            }
        }

        public string SearchKeyword
        {
            get => _searchKeyword;
            set
            {
                if (SetProperty(ref _searchKeyword, value))
                {
                    ApplyFilter();
                }
            }
        }

        public ObservableCollection<TaskItem> AllTasks { get; } = new();
        public ObservableCollection<TaskItem> DisplayedTasks { get; } = new();

        public RelayCommand RefreshCommand { get; }
        public RelayCommand CreateTaskCommand { get; }
        public RelayCommand<TaskItem> SelectTaskCommand { get; }
        public RelayCommand<string> SetStatusTabCommand { get; }
        public RelayCommand<TaskItem> AdvanceStatusCommand { get; }

        public KanbanBoardViewModel(
            ITaskService taskService,
            IProjectService projectService,
            Action<TaskItem> openTaskDetail,
            Action openCreateTask)
        {
            _taskService = taskService;
            _projectService = projectService;
            _openTaskDetail = openTaskDetail;
            _openCreateTask = openCreateTask;

            RefreshCommand = new RelayCommand(async () => await LoadTasksAsync());
            CreateTaskCommand = new RelayCommand(() => _openCreateTask());
            SelectTaskCommand = new RelayCommand<TaskItem>((t) =>
            {
                if (t != null) _openTaskDetail(t);
            });
            SetStatusTabCommand = new RelayCommand<string>((tab) =>
            {
                if (!string.IsNullOrEmpty(tab)) SelectedStatusTab = tab;
            });
            AdvanceStatusCommand = new RelayCommand<TaskItem>(async (t) =>
            {
                if (t != null && CurrentProject != null)
                {
                    var nextStatus = t.Status switch
                    {
                        "BACKLOG" => "TODO",
                        "TODO" => "IN_PROGRESS",
                        "IN_PROGRESS" => "IN_REVIEW",
                        "IN_REVIEW" => "DONE",
                        _ => "DONE"
                    };
                    await _taskService.UpdateTaskStatusAsync(CurrentProject.Id, t.Id, nextStatus);
                    t.Status = nextStatus;
                    ApplyFilter();
                }
            });
        }

        public override async Task InitializeAsync()
        {
            if (CurrentProject == null)
            {
                var projects = await _projectService.GetProjectsAsync();
                if (projects.Count > 0)
                {
                    CurrentProject = projects[0];
                }
            }
            await LoadTasksAsync();
        }

        public async Task LoadTasksAsync()
        {
            if (CurrentProject == null) return;

            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var tasks = await _taskService.GetTasksAsync(CurrentProject.Id);
                AllTasks.Clear();
                foreach (var t in tasks)
                {
                    AllTasks.Add(t);
                }
                ApplyFilter();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tải danh sách công việc: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }

        private void ApplyFilter()
        {
            DisplayedTasks.Clear();
            var q = SearchKeyword.Trim().ToLower();

            var matches = AllTasks.AsEnumerable();

            if (SelectedStatusTab != "ALL")
            {
                matches = matches.Where(t => t.Status.Equals(SelectedStatusTab, StringComparison.OrdinalIgnoreCase));
            }

            if (SelectedPriority != "ALL")
            {
                matches = matches.Where(t => t.Priority.Equals(SelectedPriority, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(q))
            {
                matches = matches.Where(t =>
                    t.Title.ToLower().Contains(q) ||
                    t.Number.ToString().Contains(q) ||
                    (t.Assignee?.Name.ToLower().Contains(q) ?? false));
            }

            foreach (var t in matches)
            {
                DisplayedTasks.Add(t);
            }
        }
    }

    public class TaskDetailViewModel : ViewModelBase
    {
        private readonly ITaskService _taskService;
        private readonly Action _onBack;

        private TaskItem? _task;
        private string _newCommentText = "";
        private string _projectId = "";

        public TaskItem? Task
        {
            get => _task;
            set => SetProperty(ref _task, value);
        }

        public string NewCommentText
        {
            get => _newCommentText;
            set => SetProperty(ref _newCommentText, value);
        }

        public ObservableCollection<Subtask> Subtasks { get; } = new();
        public ObservableCollection<CommentItem> Comments { get; } = new();

        public RelayCommand BackCommand { get; }
        public RelayCommand AddCommentCommand { get; }
        public RelayCommand<string> UpdateStatusCommand { get; }

        public TaskDetailViewModel(ITaskService taskService, Action onBack)
        {
            _taskService = taskService;
            _onBack = onBack;

            BackCommand = new RelayCommand(() => _onBack());
            AddCommentCommand = new RelayCommand(async () => await ExecuteAddCommentAsync());
            UpdateStatusCommand = new RelayCommand<string>(async (newStatus) =>
            {
                if (Task != null && !string.IsNullOrEmpty(_projectId) && !string.IsNullOrEmpty(newStatus))
                {
                    await _taskService.UpdateTaskStatusAsync(_projectId, Task.Id, newStatus);
                    Task.Status = newStatus;
                    OnPropertyChanged(nameof(Task));
                }
            });
        }

        public async Task LoadTaskAsync(string projectId, string taskId)
        {
            _projectId = projectId;
            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var fullTask = await _taskService.GetTaskDetailAsync(projectId, taskId);
                if (fullTask != null)
                {
                    Task = fullTask;
                    Subtasks.Clear();
                    if (fullTask.Subtasks != null)
                    {
                        foreach (var sub in fullTask.Subtasks) Subtasks.Add(sub);
                    }

                    Comments.Clear();
                    if (fullTask.Comments != null)
                    {
                        foreach (var c in fullTask.Comments) Comments.Add(c);
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tải chi tiết task: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }

        private async Task ExecuteAddCommentAsync()
        {
            if (Task == null || string.IsNullOrWhiteSpace(NewCommentText)) return;

            IsBusy = true;
            try
            {
                var ok = await _taskService.AddCommentAsync(_projectId, Task.Id, NewCommentText.Trim());
                if (ok)
                {
                    NewCommentText = "";
                    await LoadTaskAsync(_projectId, Task.Id);
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi gửi bình luận: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }

    public class CreateTaskViewModel : ViewModelBase
    {
        private readonly ITaskService _taskService;
        private readonly Action _onSuccess;
        private readonly Action _onCancel;

        private string _projectId = "";
        private string _title = "";
        private string _description = "";
        private string _priority = "MEDIUM";
        private string _type = "TASK";

        public string Title
        {
            get => _title;
            set => SetProperty(ref _title, value);
        }

        public string Description
        {
            get => _description;
            set => SetProperty(ref _description, value);
        }

        public string Priority
        {
            get => _priority;
            set => SetProperty(ref _priority, value);
        }

        public string Type
        {
            get => _type;
            set => SetProperty(ref _type, value);
        }

        public RelayCommand SubmitCommand { get; }
        public RelayCommand CancelCommand { get; }

        public CreateTaskViewModel(ITaskService taskService, Action onSuccess, Action onCancel)
        {
            _taskService = taskService;
            _onSuccess = onSuccess;
            _onCancel = onCancel;

            SubmitCommand = new RelayCommand(async () => await ExecuteSubmitAsync());
            CancelCommand = new RelayCommand(() => _onCancel());
        }

        public void SetProject(string projectId)
        {
            _projectId = projectId;
            Title = "";
            Description = "";
            Priority = "MEDIUM";
            Type = "TASK";
            ErrorMessage = null;
        }

        private async Task ExecuteSubmitAsync()
        {
            if (string.IsNullOrWhiteSpace(Title))
            {
                ErrorMessage = "Tiêu đề công việc là bắt buộc";
                return;
            }

            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var res = await _taskService.CreateTaskAsync(_projectId, Title.Trim(), Description.Trim(), Type, "TODO", Priority);
                if (res != null)
                {
                    _onSuccess();
                }
                else
                {
                    ErrorMessage = "Không thể tạo công việc. Vui lòng thử lại";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tạo công việc: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
