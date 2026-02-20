using MongoDB.Driver;
using Cars24API.Models;

namespace Cars24API.Services;

public class AppointmentService
{
    private readonly IMongoCollection<Appointment> _appointmentsCollection;
    private readonly UserService _userService;
    private readonly NotificationService _notificationService;

    public AppointmentService(IConfiguration config, UserService userService, NotificationService notificationService)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);

        _appointmentsCollection = database.GetCollection<Appointment>("Appointments");
        _userService = userService;
        _notificationService = notificationService;
    }

    public async Task<List<Appointment>> GetAsync() =>
        await _appointmentsCollection.Find(_ => true).ToListAsync();

    public async Task<Appointment?> GetAsync(string id) =>
        await _appointmentsCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<List<Appointment>> GetByUserIdAsync(string userId) =>
        await _appointmentsCollection.Find(x => x.UserId == userId).ToListAsync();

    public async Task CreateAsync(Appointment newAppointment)
    {
        await _appointmentsCollection.InsertOneAsync(newAppointment);

        var user = await _userService.GetByIdAsync(newAppointment.UserId);

        Console.WriteLine($"[DEBUG] Booking for User: {user?.Email ?? "Unknown"}");
        Console.WriteLine($"[DEBUG] FCM Token Present: {!string.IsNullOrEmpty(user?.FcmToken)}");
        
        bool wantsNotification = user?.Preferences?.Appointments ?? true;
        Console.WriteLine($"[DEBUG] User Wants Notification: {wantsNotification}");

        if (user != null && !string.IsNullOrEmpty(user.FcmToken) && wantsNotification)
        {
            try
            {
                await _notificationService.SendNotificationAsync(
                    user.FcmToken,
                    "Appointment Confirmed!",
                    $"Your appointment for {newAppointment.Date} at {newAppointment.Time} has been successfully booked."
                );
                Console.WriteLine("[DEBUG] Notification Sent Successfully to Firebase!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DEBUG] Notification FAILED: {ex.Message}");
            }
        }
        else
        {
            Console.WriteLine("[DEBUG] Notification SKIPPED. Either Token is missing or Preference is OFF.");
        }
    }

    public async Task UpdateAsync(string id, Appointment updatedAppointment) =>
        await _appointmentsCollection.ReplaceOneAsync(x => x.Id == id, updatedAppointment);

    public async Task RemoveAsync(string id) =>
        await _appointmentsCollection.DeleteOneAsync(x => x.Id == id);
}