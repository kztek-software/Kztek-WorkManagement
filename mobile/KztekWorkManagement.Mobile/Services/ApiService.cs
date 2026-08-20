using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace KztekWorkManagement.Mobile.Services
{
    public interface IApiService
    {
        string BaseUrl { get; set; }
        string? AuthToken { get; set; }
        Task<T?> GetAsync<T>(string endpoint);
        Task<T?> PostAsync<T>(string endpoint, object? body);
        Task<T?> PatchAsync<T>(string endpoint, object? body);
        Task<bool> DeleteAsync(string endpoint);
    }

    public class ApiService : IApiService
    {
        private readonly HttpClient _httpClient;
        private string _baseUrl = "http://localhost:3000";
        private string? _authToken;

        private readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true
        };

        public string BaseUrl
        {
            get => _baseUrl;
            set => _baseUrl = value.TrimEnd('/');
        }

        public string? AuthToken
        {
            get => _authToken;
            set => _authToken = value;
        }

        public ApiService()
        {
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(15)
            };
        }

        private void PrepareHeaders(HttpRequestMessage request)
        {
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            if (!string.IsNullOrEmpty(_authToken))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _authToken);
            }
        }

        public async Task<T?> GetAsync<T>(string endpoint)
        {
            var url = $"{_baseUrl}/{endpoint.TrimStart('/')}";
            using var request = new HttpRequestMessage(HttpMethod.Get, url);
            PrepareHeaders(request);

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"API Error ({response.StatusCode}): {errorText}");
            }

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, _jsonOptions);
        }

        public async Task<T?> PostAsync<T>(string endpoint, object? body)
        {
            var url = $"{_baseUrl}/{endpoint.TrimStart('/')}";
            using var request = new HttpRequestMessage(HttpMethod.Post, url);
            PrepareHeaders(request);

            if (body != null)
            {
                var json = JsonSerializer.Serialize(body);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"API Error ({response.StatusCode}): {errorText}");
            }

            var content = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(content)) return default;
            return JsonSerializer.Deserialize<T>(content, _jsonOptions);
        }

        public async Task<T?> PatchAsync<T>(string endpoint, object? body)
        {
            var url = $"{_baseUrl}/{endpoint.TrimStart('/')}";
            using var request = new HttpRequestMessage(HttpMethod.Patch, url);
            PrepareHeaders(request);

            if (body != null)
            {
                var json = JsonSerializer.Serialize(body);
                request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            }

            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorText = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"API Error ({response.StatusCode}): {errorText}");
            }

            var content = await response.Content.ReadAsStringAsync();
            if (string.IsNullOrWhiteSpace(content)) return default;
            return JsonSerializer.Deserialize<T>(content, _jsonOptions);
        }

        public async Task<bool> DeleteAsync(string endpoint)
        {
            var url = $"{_baseUrl}/{endpoint.TrimStart('/')}";
            using var request = new HttpRequestMessage(HttpMethod.Delete, url);
            PrepareHeaders(request);

            using var response = await _httpClient.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
    }
}
