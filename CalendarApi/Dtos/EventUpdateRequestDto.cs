using System;

namespace CalendarApi.Dtos;

public class EventUpdateRequestDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
}
