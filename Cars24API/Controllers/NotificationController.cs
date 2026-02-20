using Microsoft.AspNetCore.Mvc;
using Cars24API.Services;
using Cars24API.Models;

namespace Cars24API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;
        private readonly UserService _userService;

        public NotificationController(NotificationService notificationService, UserService userService)
        {
            _notificationService = notificationService;
            _userService = userService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] NotificationRequest request)
        {
            var user = await _userService.GetByIdAsync(request.UserId);
            
            if (user == null) 
                return NotFound($"User with ID {request.UserId} not found.");

            if (string.IsNullOrEmpty(user.FcmToken))
                return BadRequest("This user has not allowed notifications (No FCM Token found).");

            try 
            {
                string messageId = await _notificationService.SendNotificationAsync(
                    user.FcmToken, 
                    request.Title, 
                    request.Body
                );
                
                return Ok(new { message = "Notification sent successfully", id = messageId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Firebase Error: {ex.Message}");
            }
        }

        public class NotificationRequest
        {
            public string UserId { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Body { get; set; } = string.Empty;
        }
    }
}