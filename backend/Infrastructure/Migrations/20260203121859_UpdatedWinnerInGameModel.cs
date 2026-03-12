using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatedWinnerInGameModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WinnerId",
                table: "Games");

            migrationBuilder.AddColumn<List<string>>(
                name: "WinnerIds",
                table: "Games",
                type: "text[]",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WinnerIds",
                table: "Games");

            migrationBuilder.AddColumn<string>(
                name: "WinnerId",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
