using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "jan_accessapproval",
                columns: table => new
                {
                    accessapprove_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    accessreq_id = table.Column<int>(type: "INTEGER", nullable: false),
                    approver_id = table.Column<int>(type: "INTEGER", nullable: false),
                    approval_status = table.Column<int>(type: "INTEGER", nullable: false),
                    comments = table.Column<string>(type: "TEXT", nullable: false),
                    created_on = table.Column<DateTime>(type: "TEXT", nullable: false),
                    created_by = table.Column<string>(type: "TEXT", nullable: false),
                    modified_on = table.Column<DateTime>(type: "TEXT", nullable: true),
                    modified_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_accessapproval", x => x.accessapprove_id);
                });

            migrationBuilder.CreateTable(
                name: "jan_accessreqaudit",
                columns: table => new
                {
                    audit_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    accessreq_id = table.Column<int>(type: "INTEGER", nullable: false),
                    accessitem_id = table.Column<int>(type: "INTEGER", nullable: true),
                    accessapprove_id = table.Column<int>(type: "INTEGER", nullable: true),
                    event_type = table.Column<string>(type: "TEXT", nullable: false),
                    message = table.Column<string>(type: "TEXT", nullable: false),
                    recipient_emp_id = table.Column<int>(type: "INTEGER", nullable: false),
                    recipient_name = table.Column<string>(type: "TEXT", nullable: false),
                    recipient_role = table.Column<string>(type: "TEXT", nullable: false),
                    is_read = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_on = table.Column<DateTime>(type: "TEXT", nullable: false),
                    created_by = table.Column<string>(type: "TEXT", nullable: false),
                    modified_on = table.Column<DateTime>(type: "TEXT", nullable: true),
                    modified_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_accessreqaudit", x => x.audit_id);
                });

            migrationBuilder.CreateTable(
                name: "jan_accessrequest",
                columns: table => new
                {
                    accessreq_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    emp_id = table.Column<int>(type: "INTEGER", nullable: false),
                    req_to = table.Column<int>(type: "INTEGER", nullable: false),
                    status = table.Column<int>(type: "INTEGER", nullable: false),
                    aggregate_status = table.Column<int>(type: "INTEGER", nullable: false),
                    is_agreed = table.Column<bool>(type: "INTEGER", nullable: false),
                    itsr_no = table.Column<string>(type: "TEXT", nullable: true),
                    is_active = table.Column<bool>(type: "INTEGER", nullable: false),
                    created_on = table.Column<DateTime>(type: "TEXT", nullable: false),
                    created_by = table.Column<string>(type: "TEXT", nullable: false),
                    modified_on = table.Column<DateTime>(type: "TEXT", nullable: true),
                    modified_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_accessrequest", x => x.accessreq_id);
                });

            migrationBuilder.CreateTable(
                name: "jan_employees",
                columns: table => new
                {
                    emp_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    full_name = table.Column<string>(type: "varchar(100)", nullable: false),
                    email_address = table.Column<string>(type: "varchar(255)", nullable: false),
                    phone_number = table.Column<int>(type: "INTEGER", nullable: false),
                    dept_id = table.Column<int>(type: "INTEGER", nullable: false),
                    dept_name = table.Column<string>(type: "varchar(50)", nullable: false),
                    user_role = table.Column<string>(type: "varchar(20)", nullable: false),
                    pwd_hash = table.Column<string>(type: "TEXT", nullable: false),
                    pwd_salt = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_employees", x => x.emp_id);
                });

            migrationBuilder.CreateTable(
                name: "jan_accessitems",
                columns: table => new
                {
                    accessitem_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    accessreq_id = table.Column<int>(type: "INTEGER", nullable: false),
                    folder_path = table.Column<string>(type: "TEXT", nullable: false),
                    access_type = table.Column<int>(type: "INTEGER", nullable: false),
                    confirm_access_type = table.Column<int>(type: "INTEGER", nullable: false),
                    reason = table.Column<string>(type: "TEXT", nullable: false),
                    created_on = table.Column<DateTime>(type: "TEXT", nullable: false),
                    created_by = table.Column<string>(type: "TEXT", nullable: false),
                    modified_on = table.Column<DateTime>(type: "TEXT", nullable: true),
                    modified_by = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_accessitems", x => x.accessitem_id);
                    table.ForeignKey(
                        name: "FK_jan_accessitems_jan_accessrequest_accessreq_id",
                        column: x => x.accessreq_id,
                        principalTable: "jan_accessrequest",
                        principalColumn: "accessreq_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_jan_accessitems_accessreq_id",
                table: "jan_accessitems",
                column: "accessreq_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "jan_accessapproval");

            migrationBuilder.DropTable(
                name: "jan_accessitems");

            migrationBuilder.DropTable(
                name: "jan_accessreqaudit");

            migrationBuilder.DropTable(
                name: "jan_employees");

            migrationBuilder.DropTable(
                name: "jan_accessrequest");
        }
    }
}
