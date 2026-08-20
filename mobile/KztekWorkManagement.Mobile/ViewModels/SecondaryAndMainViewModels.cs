using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using KztekWorkManagement.Mobile.Common;
using KztekWorkManagement.Mobile.Models;
using KztekWorkManagement.Mobile.Services;

namespace KztekWorkManagement.Mobile.ViewModels
{
    public class TicketsViewModel : ViewModelBase
    {
        private readonly ITicketService _ticketService;
        private string _selectedStatus = "ALL";
        private string _searchKeyword = "";

        public string SelectedStatus
        {
            get => _selectedStatus;
            set
            {
                if (SetProperty(ref _selectedStatus, value))
                {
                    _ = LoadTicketsAsync();
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
                    _ = LoadTicketsAsync();
                }
            }
        }

        public ObservableCollection<CustomerTicket> Tickets { get; } = new();

        public RelayCommand RefreshCommand { get; }
        public RelayCommand<CustomerTicket> ResolveTicketCommand { get; }

        public TicketsViewModel(ITicketService ticketService)
        {
            _ticketService = ticketService;
            RefreshCommand = new RelayCommand(async () => await LoadTicketsAsync());
            ResolveTicketCommand = new RelayCommand<CustomerTicket>(async (t) =>
            {
                if (t != null)
                {
                    await _ticketService.UpdateTicketStatusAsync(t.Id, "RESOLVED", "Xử lý thành công từ Mobile App");
                    t.Status = "RESOLVED";
                    OnPropertyChanged(nameof(Tickets));
                }
            });
        }

        public override async Task InitializeAsync()
        {
            await LoadTicketsAsync();
        }

