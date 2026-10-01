using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BnBBooking.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSixRoomAlternatives : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Description", "HasAirConditioning", "HasWifi", "ImageUrl", "IsActive", "Name", "PricePerNight" },
                values: new object[] { 4, 2, "A bright king room with a vintage writing desk and rose-garden outlook.", true, true, "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=85", true, "The Rose Cottage Room", 205m });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Description", "HasDedicatedLivingRoom", "HasWifi", "ImageUrl", "IsActive", "Name", "PricePerNight" },
                values: new object[] { 5, 2, "A characterful former stable with exposed beams and a private patio.", true, true, "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=85", true, "The Stable Suite", 230m });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Description", "HasAirConditioning", "HasWifi", "ImageUrl", "IsActive", "Name", "PricePerNight" },
                values: new object[] { 6, 2, "Two comfortable beds and open views across the meadow.", true, true, "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85", true, "The Meadow Twin", 215m });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Description", "HasAirConditioning", "HasDedicatedLivingRoom", "HasWifi", "ImageUrl", "IsActive", "Name", "PricePerNight" },
                values: new object[] { 7, 4, "A private entrance, king bedroom, and a separate sitting room.", true, true, true, "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85", true, "The Coach House", 295m });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Description", "HasWifi", "ImageUrl", "IsActive", "Name", "PricePerNight" },
                values: new object[] { 8, 2, "A restful queen room with soft morning light and a terrace nearby.", true, "https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=1200&q=85", true, "The Bluebell Room", 205m });

            migrationBuilder.InsertData(
                table: "Rooms",
                columns: new[] { "Id", "Capacity", "Description", "HasAirConditioning", "HasDedicatedLivingRoom", "HasWifi", "ImageUrl", "IsActive", "Name", "PricePerNight" },
                values: new object[] { 9, 4, "Two sleeping areas and a generous lounge for an easy family stay.", true, true, true, "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85", true, "The Family Garden Suite", 335m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 8);

            migrationBuilder.DeleteData(
                table: "Rooms",
                keyColumn: "Id",
                keyValue: 9);
        }
    }
}
