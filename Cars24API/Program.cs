using Cars24API.Models;
using Cars24API.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<MongoDBSettings>(
    builder.Configuration.GetSection("MongoDB"));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<UserService>();
builder.Services.AddSingleton<CarService>();
builder.Services.AddSingleton<AppointmentService>();
builder.Services.AddSingleton<BookingService>();
builder.Services.AddSingleton<MaintenanceService>();
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddSingleton<ChatService>(); 
builder.Services.AddSingleton<PricingService>();
builder.Services.AddSingleton<WalletService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();