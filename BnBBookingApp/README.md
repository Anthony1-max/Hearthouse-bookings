# Hearth House bookings

A small B&B booking application built with React, ASP.NET Core 8, EF Core, SQL Server/Azure SQL, and Stripe Checkout.

## Architecture

- `client/` is the React + TypeScript guest experience. Vite proxies `/api` to the local API and builds the production SPA into the API's `wwwroot` folder.
- `server/BnBBooking.Api/` serves the SPA and exposes the room, reservation, checkout, and payment-webhook endpoints.
- `BookingDbContext` stores rooms, reservations, and provider payment status in SQL Server. The initial migration seeds the room catalog.
- Room listings include Wi-Fi, air conditioning, and dedicated living room amenities. Reservations can add breakfast and/or one-way airport pickup and drop-off; selections and price snapshots are stored with the booking and displayed as separate Stripe Checkout lines.
- The sample catalog contains nine room alternatives, seeded for new databases and added to existing databases by the `AddSixRoomAlternatives` migration.
- Every room has five ordered gallery photos. The `RoomGalleryImages` table stores those photos and the `AddRoomPhotoGalleries` migration seeds them; guests can browse thumbnails, navigate photos with arrow keys, and open a booking from the gallery.
- Add-on pricing is configured in `BookingExtras` in `server/BnBBooking.Api/appsettings.json` (defaults: R180 per guest/night for breakfast and R650 per transfer each way). Adjust these rates for the property before launch.
- Stripe-hosted Checkout collects card details. The application stores only the Stripe Checkout session reference, payment status, amount, and currency.
- `.github/workflows/deploy.yml` builds the combined app, publishes it to Azure App Service, and uploads an idempotent SQL migration script.

Reservations use a 30-minute payment hold. Date overlap checks run inside a serializable database transaction. A random booking token is returned once, stored only as a SHA-256 hash on the server, and required to read that guest's booking. Keep the token private; the browser also keeps it in session storage for the Stripe return trip.

## Run locally

Prerequisites: .NET 8 SDK, Node.js 22.12+ (or 24), npm, and SQL Server LocalDB/Express or another SQL Server instance.

1. In `server/BnBBooking.Api/appsettings.json`, set the `ConnectionStrings:Bookings` value for your local SQL Server.
2. Install the EF CLI once: `dotnet tool install --global dotnet-ef --version 8.0.31`.
3. From the repository root, create/update the local schema:

   ```powershell
   dotnet ef database update --project server/BnBBooking.Api --startup-project server/BnBBooking.Api
   ```

4. Start the API in one terminal:

   ```powershell
   dotnet run --project server/BnBBooking.Api --launch-profile http
   ```

   It listens on `http://localhost:5080`; Swagger is at `/swagger`.

5. Start the React client in another terminal:

   ```powershell
   Set-Location client
   npm ci
   npm run dev
   ```

   Open `http://localhost:5173`.

For local payments, use Stripe test credentials in .NET user-secrets, not in appsettings or source control:

```powershell
dotnet user-secrets init --project server/BnBBooking.Api
dotnet user-secrets set "Stripe:SecretKey" "sk_test_..." --project server/BnBBooking.Api
dotnet user-secrets set "Stripe:WebhookSecret" "whsec_..." --project server/BnBBooking.Api
```

Set up the webhook with Stripe CLI and forward `checkout.session.completed` and `checkout.session.expired` to `http://localhost:5080/api/payments/stripe/webhook`.

If an npm script fails when the workspace is under a Windows path containing `&`, use a temporary drive mapping for the project directory or move the workspace to a path without shell metacharacters. The build script itself invokes local CLIs through Node to avoid this issue.

## Azure deployment

Create an Azure SQL database and a Linux Azure App Service using the .NET 8 runtime. Apply the checked-in EF migration before sending traffic:

```powershell
dotnet ef database update --project server/BnBBooking.Api --startup-project server/BnBBooking.Api
```

Run that command from a machine or runner allowed through the Azure SQL firewall. Alternatively, download and review the `HearthHouse-database-migration` artifact produced by GitHub Actions, then execute its idempotent SQL script against Azure SQL.

Add the following App Service application settings. Prefer a system-assigned managed identity with Azure SQL database permissions over a SQL username/password connection string.

- `ConnectionStrings__Bookings`: Azure SQL connection string (managed identity example: `Server=tcp:<server>.database.windows.net,1433;Database=<database>;Authentication=Active Directory Managed Identity;Encrypt=True;`)
- `AllowedOrigins__0`: the public HTTPS origin of the deployed site
- `PublicAppUrl`: the same public HTTPS origin, used for Stripe return URLs
- `Stripe__SecretKey`: Stripe secret API key, stored as an App Service setting/Key Vault reference
- `Stripe__WebhookSecret`: signing secret for the production Stripe webhook

Configure the Stripe production webhook URL as `https://<app-name>.azurewebsites.net/api/payments/stripe/webhook` and subscribe to `checkout.session.completed` and `checkout.session.expired`.

In GitHub repository settings, add the `AZURE_WEBAPP_NAME` and `AZURE_WEBAPP_PUBLISH_PROFILE` Actions secrets. Push to `main` or run the workflow manually to build, package, and deploy the SPA + API together. The publish profile is a deployment credential; never commit it.

## API outline

- `GET /api/rooms?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD` lists active rooms available for those dates, including amenities.
- `GET /api/booking-options` returns the configured breakfast and airport transfer rates.
- `POST /api/bookings` validates dates and capacity, prices the selected extras on the server, then creates a temporary hold.
- `GET /api/bookings/{id}` requires the `X-Booking-Token` header issued at creation.
- `POST /api/bookings/{id}/checkout` requires the same token and returns a Stripe-hosted Checkout URL.
- `POST /api/payments/stripe/webhook` verifies Stripe's signature before confirming payment.
- `GET /api/health` is a lightweight health check.

The current guest flow supports booking creation and private booking lookup. An authenticated staff console, booking edits/refunds, email notifications, and operational audit tooling are follow-on work before using this as a full property-management system.