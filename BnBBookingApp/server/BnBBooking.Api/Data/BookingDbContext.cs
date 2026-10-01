using BnBBooking.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BnBBooking.Api.Data;

public class BookingDbContext(DbContextOptions<BookingDbContext> options) : DbContext(options)
{
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<RoomGalleryImage> RoomGalleryImages => Set<RoomGalleryImage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingPayment> Payments => Set<BookingPayment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Room>(entity =>
        {
            entity.Property(room => room.PricePerNight).HasPrecision(10, 2);
            entity.Property(room => room.Name).HasMaxLength(120);
            entity.Property(room => room.Description).HasMaxLength(1000);
            entity.Property(room => room.ImageUrl).HasMaxLength(500);
            entity.Property(room => room.HasWifi).HasDefaultValue(false);
            entity.Property(room => room.HasAirConditioning).HasDefaultValue(false);
            entity.Property(room => room.HasDedicatedLivingRoom).HasDefaultValue(false);
            entity.HasData(
                new Room
                {
                    Id = 1,
                    Name = "The Garden Suite",
                    Description = "A quiet ground-floor suite opening onto the walled garden.",
                    PricePerNight = 189,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = true,
                    HasDedicatedLivingRoom = true
                },
                new Room
                {
                    Id = 2,
                    Name = "The Orchard Room",
                    Description = "A sunlit king room with a window seat and orchard views.",
                    PricePerNight = 225,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = true,
                    HasDedicatedLivingRoom = false
                },
                new Room
                {
                    Id = 3,
                    Name = "The Loft",
                    Description = "A generous attic hideaway with space for a small family.",
                    PricePerNight = 268,
                    Capacity = 4,
                    ImageUrl = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = false,
                    HasDedicatedLivingRoom = true
                },
                new Room
                {
                    Id = 4,
                    Name = "The Rose Cottage Room",
                    Description = "A bright king room with a vintage writing desk and rose-garden outlook.",
                    PricePerNight = 205,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = true,
                    HasDedicatedLivingRoom = false
                },
                new Room
                {
                    Id = 5,
                    Name = "The Stable Suite",
                    Description = "A characterful former stable with exposed beams and a private patio.",
                    PricePerNight = 230,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1617104678098-de229db51175?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = false,
                    HasDedicatedLivingRoom = true
                },
                new Room
                {
                    Id = 6,
                    Name = "The Meadow Twin",
                    Description = "Two comfortable beds and open views across the meadow.",
                    PricePerNight = 215,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = true,
                    HasDedicatedLivingRoom = false
                },
                new Room
                {
                    Id = 7,
                    Name = "The Coach House",
                    Description = "A private entrance, king bedroom, and a separate sitting room.",
                    PricePerNight = 295,
                    Capacity = 4,
                    ImageUrl = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = true,
                    HasDedicatedLivingRoom = true
                },
                new Room
                {
                    Id = 8,
                    Name = "The Bluebell Room",
                    Description = "A restful queen room with soft morning light and a terrace nearby.",
                    PricePerNight = 205,
                    Capacity = 2,
                    ImageUrl = "https://images.unsplash.com/photo-1631049035182-249067d7618e?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = false,
                    HasDedicatedLivingRoom = false
                },
                new Room
                {
                    Id = 9,
                    Name = "The Family Garden Suite",
                    Description = "Two sleeping areas and a generous lounge for an easy family stay.",
                    PricePerNight = 335,
                    Capacity = 4,
                    ImageUrl = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
                    HasWifi = true,
                    HasAirConditioning = true,
                    HasDedicatedLivingRoom = true
                });
        });

