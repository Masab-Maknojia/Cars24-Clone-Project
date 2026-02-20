using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppointmentController : ControllerBase
{
    private readonly AppointmentService _appointmentService;

    public AppointmentController(AppointmentService appointmentService)
    {
        _appointmentService = appointmentService;
    }

    [HttpGet]
    public async Task<List<Appointment>> Get() =>
        await _appointmentService.GetAsync();

    [HttpGet("{id:length(24)}")]
    public async Task<ActionResult<Appointment>> Get(string id)
    {
        var appointment = await _appointmentService.GetAsync(id);
        if (appointment is null) return NotFound();
        return appointment;
    }

    [HttpGet("user/{userId:length(24)}")]
    public async Task<ActionResult<List<Appointment>>> GetByUser(string userId)
    {
        var appointments = await _appointmentService.GetByUserIdAsync(userId);
        return appointments;
    }

    [HttpPost]
    public async Task<IActionResult> Post(Appointment newAppointment)
    {
        await _appointmentService.CreateAsync(newAppointment);
        return CreatedAtAction(nameof(Get), new { id = newAppointment.Id }, newAppointment);
    }

    [HttpPut("{id:length(24)}")]
    public async Task<IActionResult> Update(string id, Appointment updatedAppointment)
    {
        var appointment = await _appointmentService.GetAsync(id);
        if (appointment is null) return NotFound();

        updatedAppointment.Id = appointment.Id;
        await _appointmentService.UpdateAsync(id, updatedAppointment);
        return NoContent();
    }

    [HttpDelete("{id:length(24)}")]
    public async Task<IActionResult> Delete(string id)
    {
        var appointment = await _appointmentService.GetAsync(id);
        if (appointment is null) return NotFound();

        await _appointmentService.RemoveAsync(id);
        return NoContent();
    }
}