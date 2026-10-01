namespace BnBBooking.Api.Models;

public static class BookingStatuses
{
    public const string PendingPayment = "pending_payment";
    public const string Confirmed = "confirmed";
    public const string Expired = "expired";
}

public class Room
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal PricePerNight { get; set; }
    public int Capacity { get; set; }
    public string ImageUrl { get; set; } = "";
    public bool IsActive { get; set; } = true;
    public bool HasWifi { get; set; }
    public bool HasAirConditioning { get; set; }
    public bool HasDedicatedLivingRoom { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<RoomGalleryImage> GalleryImages { get; set; } = new List<RoomGalleryImage>();
}

public class RoomGalleryImage
{
    public int Id { get; set; }
    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;
    public int SortOrder { get; set; }
    public string Url { get; set; } = "";
}

public class Booking
{
    public Guid Id { get; set; }
    public int RoomId { get; set; }
    public Room Room { get; set; } = null!;
    public string GuestName { get; set; } = "";
    public string GuestEmail { get; set; } = "";
    public int Guests { get; set; }
    public DateOnly CheckIn { get; set; }
    public DateOnly CheckOut { get; set; }
    public decimal TotalPrice { get; set; }
    public decimal ExtrasTotal { get; set; }
    public decimal BreakfastTotal { get; set; }
    public decimal AirportPickupPrice { get; set; }
    public decimal AirportDropoffPrice { get; set; }
    public bool IncludesBreakfast { get; set; }
    public bool AirportPickup { get; set; }
    public bool AirportDropoff { get; set; }
    public string Status { get; set; } = BookingStatuses.PendingPayment;
    public string AccessTokenHash { get; set; } = "";
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public BookingPayment? Payment { get; set; }
}

public class BookingPayment
{
    public int Id { get; set; }
    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;
    public string Provider { get; set; } = "Stripe";
    public string ProviderSessionId { get; set; } = "";
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "zar";
    public string Status { get; set; } = "pending";
}