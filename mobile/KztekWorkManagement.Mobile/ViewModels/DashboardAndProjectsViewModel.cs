using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using KztekWorkManagement.Mobile.Common;
using KztekWorkManagement.Mobile.Models;
using KztekWorkManagement.Mobile.Services;

namespace KztekWorkManagement.Mobile.ViewModels
{
    public class DashboardViewModel : ViewModelBase
    {
        private readonly IProjectService _projectService;
        private readonly ITaskService _taskService;
        private readonly IAuthService _authService;
        private readonly Action<string> _navigateToTab;
        private readonly Action<TaskItem> _openTaskDetail;

        private Project? _currentProject;
        private int _todoCount;
        private int _inProgressCount;
        private int _doneCount;
        private int _urgentCount;

        public Project? CurrentProject
        {
            get => _currentProject;
            set => SetProperty(ref _currentProject, value);
        }

        public int TodoCount
        {
            get => _todoCount;
            set => SetProperty(ref _todoCount, value);
        }

        public int InProgressCount
        {
            get => _inProgressCount;
            set => SetProperty(ref _inProgressCount, value);
        }

        public int DoneCount
        {
            get => _doneCount;
            set => SetProperty(ref _doneCount, value);
        }

        public int UrgentCount
        {
            get => _urgentCount;
            set => SetProperty(ref _urgentCount, value);
        }

        public ObservableCollection<TaskItem> UrgentTasks { get; } = new();
        public ObservableCollection<TaskItem> MyAssignedTasks { get; } = new();

        public RelayCommand RefreshCommand { get; }
        public RelayCommand GoToBoardCommand { get; }
        public RelayCommand<TaskItem> SelectTaskCommand { get; }

        public DashboardViewModel(
            IProjectService projectService,
            ITaskService taskService,
            IAuthService authService,
            Action<string> navigateToTab,
            Action<TaskItem> openTaskDetail)
        {
            _projectService = projectService;
            _taskService = taskService;
            _authService = authService;
            _navigateToTab = navigateToTab;
            _openTaskDetail = openTaskDetail;

            RefreshCommand = new RelayCommand(async () => await LoadDashboardDataAsync());
            GoToBoardCommand = new RelayCommand(() => _navigateToTab("BOARD"));
            SelectTaskCommand = new RelayCommand<TaskItem>((t) =>
            {
                if (t != null) _openTaskDetail(t);
            });
        }

        public override async Task InitializeAsync()
        {
            await LoadDashboardDataAsync();
        }

        public async Task LoadDashboardDataAsync()
        {
            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var projects = await _projectService.GetProjectsAsync();
                if (projects.Count > 0)
                {
                    CurrentProject = projects[0];
                    var allTasks = await _taskService.GetTasksAsync(CurrentProject.Id);

                    TodoCount = allTasks.Count(t => t.Status == "TODO" || t.Status == "BACKLOG");
                    InProgressCount = allTasks.Count(t => t.Status == "IN_PROGRESS" || t.Status == "IN_REVIEW");
                    DoneCount = allTasks.Count(t => t.Status == "DONE");
                    UrgentCount = allTasks.Count(t => t.Priority == "URGENT" || t.Priority == "HIGH");

                    UrgentTasks.Clear();
                    foreach (var t in allTasks.Where(t => t.Priority == "URGENT" || t.Priority == "HIGH").Take(5))
                    {
                        UrgentTasks.Add(t);
                    }

                    var currentUserId = _authService.CurrentUser?.Id;
                    MyAssignedTasks.Clear();
                    foreach (var t in allTasks.Where(t => t.AssigneeId == currentUserId || string.IsNullOrEmpty(t.AssigneeId)).Take(5))
                    {
                        MyAssignedTasks.Add(t);
                    }
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tải dữ liệu Dashboard: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }

    public class ProjectsViewModel : ViewModelBase
    {
        private readonly IProjectService _projectService;
        private readonly Action<Project> _onProjectSelected;
        private string _searchText = "";

        public ObservableCollection<Project> Projects { get; } = new();
        public ObservableCollection<Project> FilteredProjects { get; } = new();

        public string SearchText
        {
            get => _searchText;
            set
            {
                if (SetProperty(ref _searchText, value))
                {
                    ApplyFilter();
                }
            }
        }

        public RelayCommand RefreshCommand { get; }
        public RelayCommand<Project> SelectProjectCommand { get; }

        public ProjectsViewModel(IProjectService projectService, Action<Project> onProjectSelected)
        {
            _projectService = projectService;
            _onProjectSelected = onProjectSelected;

            RefreshCommand = new RelayCommand(async () => await LoadProjectsAsync());
            SelectProjectCommand = new RelayCommand<Project>((p) =>
            {
                if (p != null) _onProjectSelected(p);
            });
        }

        public override async Task InitializeAsync()
        {
            await LoadProjectsAsync();
        }

        public async Task LoadProjectsAsync()
        {
            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var list = await _projectService.GetProjectsAsync();
                Projects.Clear();
                foreach (var p in list)
                {
                    Projects.Add(p);
                }
                ApplyFilter();
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tải danh sách dự án: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }

        private void ApplyFilter()
        {
            FilteredProjects.Clear();
            var q = SearchText.Trim().ToLower();
            var matches = string.IsNullOrEmpty(q)
                ? Projects
                : Projects.Where(p => p.Name.ToLower().Contains(q) || p.Key.ToLower().Contains(q));

            foreach (var p in matches)
            {
                FilteredProjects.Add(p);
            }
        }
    }
}
