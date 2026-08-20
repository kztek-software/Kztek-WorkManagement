using System;
using System.Threading.Tasks;
using KztekWorkManagement.Mobile.Common;
using KztekWorkManagement.Mobile.Services;

namespace KztekWorkManagement.Mobile.ViewModels
{
    public abstract class ViewModelBase : ObservableObject
    {
        private bool _isBusy;
        private string? _errorMessage;

        public bool IsBusy
        {
            get => _isBusy;
            set => SetProperty(ref _isBusy, value);
        }

        public string? ErrorMessage
        {
            get => _errorMessage;
            set => SetProperty(ref _errorMessage, value);
        }

        public virtual Task InitializeAsync() => Task.CompletedTask;
    }

    public class LoginViewModel : ViewModelBase
    {
        private readonly IAuthService _authService;
        private readonly IApiService _apiService;
        private readonly Action _onLoginSuccess;

        private string _email = "admin@kztek.net";
        private string _password = "admin";
        private string _serverUrl = "http://localhost:3000";

        public string Email
        {
            get => _email;
            set => SetProperty(ref _email, value);
        }

        public string Password
        {
            get => _password;
            set => SetProperty(ref _password, value);
        }

        public string ServerUrl
        {
            get => _serverUrl;
            set
            {
                if (SetProperty(ref _serverUrl, value))
                {
                    _apiService.BaseUrl = value;
                }
            }
        }

        public RelayCommand LoginCommand { get; }

        public LoginViewModel(IAuthService authService, IApiService apiService, Action onLoginSuccess)
        {
            _authService = authService;
            _apiService = apiService;
            _onLoginSuccess = onLoginSuccess;

            LoginCommand = new RelayCommand(async () => await ExecuteLoginAsync());
        }

        private async Task ExecuteLoginAsync()
        {
            if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
            {
                ErrorMessage = "Vui lòng nhập đầy đủ tài khoản và mật khẩu";
                return;
            }

            IsBusy = true;
            ErrorMessage = null;

            try
            {
                _apiService.BaseUrl = ServerUrl;
                var success = await _authService.LoginAsync(Email.Trim(), Password);
                if (success)
                {
                    _onLoginSuccess();
                }
                else
                {
                    ErrorMessage = "Tài khoản hoặc mật khẩu không chính xác";
                }
            }
            catch (Exception ex)
            {
                ErrorMessage = $"Không thể kết nối đến máy chủ: {ex.Message}";
            }
            finally
            {
                IsBusy = false;
            }
        }
    }
}
