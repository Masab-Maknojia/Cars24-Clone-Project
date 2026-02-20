using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WalletController : ControllerBase
{
    private readonly WalletService _walletService;

    public WalletController(WalletService walletService)
    {
        _walletService = walletService;
    }

    [HttpGet("{userId}")]
    public async Task<IActionResult> GetWallet(string userId)
    {
        var user = await _walletService.GetUserWalletAsync(userId);
        if (user == null) return NotFound("User not found");
        
        return Ok(new { 
            Balance = user.WalletBalance, 
            ReferralCode = user.ReferralCode, 
            WalletHistory = user.WalletHistory 
        });
    }

    [HttpPost("credit")]
    public async Task<IActionResult> CreditWallet([FromBody] CreditRequest request)
    {
        await _walletService.CreditWalletAsync(request.UserId, request.Amount, request.Description);
        return Ok(new { message = "Wallet credited successfully" });
    }

    [HttpPost("debit")]
    public async Task<IActionResult> DebitWallet([FromBody] CreditRequest request)
    {
        var success = await _walletService.DebitWalletAsync(request.UserId, request.Amount, request.Description);
        if (!success) return BadRequest("Insufficient balance or user not found");
        
        return Ok(new { message = "Wallet debited successfully" });
    }

    [HttpPost("trigger-referral/{userId}")]
    public async Task<IActionResult> TriggerReferralBonus(string userId)
    {
        try 
        {
            var wallet = await _walletService.GetUserWalletAsync(userId);
            if (wallet != null)
            {
                bool alreadyAwarded = wallet.WalletHistory.Any(h => 
                    h.Description.Contains("Referral") || h.Description.Contains("Welcome"));
                
                if (!alreadyAwarded)
                {
                    await _walletService.AwardReferralBonusAsync(userId);
                    return Ok(new { message = "Referral bonus awarded for first transaction!" });
                }
            }
            return Ok(new { message = "Bonus already claimed or not eligible." });
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to process referral: {ex.Message}");
        }
    }
}

public class CreditRequest
{
    public string UserId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}