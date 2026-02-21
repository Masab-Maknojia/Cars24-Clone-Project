using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingController : ControllerBase
{
    private readonly BookingService _bookingService;
    private readonly UserService _userService;
    private readonly CarService _carService;

    public class BookingDto
    {
        public required Booking Booking { get; set; }
        public Car? Car { get; set; }
    }

    public BookingController(BookingService bookingService, UserService userService, CarService carService)
    {
        _bookingService = bookingService;
        _userService = userService;
        _carService = carService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromQuery] string userId, [FromBody] Booking booking)
    {
        if (booking == null || string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(booking.CarId))
            return BadRequest("UserId and CarId are required.");

        // 1. Save the new detailed booking
        await _bookingService.CreateAsync(booking);
        
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        if (user.BookingId == null) 
            user.BookingId = new List<string>();
        
        // 2. Map it to the User's profile
        user.BookingId.Add(booking.Id!); 
        
        await _userService.UpdateAsync(user.Id!, user);

        return CreatedAtAction(nameof(GetBookingById), new { id = booking.Id }, booking);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookingById(string id)
    {
        var booking = await _bookingService.GetAsync(id);
        if (booking == null) return NotFound();
        return Ok(booking);
    }

    [HttpGet("user/{userId}/bookings")]
    public async Task<IActionResult> GetBookingsByUserId(string userId)
    {
        var user = await _userService.GetByIdAsync(userId);
        if (user == null) return NotFound("User not found");

        var results = new List<BookingDto>();

        if (user.BookingId != null)
        {
            foreach (var bookingId in user.BookingId)
            {
                var booking = await _bookingService.GetAsync(bookingId);
                
                if (booking != null)
                {
                    var car = await _carService.GetByIdAsync(booking.CarId);
                    results.Add(new BookingDto
                    {
                        Booking = booking,
                        Car = car
                    });
                }
            }
        }
        
        // Put the newest bookings at the top!
        results.Reverse(); 
        return Ok(results);
    }
}