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
                name: "jan_budget_templates",
                columns: table => new
                {
                    TemplateId = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    Name = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    TemplateJson = table.Column<string>(type: "CLOB", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    CreatedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_budget_templates", x => x.TemplateId);
                });

            migrationBuilder.CreateTable(
                name: "jan_employees",
                columns: table => new
                {
                    emp_id = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    full_name = table.Column<string>(type: "varchar(100)", nullable: false),
                    email_address = table.Column<string>(type: "varchar(255)", nullable: false),
                    phone_number = table.Column<long>(type: "NUMBER(19)", nullable: false),
                    dept_id = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    dept_name = table.Column<string>(type: "varchar(50)", nullable: false),
                    user_role = table.Column<string>(type: "varchar(20)", nullable: false),
                    pwd_hash = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    pwd_salt = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    CreatedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_employees", x => x.emp_id);
                });

            migrationBuilder.CreateTable(
                name: "jan_budgets",
                columns: table => new
                {
                    BudgetId = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    EmployeeId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    TemplateId = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    ProjectNumber = table.Column<string>(type: "NVARCHAR2(450)", nullable: false),
                    ProductNo = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    ProjectTitle = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    IsActive = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    CreatedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_budgets", x => x.BudgetId);
                    table.ForeignKey(
                        name: "FK_jan_budgets_jan_budget_templates_TemplateId",
                        column: x => x.TemplateId,
                        principalTable: "jan_budget_templates",
                        principalColumn: "TemplateId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "jan_budget_categories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    BudgetId = table.Column<int>(type: "NUMBER(10)", nullable: true),
                    CategoryName = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    CreatedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_budget_categories", x => x.CategoryId);
                    table.ForeignKey(
                        name: "FK_jan_budget_categories_jan_budgets_BudgetId",
                        column: x => x.BudgetId,
                        principalTable: "jan_budgets",
                        principalColumn: "BudgetId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "jan_budget_items",
                columns: table => new
                {
                    ItemId = table.Column<int>(type: "NUMBER(10)", nullable: false)
                        .Annotation("Oracle:Identity", "START WITH 1 INCREMENT BY 1"),
                    CategoryId = table.Column<int>(type: "NUMBER(10)", nullable: false),
                    ItemName = table.Column<string>(type: "NVARCHAR2(2000)", nullable: false),
                    Planned = table.Column<decimal>(type: "DECIMAL(18,2)", precision: 18, scale: 2, nullable: false),
                    Actual = table.Column<decimal>(type: "DECIMAL(18,2)", precision: 18, scale: 2, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    ModifiedOn = table.Column<DateTime>(type: "TIMESTAMP(7)", nullable: false),
                    CreatedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true),
                    ModifiedBy = table.Column<string>(type: "NVARCHAR2(2000)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_jan_budget_items", x => x.ItemId);
                    table.ForeignKey(
                        name: "FK_jan_budget_items_jan_budget_categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "jan_budget_categories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "jan_budget_templates",
                columns: new[] { "TemplateId", "CreatedBy", "CreatedOn", "ModifiedBy", "ModifiedOn", "Name", "TemplateJson" },
                values: new object[] { 1, "System", new DateTime(2026, 4, 25, 0, 0, 0, 0, DateTimeKind.Utc), "System", new DateTime(2026, 4, 25, 0, 0, 0, 0, DateTimeKind.Utc), "Standard Product Development Template", "[\r\n          { \"category\": \"Product Design\", \"items\": [\"Benchmarking sample\", \"FEA Analysis\", \"CFD Analysis\", \"Design consultancy\", \"Others\"] },\r\n          { \"category\": \"Concept development\", \"items\": [\"Comp.devpt-Concept\", \"Machining components\", \"Plastic - Hand moulds\", \"Rubber moulds\", \"3D printing\", \"RPT\", \"MIM\", \"Jigs & fixtures\", \"Concept testing\"] },\r\n          { \"category\": \"Prototype development\", \"items\": [\"Machining components\", \"Plastic - Inj. moulds\", \"Aluminium - Die casting\", \"Investment casting\", \"Stamping tools\", \"Rubber moulds\", \"Jigs & fixtures\", \"Comp. mfg.\", \"Testing\"] },\r\n          { \"category\": \"Product testing\", \"items\": [\"Testing instruments\", \"Testing fixtures\", \"Certification\", \"Others\"] },\r\n          { \"category\": \"Capital equipments\", \"items\": [\"Testing equipments\", \"Special machines\", \"Others\"] },\r\n          { \"category\": \"Field validation\", \"items\": [\"Product development\"] }\r\n        ]" });

            migrationBuilder.CreateIndex(
                name: "IX_jan_budget_categories_BudgetId",
                table: "jan_budget_categories",
                column: "BudgetId");

            migrationBuilder.CreateIndex(
                name: "IX_jan_budget_items_CategoryId",
                table: "jan_budget_items",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_jan_budgets_ProjectNumber",
                table: "jan_budgets",
                column: "ProjectNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_jan_budgets_TemplateId",
                table: "jan_budgets",
                column: "TemplateId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "jan_budget_items");

            migrationBuilder.DropTable(
                name: "jan_employees");

            migrationBuilder.DropTable(
                name: "jan_budget_categories");

            migrationBuilder.DropTable(
                name: "jan_budgets");

            migrationBuilder.DropTable(
                name: "jan_budget_templates");
        }
    }
}
