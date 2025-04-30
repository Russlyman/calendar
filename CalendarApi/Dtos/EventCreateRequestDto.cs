using System;

namespace CalendarApi.Dtos;

public class EventCreateRequestDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
}
