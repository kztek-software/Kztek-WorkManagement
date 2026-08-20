using System;
using System.Threading.Tasks;
using KztekWorkManagement.Mobile.Models;

namespace KztekWorkManagement.Mobile.Services
{
    public interface IAuthService
    {
        User? CurrentUser { get; }
        bool IsAuthenticated { get; }
        string? Token { get; }
        event Action? AuthStateChanged;

        Task<bool> LoginAsync(string emailOrUsername, string password);
        Task<User?> GetCurrentUserAsync();
        void Logout();
    }

    public class AuthService : IAuthService
    {
        private readonly IApiService _apiService;
        private User? _currentUser;
        private string? _token;

        public User? CurrentUser => _currentUser;
        public bool IsAuthenticated => !string.IsNullOrEmpty(_token) && _currentUser != null;
        public string? Token => _token;

        public event Action? AuthStateChanged;

        public AuthService(IApiService apiService)
        {
            _apiService = apiService;
        }

        public async Task<bool> LoginAsync(string emailOrUsername, string password)
        {
            var payload = new
            {
                email = emailOrUsername,
                password = password
            };

            var res = await _apiService.PostAsync<AuthResponse>("api/auth/login", payload);
            if (res != null && !string.IsNullOrEmpty(res.Token) && res.User != null)
            {
                _token = res.Token;
                _currentUser = res.User;
                _apiService.AuthToken = res.Token;
                AuthStateChanged?.Invoke();
                return true;
            }

            return false;
        }

        public async Task<User?> GetCurrentUserAsync()
        {
            if (string.IsNullOrEmpty(_token)) return null;

            var res = await _apiService.GetAsync<AuthResponse>("api/auth/me");
            if (res?.User != null)
            {
                _currentUser = res.User;
                AuthStateChanged?.Invoke();
                return _currentUser;
            }

            return null;
        }

        public void Logout()
        {
            _token = null;
            _currentUser = null;
            _apiService.AuthToken = null;
            AuthStateChanged?.Invoke();
        }
    }
}
