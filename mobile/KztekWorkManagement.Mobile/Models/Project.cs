using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace KztekWorkManagement.Mobile.Models
{
    public class ProjectCount
    {
        [JsonPropertyName("tasks")]
        public int Tasks { get; set; }

        [JsonPropertyName("members")]
        public int Members { get; set; }

        [JsonPropertyName("customerTickets")]
        public int CustomerTickets { get; set; }
    }

    public class Project
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("key")]
        public string Key { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = "PLANNING";

        [JsonPropertyName("ownerId")]
        public string OwnerId { get; set; } = string.Empty;

        [JsonPropertyName("owner")]
        public User? Owner { get; set; }

        [JsonPropertyName("_count")]
        public ProjectCount? Count { get; set; }
    }

    public class ProjectsResponse
    {
        [JsonPropertyName("projects")]
        public List<Project>? Projects { get; set; }
    }
}
