using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserAuthController : ControllerBase
{
    private readonly UserService _userService;
    private readonly WalletService _walletService;

    public UserAuthController(UserService userService, WalletService walletService) 
    {
        _userService = userService;
        _walletService = walletService; 
    }

    [HttpPost("signup")]
    public async Task<IActionResult> Signup(User newUser)
    {
        var existingUser = await _userService.GetByEmailAsync(newUser.Email);
        if (existingUser != null)
            return BadRequest("User already exists");

        newUser.ReferralCode = _walletService.GenerateReferralCode();
        
        await _userService.CreateAsync(newUser);

        return Ok(new { message = "User created successfully", userId = newUser.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        var user = await _userService.GetByEmailAsync(loginRequest.Email);
        if (user == null || user.Password != loginRequest.Password)
            return Unauthorized("Invalid credentials");
        return Ok(user);
    }

    [HttpPut("fcm-token")]
    public async Task<IActionResult> UpdateFcmToken([FromBody] FcmTokenRequest request)
    {
        await _userService.UpdateFcmTokenAsync(request.UserId, request.Token);
        return Ok(new { message = "Token updated" });
    }

    [HttpPut("{id:length(24)}/preferences")]
    public async Task<IActionResult> UpdatePreferences(string id, [FromBody] NotificationPreferences prefs)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user is null) return NotFound();

        await _userService.UpdatePreferencesAsync(id, prefs);
        return Ok(new { message = "Preferences updated successfully" });
    }
}

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class FcmTokenRequest
{
    public string UserId { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
}