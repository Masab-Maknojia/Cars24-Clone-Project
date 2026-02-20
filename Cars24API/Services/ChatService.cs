using MongoDB.Driver;
using Cars24API.Models;

namespace Cars24API.Services;

public class ChatService
{
    private readonly IMongoCollection<ChatMessage> _messagesCollection;
    private readonly UserService _userService;
    private readonly NotificationService _notificationService;

    public ChatService(IConfiguration config, UserService userService, NotificationService notificationService)
    {
        var client = new MongoClient(config.GetConnectionString("Cars24DB"));
        var database = client.GetDatabase(config["MongoDB:DatabaseName"]);
        _messagesCollection = database.GetCollection<ChatMessage>("ChatMessages");
        _userService = userService;
        _notificationService = notificationService;
    }

    public async Task SendMessageAsync(ChatMessage message)
    {
        await _messagesCollection.InsertOneAsync(message);

        var receiver = await _userService.GetByIdAsync(message.ReceiverId);
        var sender = await _userService.GetByIdAsync(message.SenderId);

        if (receiver != null && !string.IsNullOrEmpty(receiver.FcmToken) && receiver.Preferences.NewMessages)
        {
            try
            {
                await _notificationService.SendNotificationAsync(
                    receiver.FcmToken,
                    $"New message from {sender?.FullName ?? "User"}",
                    message.Content.Length > 50 ? message.Content.Substring(0, 47) + "..." : message.Content
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Chat notification failed: {ex.Message}");
            }
        }
    }
}