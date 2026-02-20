using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

namespace Cars24API.Services
{
    public class NotificationService
    {
        public NotificationService(IWebHostEnvironment env)
        {
            if (FirebaseApp.DefaultInstance == null)
            {
                var path = Path.Combine(env.ContentRootPath, "firebase-service-account.json");
                FirebaseApp.Create(new AppOptions()
                {
                    Credential = GoogleCredential.FromFile(path)
                });
            }
        }

        public async Task<string> SendNotificationAsync(string token, string title, string body)
        {
            var message = new Message()
            {
                Token = token,
                Notification = new Notification()
                {
                    Title = title,
                    Body = body
                }
            };

            return await FirebaseMessaging.DefaultInstance.SendAsync(message);
        }
    }
}