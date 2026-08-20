using System.Text.Json.Serialization;

namespace KztekWorkManagement.Mobile.Models
{
    public class User
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("email")]
        public string Email { get; set; } = string.Empty;

        [JsonPropertyName("avatarColor")]
        public string AvatarColor { get; set; } = "#6366f1";

        [JsonPropertyName("title")]
        public string? Title { get; set; }

        [JsonPropertyName("role")]
        public string Role { get; set; } = "MEMBER";
    }

    public class AuthResponse
    {
        [JsonPropertyName("token")]
        public string? Token { get; set; }

        [JsonPropertyName("user")]
        public User? User { get; set; }

        [JsonPropertyName("error")]
        public string? Error { get; set; }
    }
}
