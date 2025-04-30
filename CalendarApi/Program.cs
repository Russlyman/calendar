using CalendarApi;
using CalendarApi.Dtos;
using CalendarApi.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add DB context
builder.Services.AddDbContext<CalendarContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("CalendarContext")));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

// Create Event
app.MapPost("/events", async Task<Results<BadRequest<string>, Created<Event>>> (CalendarContext calendarContext, EventCreateRequestDto eventCreateRequestDto) =>
{
    // Reject empty titles
    if (string.IsNullOrWhiteSpace(eventCreateRequestDto.Title))
    {
        return TypedResults.BadRequest("Title cannot be null, empty or whitespace.");
    }

    // Map DTO into Entity.
    var newEvent = new Event
    {
        Title = eventCreateRequestDto.Title,
        Description = eventCreateRequestDto.Description,
        Date = eventCreateRequestDto.Date
    };

    // Track and save.
    calendarContext.Events.Add(newEvent);
    await calendarContext.SaveChangesAsync();

    // ACK: The location of the new resource is returned in Location header but doesn't exist
    // as we do not have a get by id method for the MVP.
    return TypedResults.Created($"/events/{newEvent.Id}", newEvent);
});

// Read Event
app.MapGet("/events", async Task<Results<Ok<List<Event>>, BadRequest<string>, Ok<List<DateOnly>>>> (DateOnly? date, int? month, int? year, CalendarContext calendarContext) =>
{
    // Returns Events on a date
    if (date is not null)
    {
        var eventList = await calendarContext.Events.Where(e => e.Date == date).ToListAsync();
        return TypedResults.Ok(eventList);
    }
    // Returns list of days where events fall in a month.
    else if (month is not null && year is not null) {
        var eventList = await calendarContext.Events.Where(e => e.Date.Month == month && e.Date.Year == year ).Select(e => e.Date).Distinct().ToListAsync();
        return TypedResults.Ok(eventList);
    }
    // Catch for invalid requests.
    else
    {
        return TypedResults.BadRequest("You must query by either a date or month.");
    }
});

// Update Event
app.MapPut("/events/{eventId}", async Task<Results<BadRequest<string>, Ok<Event>, NotFound<string>>> (int eventId, CalendarContext calendarContext, EventUpdateRequestDto eventUpdateRequestDto) =>
{
    var eventObj = await calendarContext.Events.FindAsync(eventId);

    // Reject if event doesn't exist.
    if (eventObj is null)
    {
        return TypedResults.NotFound("Could not find event");
    }

    // Reject empty titles
    if (string.IsNullOrWhiteSpace(eventUpdateRequestDto.Title))
    {
        return TypedResults.BadRequest("Title cannot be null, empty or whitespace.");
    }

    eventObj.Title = eventUpdateRequestDto.Title;
    eventObj.Description = eventUpdateRequestDto.Description;

    await calendarContext.SaveChangesAsync();

    return TypedResults.Ok(eventObj);
});

// Delete Event
app.MapDelete("/events/{eventId}", async Task<Results<NotFound<string>, Ok>> (int eventId, CalendarContext calendarContext) =>
{
    var eventObj = await calendarContext.Events.FindAsync(eventId);

    // Reject if event doesn't exist.
    if (eventObj is null)
    {
        return TypedResults.NotFound("Could not find event");
    }

    calendarContext.Remove(eventObj);
    await calendarContext.SaveChangesAsync();

    return TypedResults.Ok();
});

app.Run();