        public async Task LoadTicketsAsync()
        {
            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var list = await _ticketService.GetTicketsAsync(SelectedStatus, null, SearchKeyword);
                Tickets.Clear();
                foreach (var t in list)
                {
                    Tickets.Add(t);
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tải phiếu sự cố: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }

    public class NotificationsViewModel : ViewModelBase
    {
        private readonly INotificationService _notificationService;
        private int _unreadCount;

        public int UnreadCount
        {
            get => _unreadCount;
            set => SetProperty(ref _unreadCount, value);
        }

        public ObservableCollection<NotificationItem> Notifications { get; } = new();

        public RelayCommand RefreshCommand { get; }
        public RelayCommand<NotificationItem> MarkAsReadCommand { get; }

        public NotificationsViewModel(INotificationService notificationService)
        {
            _notificationService = notificationService;
            RefreshCommand = new RelayCommand(async () => await LoadNotificationsAsync());
            MarkAsReadCommand = new RelayCommand<NotificationItem>(async (n) =>
            {
                if (n != null && !n.Read)
                {
                    await _notificationService.MarkAsReadAsync(n.Id);
                    n.Read = true;
                    UnreadCount = Math.Max(0, UnreadCount - 1);
                    OnPropertyChanged(nameof(Notifications));
                }
            });
        }

        public override async Task InitializeAsync()
        {
            await LoadNotificationsAsync();
        }

        public async Task LoadNotificationsAsync()
        {
            IsBusy = true;
            ErrorMessage = null;

            try
            {
                var list = await _notificationService.GetNotificationsAsync();
                Notifications.Clear();
                UnreadCount = list.Count(n => !n.Read);
                foreach (var n in list)
                {
                    Notifications.Add(n);
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Lỗi tải thông báo: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }

    public class SettingsViewModel : ViewModelBase
    {
        private readonly IAuthService _authService;
        private readonly IApiService _apiService;
        private readonly Action _onLogout;

        private string _serverUrl;
        private User? _currentUser;
        private string _statusMessage = "";

        public User? CurrentUser
        {
            get => _currentUser;
            set => SetProperty(ref _currentUser, value);
        }

        public string ServerUrl
        {
            get => _serverUrl;
            set => SetProperty(ref _serverUrl, value);
        }

        public string StatusMessage
        {
            get => _statusMessage;
            set => SetProperty(ref _statusMessage, value);
        }

        public RelayCommand SaveServerUrlCommand { get; }
        public RelayCommand LogoutCommand { get; }

        public SettingsViewModel(IAuthService authService, IApiService apiService, Action onLogout)
        {
            _authService = authService;
            _apiService = apiService;
            _onLogout = onLogout;

            _serverUrl = _apiService.BaseUrl;
            _currentUser = _authService.CurrentUser;

            SaveServerUrlCommand = new RelayCommand(() =>
            {
                _apiService.BaseUrl = ServerUrl;
                StatusMessage = "Đã lưu địa chỉ máy chủ thành công!";
            });

            LogoutCommand = new RelayCommand(() =>
            {
                _authService.Logout();
                _onLogout();
            });
        }

        public override Task InitializeAsync()
        {
            CurrentUser = _authService.CurrentUser;
            ServerUrl = _apiService.BaseUrl;
            return Task.CompletedTask;
        }
    }

    public class MainViewModel : ViewModelBase
    {
        private readonly IAuthService _authService;
        private readonly IApiService _apiService;
        private readonly IProjectService _projectService;
        private readonly ITaskService _taskService;
        private readonly ITicketService _ticketService;
        private readonly INotificationService _notificationService;

        private ViewModelBase _currentView;
        private string _activeTab = "DASHBOARD"; // DASHBOARD | BOARD | TICKETS | NOTIFICATIONS | SETTINGS
        private string _headerTitle = "KZTEK Work Management";
        private bool _isLoggedIn;

        public ViewModelBase CurrentView
        {
            get => _currentView;
            set => SetProperty(ref _currentView, value);
        }

        public string ActiveTab
        {
            get => _activeTab;
            set => SetProperty(ref _activeTab, value);
        }

        public string HeaderTitle
        {
            get => _headerTitle;
            set => SetProperty(ref _headerTitle, value);
        }

        public bool IsLoggedIn
        {
            get => _isLoggedIn;
            set => SetProperty(ref _isLoggedIn, value);
        }

        public LoginViewModel LoginVM { get; }
        public DashboardViewModel DashboardVM { get; }
        public KanbanBoardViewModel KanbanVM { get; }
        public TaskDetailViewModel TaskDetailVM { get; }
        public CreateTaskViewModel CreateTaskVM { get; }
        public TicketsViewModel TicketsVM { get; }
        public NotificationsViewModel NotificationsVM { get; }
        public SettingsViewModel SettingsVM { get; }

        public RelayCommand<string> NavigateTabCommand { get; }

        public MainViewModel()
        {
            _apiService = new ApiService();
            _authService = new AuthService(_apiService);
            _projectService = new ProjectService(_apiService);
            _taskService = new TaskService(_apiService);
            _ticketService = new TicketService(_apiService);
            _notificationService = new NotificationService(_apiService);

            LoginVM = new LoginViewModel(_authService, _apiService, OnLoginSuccess);
            DashboardVM = new DashboardViewModel(_projectService, _taskService, _authService, NavigateToTab, OpenTaskDetail);
            KanbanVM = new KanbanBoardViewModel(_taskService, _projectService, OpenTaskDetail, OpenCreateTask);
            TaskDetailVM = new TaskDetailViewModel(_taskService, BackToKanban);
            CreateTaskVM = new CreateTaskViewModel(_taskService, OnTaskCreated, BackToKanban);
            TicketsVM = new TicketsViewModel(_ticketService);
            NotificationsVM = new NotificationsViewModel(_notificationService);
            SettingsVM = new SettingsViewModel(_authService, _apiService, OnLogout);

            _currentView = LoginVM;
            IsLoggedIn = false;

            NavigateTabCommand = new RelayCommand<string>((tab) =>
            {
                if (!string.IsNullOrEmpty(tab)) NavigateToTab(tab);
            });
        }

        private void OnLoginSuccess()
        {
            IsLoggedIn = true;
            NavigateToTab("DASHBOARD");
        }

        private void OnLogout()
        {
            IsLoggedIn = false;
            HeaderTitle = "KZTEK Work Management";
            CurrentView = LoginVM;
        }

        public void NavigateToTab(string tab)
        {
            ActiveTab = tab.ToUpper();
            switch (ActiveTab)
            {
                case "DASHBOARD":
                    HeaderTitle = "Tổng quan công việc";
                    CurrentView = DashboardVM;
                    _ = DashboardVM.InitializeAsync();
                    break;
                case "BOARD":
                    HeaderTitle = "Bảng Kanban";
                    CurrentView = KanbanVM;
                    _ = KanbanVM.InitializeAsync();
                    break;
                case "TICKETS":
                    HeaderTitle = "Báo lỗi Khách hàng";
                    CurrentView = TicketsVM;
                    _ = TicketsVM.InitializeAsync();
                    break;
                case "NOTIFICATIONS":
                    HeaderTitle = "Thông báo";
                    CurrentView = NotificationsVM;
                    _ = NotificationsVM.InitializeAsync();
                    break;
                case "SETTINGS":
                    HeaderTitle = "Cài đặt & Tài khoản";
                    CurrentView = SettingsVM;
                    _ = SettingsVM.InitializeAsync();
                    break;
            }
        }

        private void OpenTaskDetail(TaskItem task)
        {
            if (KanbanVM.CurrentProject != null)
            {
                HeaderTitle = $"Chi tiết việc #{task.Number}";
                CurrentView = TaskDetailVM;
                _ = TaskDetailVM.LoadTaskAsync(KanbanVM.CurrentProject.Id, task.Id);
            }
        }

        private void OpenCreateTask()
        {
            if (KanbanVM.CurrentProject != null)
            {
                HeaderTitle = "Thêm công việc mới";
                CreateTaskVM.SetProject(KanbanVM.CurrentProject.Id);
                CurrentView = CreateTaskVM;
            }
        }

        private void OnTaskCreated()
        {
            NavigateToTab("BOARD");
        }

        private void BackToKanban()
        {
            NavigateToTab("BOARD");
        }
    }
}
