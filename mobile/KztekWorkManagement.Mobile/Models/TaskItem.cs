using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace KztekWorkManagement.Mobile.Models
{
    public class Subtask
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("taskId")]
        public string TaskId { get; set; } = string.Empty;

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("done")]
        public bool Done { get; set; }
    }

    public class CommentItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("taskId")]
        public string TaskId { get; set; } = string.Empty;

        [JsonPropertyName("authorId")]
        public string AuthorId { get; set; } = string.Empty;

        [JsonPropertyName("body")]
        public string Body { get; set; } = string.Empty;

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("author")]
        public User? Author { get; set; }
    }

    public class Sprint
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("projectId")]
        public string ProjectId { get; set; } = string.Empty;

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("goal")]
        public string? Goal { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; } = "PLANNING";
    }

    public class TaskCount
    {
        [JsonPropertyName("comments")]
        public int Comments { get; set; }

        [JsonPropertyName("subtasks")]
        public int Subtasks { get; set; }
    }

    public class TaskItem
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = string.Empty;

        [JsonPropertyName("projectId")]
        public string ProjectId { get; set; } = string.Empty;

        [JsonPropertyName("sprintId")]
        public string? SprintId { get; set; }

        [JsonPropertyName("number")]
        public int Number { get; set; }

        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;

        [JsonPropertyName("description")]
        public string? Description { get; set; }

        [JsonPropertyName("type")]
        public string Type { get; set; } = "TASK";

        [JsonPropertyName("status")]
        public string Status { get; set; } = "TODO";

        [JsonPropertyName("priority")]
        public string Priority { get; set; } = "MEDIUM";

        [JsonPropertyName("storyPoints")]
        public int? StoryPoints { get; set; }

        [JsonPropertyName("assigneeId")]
        public string? AssigneeId { get; set; }

        [JsonPropertyName("assignee")]
        public User? Assignee { get; set; }

        [JsonPropertyName("creatorId")]
        public string CreatorId { get; set; } = string.Empty;

        [JsonPropertyName("creator")]
        public User? Creator { get; set; }

        [JsonPropertyName("dueDate")]
        public DateTime? DueDate { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("subtasks")]
        public List<Subtask>? Subtasks { get; set; }

        [JsonPropertyName("comments")]
        public List<CommentItem>? Comments { get; set; }

        [JsonPropertyName("_count")]
        public TaskCount? Count { get; set; }

        [JsonIgnore]
        public string TaskCode => $"#{Number}";

        [JsonIgnore]
        public string AssigneeName => Assignee?.Name ?? "Chưa gán";

        [JsonIgnore]
        public string AssigneeColor => Assignee?.AvatarColor ?? "#94A3B8";

        [JsonIgnore]
        public string DueDateFormatted => DueDate.HasValue ? DueDate.Value.ToString("dd/MM/yyyy") : "Không hạn";
    }

    public class TasksResponse
    {
        [JsonPropertyName("tasks")]
        public List<TaskItem>? Tasks { get; set; }
    }
}
