using Microsoft.EntityFrameworkCore;

namespace WebApi.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    /**
    * Directs database configuration settings from the web builder down into the Entity Framework core engine.
    */

    public DbSet<Item> Items => Set<Item>();
    /**
    * Represents a database table named 'Items' that maps directly to your C# 'Item' class model.
    */
}
/**
* Acts as the primary gateway session responsible for querying and saving data to your database.
*/

public class Item
{
    public int Id { get; set; }
    /**
    * Acts as the primary key column, which the database automatically increments for every new row.
    */

    public string Name { get; set; } = string.Empty;
    /**
    * Stores text data for the item name, initialized to empty to avoid database null values.
    */
}
/**
* Defines the structural database schema blueprint for a single data entity record.
*/
