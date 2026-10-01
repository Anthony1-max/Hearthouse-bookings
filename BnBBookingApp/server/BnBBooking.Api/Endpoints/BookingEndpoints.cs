using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Text;
using BnBBooking.Api.Data;
using BnBBooking.Api.Models;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;

namespace BnBBooking.Api.Endpoints;

public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this WebApplication app)
    {
        app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

        app.MapGet("/api/rooms", async (
            DateOnly? checkIn,
            DateOnly? checkOut,
            BookingDbContext db,
            CancellationToken cancellationToken) =>
        {
            if (checkIn.HasValue != checkOut.HasValue ||
                (checkIn.HasValue && checkOut <= checkIn))
            {
                return Results.BadRequest(new { error = "Provide a valid check-in and check-out date." });
            }

            var rooms = db.Rooms.AsNoTracking().Where(room => room.IsActive);
            if (checkIn.HasValue && checkOut.HasValue)
            {
                var now = DateTime.UtcNow;
                rooms = rooms.Where(room => !room.Bookings.Any(booking =>
                    booking.CheckIn < checkOut.Value &&
                    booking.CheckOut > checkIn.Value &&
                    (booking.Status == BookingStatuses.Confirmed ||
                     (booking.Status == BookingStatuses.PendingPayment && booking.ExpiresAtUtc > now))));
            }

            return Results.Ok(await rooms
                .OrderBy(room => room.PricePerNight)
                .Select(room => new RoomResponse(room.Id, room.Name, room.Description, room.PricePerNight,
                    room.Capacity, room.ImageUrl, room.HasWifi, room.HasAirConditioning,
                    room.HasDedicatedLivingRoom,
                    room.GalleryImages.OrderBy(image => image.SortOrder).Select(image => image.Url).ToList()))
                .ToListAsync(cancellationToken));
        });

        app.MapGet("/api/booking-options", (IConfiguration configuration) =>
            Results.Ok(new BookingOptionsResponse(
                configuration.GetValue<decimal>("BookingExtras:BreakfastPerGuestPerNight", 180m),
                configuration.GetValue<decimal>("BookingExtras:AirportPickup", 650m),
                configuration.GetValue<decimal>("BookingExtras:AirportDropoff", 650m))));

        app.MapPost("/api/bookings", async (
            CreateBookingRequest request,
            BookingDbContext db,
            IConfiguration configuration,
            CancellationToken cancellationToken) =>
        {
            var validation = ValidateBooking(request);
            if (validation is not null)
            {
                return Results.BadRequest(new { error = validation });
            }

            await using var transaction = await db.Database.BeginTransactionAsync(
                System.Data.IsolationLevel.Serializable, cancellationToken);

            var room = await db.Rooms.SingleOrDefaultAsync(
                item => item.Id == request.RoomId && item.IsActive, cancellationToken);
            if (room is null)
            {
                return Results.NotFound(new { error = "That room is not available." });
            }

            if (request.Guests > room.Capacity)
            {
                return Results.BadRequest(new { error = "The guest count exceeds this room's capacity." });
            }

            var now = DateTime.UtcNow;
            var hasConflict = await db.Bookings.AnyAsync(booking =>
                booking.RoomId == room.Id &&
                booking.CheckIn < request.CheckOut &&
                booking.CheckOut > request.CheckIn &&
                (booking.Status == BookingStatuses.Confirmed ||
                 (booking.Status == BookingStatuses.PendingPayment && booking.ExpiresAtUtc > now)),
                cancellationToken);

            if (hasConflict)
            {
                return Results.Conflict(new { error = "Those dates have just been booked. Please choose another stay." });
            }

            var accessToken = CreateAccessToken();
            var nights = request.CheckOut.DayNumber - request.CheckIn.DayNumber;
            var roomSubtotal = room.PricePerNight * nights;
            var breakfastTotal = request.AddBreakfast
                ? request.Guests * nights * configuration.GetValue<decimal>("BookingExtras:BreakfastPerGuestPerNight", 180m)
                : 0m;
            var pickupPrice = request.AirportPickup
                ? configuration.GetValue<decimal>("BookingExtras:AirportPickup", 650m)
                : 0m;
            var dropoffPrice = request.AirportDropoff
                ? configuration.GetValue<decimal>("BookingExtras:AirportDropoff", 650m)
                : 0m;
            var extrasTotal = breakfastTotal + pickupPrice + dropoffPrice;
            var booking = new Booking
            {
                Id = Guid.NewGuid(),
                RoomId = room.Id,
                GuestName = request.GuestName.Trim(),
                GuestEmail = request.GuestEmail.Trim(),
                Guests = request.Guests,
                CheckIn = request.CheckIn,
                CheckOut = request.CheckOut,
                TotalPrice = roomSubtotal + extrasTotal,
                ExtrasTotal = extrasTotal,
                BreakfastTotal = breakfastTotal,
                AirportPickupPrice = pickupPrice,
                AirportDropoffPrice = dropoffPrice,
                IncludesBreakfast = request.AddBreakfast,
                AirportPickup = request.AirportPickup,
                AirportDropoff = request.AirportDropoff,
                Status = BookingStatuses.PendingPayment,
                AccessTokenHash = HashToken(accessToken),
                ExpiresAtUtc = now.AddMinutes(30),
                CreatedAtUtc = now
            };

            db.Bookings.Add(booking);
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return Results.Created($"/api/bookings/{booking.Id}", new BookingCreatedResponse(
                booking.Id, accessToken, booking.Status, roomSubtotal, booking.ExtrasTotal,
                booking.TotalPrice, nights, booking.ExpiresAtUtc));
        });

        app.MapGet("/api/bookings/{id:guid}", async (
            Guid id,
            HttpRequest request,
            BookingDbContext db,
            CancellationToken cancellationToken) =>
        {
            var booking = await db.Bookings.AsNoTracking()
                .Include(item => item.Room)
                .Include(item => item.Payment)
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);

            if (booking is null)
            {
                return Results.NotFound();
            }

            if (!HasBookingAccess(booking, request.Headers["X-Booking-Token"].ToString()))
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new BookingResponse(booking.Id, booking.Room.Name, booking.GuestName,
                booking.GuestEmail, booking.Guests, booking.CheckIn, booking.CheckOut, booking.TotalPrice,
                booking.TotalPrice - booking.ExtrasTotal, booking.ExtrasTotal,
                booking.BreakfastTotal, booking.AirportPickupPrice, booking.AirportDropoffPrice,
                booking.IncludesBreakfast, booking.AirportPickup, booking.AirportDropoff,
                booking.Room.HasWifi, booking.Room.HasAirConditioning, booking.Room.HasDedicatedLivingRoom,
                booking.Status, booking.Payment?.Status ?? "unpaid"));
        });

        app.MapPost("/api/bookings/{id:guid}/checkout", CreateCheckoutSession);
        app.MapPost("/api/payments/stripe/webhook", HandleStripeWebhook);
    }

    private static async Task<IResult> CreateCheckoutSession(
        Guid id,
        HttpRequest request,
        BookingDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var secretKey = configuration["Stripe:SecretKey"];
        var publicAppUrl = configuration["PublicAppUrl"]?.TrimEnd('/');
        if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(publicAppUrl))
        {
            return Results.Problem("Online checkout is not configured yet.", statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        var booking = await db.Bookings.Include(item => item.Room).Include(item => item.Payment)
            .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (booking is null)
        {
            return Results.NotFound();
        }

        if (!HasBookingAccess(booking, request.Headers["X-Booking-Token"].ToString()))
        {
            return Results.Unauthorized();
        }

        if (booking.Status != BookingStatuses.PendingPayment || booking.ExpiresAtUtc <= DateTime.UtcNow)
        {
            return Results.Conflict(new { error = "This booking is no longer awaiting payment." });
        }

        var service = new SessionService(new StripeClient(secretKey));
        if (!string.IsNullOrWhiteSpace(booking.Payment?.ProviderSessionId))
        {
            var existingSession = await service.GetAsync(booking.Payment.ProviderSessionId,
                cancellationToken: cancellationToken);
            if (existingSession.Status == "open")
            {
                return Results.Ok(new { checkoutUrl = existingSession.Url });
            }

            return Results.Conflict(new { error = "This payment session has already been completed or expired." });
        }

        var nights = booking.CheckOut.DayNumber - booking.CheckIn.DayNumber;
        var lineItems = new List<SessionLineItemOptions>
        {
            CreateLineItem(
                $"{booking.Room.Name} · {booking.CheckIn:MMM d}–{booking.CheckOut:MMM d}",
                booking.TotalPrice - booking.ExtrasTotal)
        };
        if (booking.BreakfastTotal > 0)
        {
            lineItems.Add(CreateLineItem($"Breakfast · {booking.Guests} guests · {nights} nights", booking.BreakfastTotal));
        }
        if (booking.AirportPickupPrice > 0)
        {
            lineItems.Add(CreateLineItem("Airport pickup · airport to Hearth House", booking.AirportPickupPrice));
        }
        if (booking.AirportDropoffPrice > 0)
        {
            lineItems.Add(CreateLineItem("Airport drop-off · Hearth House to airport", booking.AirportDropoffPrice));
        }

        var session = await service.CreateAsync(new SessionCreateOptions
        {
            Mode = "payment",
            ClientReferenceId = booking.Id.ToString(),
            CustomerEmail = booking.GuestEmail,
            SuccessUrl = $"{publicAppUrl}/booking/{booking.Id}?payment=success",
            CancelUrl = $"{publicAppUrl}/booking/{booking.Id}?payment=cancelled",
            ExpiresAt = booking.ExpiresAtUtc,
            Metadata = new Dictionary<string, string> { ["bookingId"] = booking.Id.ToString() },
            LineItems = lineItems
        }, new RequestOptions { IdempotencyKey = $"booking-{booking.Id}" }, cancellationToken);

        booking.Payment ??= new BookingPayment { BookingId = booking.Id };
        booking.Payment.ProviderSessionId = session.Id;
        booking.Payment.Amount = booking.TotalPrice;
        booking.Payment.Currency = "zar";
        booking.Payment.Status = "pending";
        await db.SaveChangesAsync(cancellationToken);

        return Results.Ok(new { checkoutUrl = session.Url });
    }

    private static SessionLineItemOptions CreateLineItem(string name, decimal amount) => new()
    {
        Quantity = 1,
        PriceData = new SessionLineItemPriceDataOptions
        {
            Currency = "zar",
            UnitAmount = (long)(amount * 100),
            ProductData = new SessionLineItemPriceDataProductDataOptions { Name = name }
        }
    };

    private static async Task<IResult> HandleStripeWebhook(
        HttpRequest request,
        BookingDbContext db,
        IConfiguration configuration,
        CancellationToken cancellationToken)
    {
        var webhookSecret = configuration["Stripe:WebhookSecret"];
        if (string.IsNullOrWhiteSpace(webhookSecret))
        {
            return Results.Problem("Payment webhooks are not configured.", statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        using var reader = new StreamReader(request.Body);
        var payload = await reader.ReadToEndAsync(cancellationToken);
        Stripe.Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                payload, request.Headers["Stripe-Signature"], webhookSecret);
        }
        catch (StripeException)
        {
            return Results.BadRequest();
        }

        if (stripeEvent.Data.Object is not Stripe.Checkout.Session session ||
            string.IsNullOrWhiteSpace(session.ClientReferenceId) ||
            !Guid.TryParse(session.ClientReferenceId, out var bookingId))
        {
            return Results.Ok();
        }

        var booking = await db.Bookings.Include(item => item.Payment)
            .SingleOrDefaultAsync(item => item.Id == bookingId, cancellationToken);
        if (booking?.Payment?.ProviderSessionId != session.Id)
        {
            return Results.Ok();
        }

        if (stripeEvent.Type == "checkout.session.completed" && session.PaymentStatus == "paid")
        {
            if (booking.Status == BookingStatuses.Confirmed && booking.Payment.Status == "paid")
            {
                return Results.Ok();
            }

            if (booking.Status != BookingStatuses.PendingPayment ||
                session.Currency != "zar" ||
                session.AmountTotal != (long)(booking.TotalPrice * 100))
            {
                return Results.BadRequest();
            }

            booking.Payment.Status = "paid";
            booking.Status = BookingStatuses.Confirmed;
            await db.SaveChangesAsync(cancellationToken);
        }
        else if (stripeEvent.Type == "checkout.session.expired" && booking.Status == BookingStatuses.PendingPayment)
        {
            booking.Payment.Status = "expired";
            booking.Status = BookingStatuses.Expired;
            await db.SaveChangesAsync(cancellationToken);
        }

        return Results.Ok();
    }

    private static string? ValidateBooking(CreateBookingRequest request)
    {
        if (request.RoomId <= 0 || request.Guests <= 0 || string.IsNullOrWhiteSpace(request.GuestName) ||
            request.GuestName.Length > 120 || !new EmailAddressAttribute().IsValid(request.GuestEmail) ||
            request.GuestEmail.Length > 254)
        {
            return "Enter a valid room, guest name, email address, and guest count.";
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        if (request.CheckIn < today || request.CheckOut <= request.CheckIn ||
            request.CheckOut.DayNumber - request.CheckIn.DayNumber > 30)
        {
            return "Choose dates from today onward for a stay of 1 to 30 nights.";
        }

        return null;
    }

    private static string CreateAccessToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');

    private static string HashToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private static bool HasBookingAccess(Booking booking, string suppliedToken)
    {
        if (string.IsNullOrWhiteSpace(suppliedToken))
        {
            return false;
        }

        var expected = Convert.FromHexString(booking.AccessTokenHash);
        var supplied = SHA256.HashData(Encoding.UTF8.GetBytes(suppliedToken));
        return CryptographicOperations.FixedTimeEquals(expected, supplied);
    }
}

public record CreateBookingRequest(
    int RoomId,
    string GuestName,
    string GuestEmail,
    int Guests,
    DateOnly CheckIn,
    DateOnly CheckOut,
    bool AddBreakfast = false,
    bool AirportPickup = false,
    bool AirportDropoff = false);

public record RoomResponse(
    int Id,
    string Name,
    string Description,
    decimal PricePerNight,
    int Capacity,
    string ImageUrl,
    bool HasWifi,
    bool HasAirConditioning,
    bool HasDedicatedLivingRoom,
    IReadOnlyList<string> ImageUrls);

public record BookingOptionsResponse(
    decimal BreakfastPerGuestPerNight,
    decimal AirportPickup,
    decimal AirportDropoff);

public record BookingCreatedResponse(
    Guid BookingId,
    string BookingToken,
    string Status,
    decimal RoomSubtotal,
    decimal ExtrasTotal,
    decimal TotalPrice,
    int Nights,
    DateTime ExpiresAtUtc);

public record BookingResponse(
    Guid Id,
    string RoomName,
    string GuestName,
    string GuestEmail,
    int Guests,
    DateOnly CheckIn,
    DateOnly CheckOut,
    decimal TotalPrice,
    decimal RoomSubtotal,
    decimal ExtrasTotal,
    decimal BreakfastTotal,
    decimal AirportPickupPrice,
    decimal AirportDropoffPrice,
    bool IncludesBreakfast,
    bool AirportPickup,
    bool AirportDropoff,
    bool HasWifi,
    bool HasAirConditioning,
    bool HasDedicatedLivingRoom,
    string Status,
    string PaymentStatus);