        modelBuilder.Entity<RoomGalleryImage>(entity =>
        {
            entity.HasKey(image => image.Id);
            entity.Property(image => image.Url).HasMaxLength(500);
            entity.HasIndex(image => new { image.RoomId, image.SortOrder }).IsUnique();
            entity.HasOne(image => image.Room).WithMany(room => room.GalleryImages)
                .HasForeignKey(image => image.RoomId);
            entity.HasData(CreateRoomGallerySeeds());
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(booking => booking.Id);
            entity.Property(booking => booking.GuestName).HasMaxLength(120);
            entity.Property(booking => booking.GuestEmail).HasMaxLength(254);
            entity.Property(booking => booking.AccessTokenHash).HasMaxLength(64);
            entity.Property(booking => booking.Status).HasMaxLength(32);
            entity.Property(booking => booking.TotalPrice).HasPrecision(10, 2);
            entity.Property(booking => booking.ExtrasTotal).HasPrecision(10, 2).HasDefaultValue(0m);
            entity.Property(booking => booking.BreakfastTotal).HasPrecision(10, 2).HasDefaultValue(0m);
            entity.Property(booking => booking.AirportPickupPrice).HasPrecision(10, 2).HasDefaultValue(0m);
            entity.Property(booking => booking.AirportDropoffPrice).HasPrecision(10, 2).HasDefaultValue(0m);
            entity.HasIndex(booking => new { booking.RoomId, booking.CheckIn, booking.CheckOut });
            entity.HasOne(booking => booking.Room).WithMany(room => room.Bookings)
                .HasForeignKey(booking => booking.RoomId);
        });

        modelBuilder.Entity<BookingPayment>(entity =>
        {
            entity.HasKey(payment => payment.Id);
            entity.HasIndex(payment => payment.BookingId).IsUnique();
            entity.HasIndex(payment => payment.ProviderSessionId).IsUnique();
            entity.Property(payment => payment.Amount).HasPrecision(10, 2);
            entity.Property(payment => payment.Currency).HasMaxLength(3);
            entity.Property(payment => payment.Status).HasMaxLength(32);
            entity.HasOne(payment => payment.Booking).WithOne(booking => booking.Payment)
                .HasForeignKey<BookingPayment>(payment => payment.BookingId);
        });
    }

    private static RoomGalleryImage[] CreateRoomGallerySeeds()
    {
        string[][] photoIds =
        [
            ["photo-1611892440504-42a792e24d32", "photo-1616594039964-ae9021a400a0", "photo-1616486338812-3dadae4b4ace", "photo-1618221195710-dd6b41faaea6", "photo-1615874959474-d609969a20ed"],
            ["photo-1616594039964-ae9021a400a0", "photo-1618220179428-22790b461013", "photo-1617104678098-de229db51175", "photo-1631049307264-da0ec9d70304", "photo-1611892440504-42a792e24d32"],
            ["photo-1616486338812-3dadae4b4ace", "photo-1618221195710-dd6b41faaea6", "photo-1615874959474-d609969a20ed", "photo-1566665797739-1674de7a421a", "photo-1616594039964-ae9021a400a0"],
            ["photo-1615874959474-d609969a20ed", "photo-1618220179428-22790b461013", "photo-1618221195710-dd6b41faaea6", "photo-1582719478250-c89cae4dc85b", "photo-1611892440504-42a792e24d32"],
            ["photo-1617104678098-de229db51175", "photo-1616486338812-3dadae4b4ace", "photo-1564013799919-ab600027ffc6", "photo-1618220179428-22790b461013", "photo-1631049307264-da0ec9d70304"],
            ["photo-1631049307264-da0ec9d70304", "photo-1631049035182-249067d7618e", "photo-1616594039964-ae9021a400a0", "photo-1578683010236-d716f9a3f461", "photo-1615874959474-d609969a20ed"],
            ["photo-1618221195710-dd6b41faaea6", "photo-1618220179428-22790b461013", "photo-1616486029423-aaa4789e8c9a", "photo-1582719478250-c89cae4dc85b", "photo-1611892440504-42a792e24d32"],
            ["photo-1631049035182-249067d7618e", "photo-1578683010236-d716f9a3f461", "photo-1616594039964-ae9021a400a0", "photo-1618221195710-dd6b41faaea6", "photo-1566665797739-1674de7a421a"],
            ["photo-1590490360182-c33d57733427", "photo-1564013799919-ab600027ffc6", "photo-1616486338812-3dadae4b4ace", "photo-1582719478250-c89cae4dc85b", "photo-1618220179428-22790b461013"]
        ];

        return photoIds.SelectMany((gallery, roomIndex) => gallery.Select((photoId, imageIndex) => new RoomGalleryImage
        {
            Id = (roomIndex + 1) * 10 + imageIndex + 1,
            RoomId = roomIndex + 1,
            SortOrder = imageIndex,
            Url = $"https://images.unsplash.com/{photoId}?auto=format&fit=crop&w=1400&q=85"
        })).ToArray();
    }
}