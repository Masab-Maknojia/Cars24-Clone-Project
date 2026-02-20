using Microsoft.AspNetCore.Mvc;
using Cars24API.Models;
using Cars24API.Services;

namespace Cars24API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CarsController : ControllerBase
{
    private readonly CarService _carService;

    public CarsController(CarService carService)
    {
        _carService = carService;
    }

    [HttpGet]
    public async Task<List<Car>> Get() =>
        await _carService.GetAllAsync();

    [HttpGet("{id}")]
    public async Task<ActionResult<Car>> Get(string id)
    {
        var car = await _carService.GetByIdAsync(id);

        if (car is null)
        {
            return NotFound();
        }

        return car;
    }

    [HttpGet("search")]
    public async Task<List<Car>> Search(
        [FromQuery] string? q,
        [FromQuery] string? fuel,
        [FromQuery] string? transmission,
        [FromQuery] string? bodyType,
        [FromQuery] int? minPrice,
        [FromQuery] int? maxPrice,
        [FromQuery] int? minYear,
        [FromQuery] int? maxKm,
        [FromQuery] string? city)
    {
        return await _carService.SearchAsync(q, fuel, transmission, bodyType, minPrice, maxPrice, minYear, maxKm, city);
    }

    [HttpGet("suggestions")]
    public async Task<List<string>> GetSuggestions([FromQuery] string q)
    {
        return await _carService.GetSuggestionsAsync(q);
    }

    [HttpGet("service-centers")]
    public ActionResult<List<ServiceCenter>> GetServiceCenters([FromQuery] string city)
    {
        return _carService.GetServiceCenters(city);
    }

    [HttpPost]
    public async Task<IActionResult> Post(Car newCar)
    {
        await _carService.CreateAsync(newCar);
        return CreatedAtAction(nameof(Get), new { id = newCar.Id }, newCar);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, Car updatedCar)
    {
        var car = await _carService.GetByIdAsync(id);

        if (car is null)
        {
            return NotFound();
        }

        updatedCar.Id = car.Id;

        await _carService.UpdateAsync(id, updatedCar);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var car = await _carService.GetByIdAsync(id);

        if (car is null)
        {
            return NotFound();
        }

        await _carService.RemoveAsync(id);

        return NoContent();
    }
}