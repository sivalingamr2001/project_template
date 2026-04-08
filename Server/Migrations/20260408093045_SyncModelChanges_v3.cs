using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class SyncModelChanges_v3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AccessRequestEntityAccessReqId",
                table: "jan_accessitems",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_jan_accessitems_AccessRequestEntityAccessReqId",
                table: "jan_accessitems",
                column: "AccessRequestEntityAccessReqId");

            migrationBuilder.AddForeignKey(
                name: "FK_jan_accessitems_jan_accessrequest_AccessRequestEntityAccessReqId",
                table: "jan_accessitems",
                column: "AccessRequestEntityAccessReqId",
                principalTable: "jan_accessrequest",
                principalColumn: "accessreq_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_jan_accessitems_jan_accessrequest_AccessRequestEntityAccessReqId",
                table: "jan_accessitems");

            migrationBuilder.DropIndex(
                name: "IX_jan_accessitems_AccessRequestEntityAccessReqId",
                table: "jan_accessitems");

            migrationBuilder.DropColumn(
                name: "AccessRequestEntityAccessReqId",
                table: "jan_accessitems");
        }
    }
}
