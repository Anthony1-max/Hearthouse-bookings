using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BnBBooking.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingExtrasAndRoomAmenities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasAirConditioning",
                table: "Rooms",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasDedicatedLivingRoom",
                table: "Rooms",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasWifi",
                table: "Rooms",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "AirportDropoff",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "AirportDropoffPrice",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "AirportPickup",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "AirportPickupPrice",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "BreakfastTotal",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ExtrasTotal",
                table: "Bookings",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<bool>(
                name: "IncludesBreakfast",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "HasAirConditioning", "HasDedicatedLivingRoom", "HasWifi" },
                values: new object[] { true, true, true });

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "HasAirConditioning", "HasWifi" },
                values: new object[] { true, true });

            migrationBuilder.UpdateData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "HasDedicatedLivingRoom", "HasWifi" },
                values: new object[] { true, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasAirConditioning",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "HasDedicatedLivingRoom",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "HasWifi",
                table: "Rooms");

            migrationBuilder.DropColumn(
                name: "AirportDropoff",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "AirportDropoffPrice",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "AirportPickup",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "AirportPickupPrice",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "BreakfastTotal",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ExtrasTotal",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "IncludesBreakfast",
                table: "Bookings");
        }
    }
}
