using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateActivityLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "JAN_REQUISITIONS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    RecNo = table.Column<string>(type: "VARCHAR2(50)", maxLength: 50, nullable: false),
                    Date = table.Column<DateTime>(type: "TIMESTAMP", nullable: false),
                    PageNo = table.Column<string>(type: "VARCHAR2(50)", maxLength: 50, nullable: false),
                    FromTeam = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    ToTeam = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    ProductNo = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    ProductRev = table.Column<string>(type: "VARCHAR2(50)", maxLength: 50, nullable: false),
                    ProjectNo = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    ProductName = table.Column<string>(type: "VARCHAR2(255)", maxLength: 255, nullable: false),
                    Purpose = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    MonthlyQty = table.Column<decimal>(type: "NUMBER", nullable: false),
                    Status = table.Column<decimal>(type: "NUMBER", nullable: false),
                    PreparedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    PreparedDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: true),
                    CheckedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: true),
                    CheckedDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: true),
                    ApprovedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: true),
                    ApprovedDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: true),
                    ReceivedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: true),
                    ReceivedDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: true),
                    CreatedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    UpdatedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JAN_REQUISITIONS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JAN_USERS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    EmployeeId = table.Column<string>(type: "VARCHAR2(50)", maxLength: 50, nullable: false),
                    FullName = table.Column<string>(type: "VARCHAR2(200)", maxLength: 200, nullable: false),
                    Email = table.Column<string>(type: "VARCHAR2(256)", maxLength: 256, nullable: false),
                    Password = table.Column<string>(type: "VARCHAR2(255)", maxLength: 255, nullable: false),
                    Role = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "TIMESTAMP", nullable: true),
                    CreatedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    UpdatedBy = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JAN_USERS", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JAN_PARTS",
                columns: table => new
                {
                    Id = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    RequisitionId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    SNo = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    PartNo = table.Column<string>(type: "VARCHAR2(100)", maxLength: 100, nullable: false),
                    Rev = table.Column<string>(type: "VARCHAR2(50)", maxLength: 50, nullable: false),
                    PartName = table.Column<string>(type: "VARCHAR2(255)", maxLength: 255, nullable: false),
                    Qty = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    RequiredDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: false),
                    CommittedDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: false),
                    ActualCompletionDate = table.Column<DateTime>(type: "TIMESTAMP", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JAN_PARTS", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JAN_PARTS_JAN_REQUISITIONS_RequisitionId",
                        column: x => x.RequisitionId,
                        principalTable: "JAN_REQUISITIONS",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "JAN_USERS",
                columns: new[] { "Id", "CreatedAt", "CreatedBy", "Email", "EmployeeId", "FullName", "Password", "Role", "UpdatedAt", "UpdatedBy" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "admin@company.com", "1001", "System Administrator", "password", 1, null, null },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "System", "hod@company.com", "1002", "John HOD", "password", 2, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_JAN_PARTS_RequisitionId",
                table: "JAN_PARTS",
                column: "RequisitionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JAN_PARTS");

            migrationBuilder.DropTable(
                name: "JAN_USERS");

            migrationBuilder.DropTable(
                name: "JAN_REQUISITIONS");
        }
    }
}
