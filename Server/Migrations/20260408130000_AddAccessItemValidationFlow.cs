using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    public partial class AddAccessItemValidationFlow : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "access_granted_on",
                table: "jan_accessitems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "access_valid_until",
                table: "jan_accessitems",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "hod_validation_comments",
                table: "jan_accessitems",
                type: "TEXT",
                nullable: false,
                defaultValue: string.Empty);

            migrationBuilder.AddColumn<int>(
                name: "hod_validation_status",
                table: "jan_accessitems",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "is_hod_validated",
                table: "jan_accessitems",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "access_granted_on",
                table: "jan_accessitems");

            migrationBuilder.DropColumn(
                name: "access_valid_until",
                table: "jan_accessitems");

            migrationBuilder.DropColumn(
                name: "hod_validation_comments",
                table: "jan_accessitems");

            migrationBuilder.DropColumn(
                name: "hod_validation_status",
                table: "jan_accessitems");

            migrationBuilder.DropColumn(
                name: "is_hod_validated",
                table: "jan_accessitems");
        }
    }
}
