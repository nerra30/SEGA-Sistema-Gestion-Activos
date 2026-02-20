using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEGA.Server.Datos;
using SEGA.Server.Modelos;

namespace SEGA.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrestamosController : ControllerBase
    {
        private readonly SegaContext _contexto;

        public PrestamosController(SegaContext contexto)
        {
            _contexto = contexto;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prestamo>>> ObtenerPrestamos()
        {
            return await _contexto.Prestamos
                .Include(p => p.Equipo)  // Traer datos del equipo
                .Include(p => p.Usuario) // NUEVO: Traer datos del usuario (Nombre, Email)
                .ToListAsync();
        }

        // POST: api/Prestamos
        // Este método recibe la solicitud desde React
        [HttpPost]
        public async Task<ActionResult<Prestamo>> SolicitarPrestamo(Prestamo prestamo)
        {
            // 1. Buscamos si el equipo realmente existe en la BD
            var equipo = await _contexto.Equipos.FindAsync(prestamo.EquipoId);

            if (equipo == null)
            {
                return NotFound("El equipo no existe.");
            }

            // 2. Validamos que el equipo esté "Disponible" (Estado 1)
            if (equipo.Estado != EstadoEquipoEnum.Disponible)
            {
                return BadRequest("El equipo ya está ocupado, no se puede prestar.");
            }

            // 3. Rellenamos los datos automáticos del préstamo
            prestamo.FechaSolicitud = DateTime.Now;
            prestamo.Estado = EstadoPrestamoEnum.Pendiente; // O Aprobado si prefieres

            // 4. Guardamos la solicitud de préstamo
            _contexto.Prestamos.Add(prestamo);

            // 5. Actualizamos el estado del equipo a "Prestado" (2)
            // Esto hace que en la tabla de React cambie de color verde a naranja automáticamente
            equipo.Estado = EstadoEquipoEnum.Prestado;

            // 6. Guardamos TODOS los cambios en la base de datos
            await _contexto.SaveChangesAsync();

            return CreatedAtAction(nameof(SolicitarPrestamo), new { id = prestamo.Id }, prestamo);
        }
    }
}
