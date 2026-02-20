using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEGA.Server.Datos;
using SEGA.Server.Modelos;

namespace SEGA.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquiposController : ControllerBase
    {
        private readonly SegaContext _contexto;

        // Inyección de dependencias: Aquí recibimos la conexión a la BD
        public EquiposController(SegaContext contexto)
        {
            _contexto = contexto;
        }

        // GET: api/Equipos
        // Este método devuelve la lista de todos los equipos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipo>>> GetEquipos()
        {
            return await _contexto.Equipos.ToListAsync();
        }

        // POST: api/Equipos
        // Este método recibe un JSON y crea un equipo nuevo en la BD
        [HttpPost]
        public async Task<ActionResult<Equipo>> PostEquipo(Equipo equipo)
        {
            _contexto.Equipos.Add(equipo);
            await _contexto.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEquipos), new { id = equipo.Id }, equipo);
        }
    }
}
