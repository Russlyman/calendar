using System;
using CalendarApi.Models;
using Microsoft.EntityFrameworkCore;

namespace CalendarApi;

public class CalendarContext : DbContext
{
    public CalendarContext(DbContextOptions<CalendarContext> options) : base(options) { }

    public DbSet<Event> Events { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Change table name as EF will use prop name by default.
        modelBuilder.Entity<Event>().ToTable("Event");

        // Configure Event model.
        modelBuilder.Entity<Event>().Property(e => e.Title).IsRequired().HasMaxLength(100);
        modelBuilder.Entity<Event>().Property(e => e.Description).HasMaxLength(500);
        modelBuilder.Entity<Event>().Property(e => e.Date).IsRequired();

        // Add index to speed up queries on date when we GET.
        modelBuilder.Entity<Event>().HasIndex(e => e.Date);
    }
}
