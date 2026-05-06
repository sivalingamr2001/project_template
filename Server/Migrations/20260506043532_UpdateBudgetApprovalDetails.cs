using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBudgetApprovalDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "jan_budget_templates",
                keyColumn: "TemplateId",
                keyValue: 1,
                column: "TemplateJson",
                value: "[\r\n          {\r\n            \"category\": \"Product Design\",\r\n            \"items\": [\r\n              { \"name\": \"Benchmarking sample\" },\r\n              { \"name\": \"FEA Analysis\" },\r\n              { \"name\": \"CFD Analysis\" },\r\n              { \"name\": \"Design consultancy\" },\r\n              { \"name\": \"Others\" }\r\n            ]\r\n          },\r\n          {\r\n            \"category\": \"Concept devpt.\",\r\n            \"items\": [\r\n              { \"name\": \"Special raw materials\" },\r\n              { \"name\": \"Plastic - Hand / Injection mould\" },\r\n              { \"name\": \"Rubber mould - Single cavity\" },\r\n              { \"name\": \"3D printing\" },\r\n              { \"name\": \"RPT\" },\r\n              { \"name\": \"MIM\" },\r\n              { \"name\": \"Jigs & fixtures\" },\r\n              { \"name\": \"Manufacturing machines\" },\r\n              { \"name\": \"Testing equipments\" },\r\n              { \"name\": \"Special cutting tools\" },\r\n              { \"name\": \"Concept testing - Functional & other testing\" },\r\n              { \"name\": \"Concept testing - Life testing\" },\r\n              { \"name\": \"FEA/CFD Analysis (External)\" }\r\n            ],\r\n            \"subCategories\": [\r\n              {\r\n                \"name\": \"Concept manufacturing. Qty:\",\r\n                \"items\": [\r\n                  { \"name\": \"Quantity for concept development\" },\r\n                  { \"name\": \"Product M+L for concept development\" }\r\n                ]\r\n              }\r\n            ]\r\n          },\r\n          {\r\n            \"category\": \"Prototype devpt.\",\r\n            \"items\": [\r\n              { \"name\": \"Plastic - Inj. moulds\" },\r\n              { \"name\": \"Aluminium - Die casting\" },\r\n              { \"name\": \"Investment casting\" },\r\n              { \"name\": \"Stamping tools\" },\r\n              { \"name\": \"Rubber moulds\" },\r\n              { \"name\": \"Jigs & fixtures\" },\r\n              { \"name\": \"Manufacturing machines\" },\r\n              { \"name\": \"Testing equipments\" },\r\n              { \"name\": \"Special cutting tools\" },\r\n              { \"name\": \"Prototype testing - Functional & other testing\" },\r\n              { \"name\": \"Prototype testing - Life testing\" },\r\n              { \"name\": \"FEA/CFD Analysis (External)\" }\r\n            ],\r\n            \"subCategories\": [\r\n              {\r\n                \"name\": \"Prototype manufacturing\",\r\n                \"items\": [\r\n                  { \"name\": \"Quantity for prototype development\" },\r\n                  { \"name\": \"Product M+L for prototype development\" }\r\n                ]\r\n              }\r\n            ]\r\n          },\r\n          {\r\n            \"category\": \"Product testing & Measuring Equipment\",\r\n            \"items\": [\r\n              { \"name\": \"Testing instruments\" },\r\n              { \"name\": \"Testing fixtures\" },\r\n              { \"name\": \"Certification\" }\r\n            ]\r\n          },\r\n          {\r\n            \"category\": \"Field validation\",\r\n            \"items\": [\r\n              { \"name\": \"Product development\" }\r\n            ]\r\n          },\r\n          {\r\n            \"category\": \"Indirect cost\",\r\n            \"items\": [\r\n              { \"name\": \"Contingencies Expense\" }\r\n            ]\r\n          }\r\n        ]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "jan_budget_templates",
                keyColumn: "TemplateId",
                keyValue: 1,
                column: "TemplateJson",
                value: "[\r\n          { \"category\": \"Product Design\", \"items\": [\"Benchmarking sample\", \"FEA Analysis\", \"CFD Analysis\", \"Design consultancy\", \"Others\"] },\r\n          { \"category\": \"Concept development\", \"items\": [\"Comp.devpt-Concept\", \"Machining components\", \"Plastic - Hand moulds\", \"Rubber moulds\", \"3D printing\", \"RPT\", \"MIM\", \"Jigs & fixtures\", \"Concept testing\"] },\r\n          { \"category\": \"Prototype development\", \"items\": [\"Machining components\", \"Plastic - Inj. moulds\", \"Aluminium - Die casting\", \"Investment casting\", \"Stamping tools\", \"Rubber moulds\", \"Jigs & fixtures\", \"Comp. mfg.\", \"Testing\"] },\r\n          { \"category\": \"Product testing\", \"items\": [\"Testing instruments\", \"Testing fixtures\", \"Certification\", \"Others\"] },\r\n          { \"category\": \"Capital equipments\", \"items\": [\"Testing equipments\", \"Special machines\", \"Others\"] },\r\n          { \"category\": \"Field validation\", \"items\": [\"Product development\"] }\r\n        ]");
        }
    }
}
