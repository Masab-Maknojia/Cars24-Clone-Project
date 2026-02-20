using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly ChatService _chatService;

    public ChatController(ChatService chatService)
    {
        _chatService = chatService;
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(ChatMessage message)
    {
        if (string.IsNullOrEmpty(message.SenderId) || string.IsNullOrEmpty(message.ReceiverId))
        {
            return BadRequest("Sender and Receiver are required.");
        }

        await _chatService.SendMessageAsync(message);

        return Ok(new { status = "Sent", timestamp = DateTime.UtcNow });
    }
}