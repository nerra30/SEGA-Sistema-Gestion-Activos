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

        // 1. OBTENER TODOS LOS PRÉSTAMOS (GET: api/prestamos) - Devuelve una lista de préstamos con su equipo y usuario incluidos
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prestamo>>> ObtenerPrestamos()
        {
            return await _contexto.Prestamos
                .Include(p => p.Equipo)
                .Include(p => p.Usuario)
                .ToListAsync();
        }

        // 2. CREAR SOLICITUD DE PRÉSTAMO (POST: api/prestamos) - Recibe una solicitud de préstamo desde React,
        // la guarda en la base de datos y bloquea el equipo temporalmente
        [HttpPost]
        public async Task<ActionResult<Prestamo>> SolicitarPrestamo(Prestamo prestamo)
        {
            var equipo = await _contexto.Equipos.FindAsync(prestamo.EquipoId);
            if (equipo == null) return NotFound("El equipo no existe.");

            if (equipo.Estado != 1) return BadRequest("El equipo ya está ocupado.");

            prestamo.FechaSolicitud = DateTime.Now;
            prestamo.Estado = 1; // 1 = Pendiente
            _contexto.Prestamos.Add(prestamo);

            equipo.Estado = 2; // 2 = Prestado (Bloqueamos el equipo temporalmente)
            await _contexto.SaveChangesAsync();

            return CreatedAtAction(nameof(SolicitarPrestamo), new { id = prestamo.Id }, prestamo);
        }

        // 3. CAMBIAR ESTADO (Aprobar o Rechazar por el Gestor)
        // PUT: api/prestamos/{id}/estado - Recibe el nuevo estado del préstamo desde React y lo actualiza en la base de datos
        [HttpPut("{id}/estado")]
        public async Task<IActionResult> GestionarEstado(int id, [FromBody] CambiarEstadoDto dto)
        {
            var prestamo = await _contexto.Prestamos.FindAsync(id);
            if (prestamo == null) return NotFound("Préstamo no encontrado.");

            prestamo.Estado = dto.Estado;

            if (dto.FechaLimite.HasValue)
            {
                prestamo.FechaLimite = dto.FechaLimite.Value;
            }

            var equipo = await _contexto.Equipos.FindAsync(prestamo.EquipoId);
            if (equipo != null)
            {
                if (dto.Estado == 2) equipo.Estado = 2; // Aprobado -> Prestado
                if (dto.Estado == 4) equipo.Estado = 1; // Rechazado -> Disponible de nuevo
            }

            await _contexto.SaveChangesAsync();
            return Ok();
        }

        // 4. FINALIZAR PRÉSTAMO (Devolución del equipo al Gestor)
        // PUT: api/prestamos/{id}/finalizar - Recibe el estado del equipo al devolverlo (Bueno o Malo) y actualiza el préstamo y el equipo en la base de datos
        [HttpPut("{id}/finalizar")]
        public async Task<IActionResult> FinalizarPrestamo(int id, [FromBody] FinalizarDto dto)
        {
            var prestamo = await _contexto.Prestamos.FindAsync(id);
            if (prestamo == null) return NotFound();

            prestamo.Estado = 3; // 3 = Finalizado
            prestamo.FechaDevolucion = DateTime.Now;

            var equipo = await _contexto.Equipos.FindAsync(prestamo.EquipoId);
            if (equipo != null)
            {
                // Si estadoEquipo = 1 (Bueno) vuelve a Disponible. Si es 3 (Malo), va a Mantenimiento.
                equipo.Estado = dto.EstadoEquipo == 1 ? 1 : 3;
            }

            await _contexto.SaveChangesAsync();
            return Ok();
        }

        // 5. SOLICITAR RENOVACIÓN (El usuario pide más días para el préstamo)
        // PUT: api/prestamos/{id}/renovar
        [HttpPut("{id}/renovar")]
        public async Task<IActionResult> SolicitarRenovacion(int id, [FromBody] RenovarDto dto)
        {
            var prestamo = await _contexto.Prestamos.FindAsync(id);
            if (prestamo == null) return NotFound();

            prestamo.Estado = 5; // 5 = En Renovación

            // Guardamos en NotaDevolucion la cantidad de días que el usuario solicita para la renovación,
            // así el gestor lo verá y decidirá si aprueba o no la renovación (en caso de aprobarla, el gestor actualizará el préstamo con la nueva fecha límite)
            prestamo.NotaDevolucion = $"RENOVACION:{dto.Dias}";

            await _contexto.SaveChangesAsync();
            return Ok();
        }

        // 6. NOTIFICAR DEVOLUCIÓN (El usuario ya devolvió el equipo pero quiere dejar una nota para el gestor, por ejemplo: "El equipo tiene un problema en la pantalla")
        // PUT: api/prestamos/{id}/notificar
        [HttpPut("{id}/notificar")]
        public async Task<IActionResult> NotificarDevolucion(int id, [FromBody] NotificarDto dto)
        {
            var prestamo = await _contexto.Prestamos.FindAsync(id);
            if (prestamo == null) return NotFound();

            prestamo.NotaDevolucion = dto.Nota;
            prestamo.Estado = 6; // en proceso de devolución (el gestor verá la nota y decidirá cuándo finalizar el préstamo)

            await _contexto.SaveChangesAsync();
            return Ok();
        }
    }

    // =====================================================================
    // CLASES DTO (Data Transfer Objects)
    // Sirven para "atrapar" exactamente los JSON que envía React en el api.js
    // =====================================================================
    public class CambiarEstadoDto
    {
        public int Estado { get; set; }
        public DateTime? FechaLimite { get; set; }
    }

    public class FinalizarDto
    {
        public int EstadoEquipo { get; set; }
    }

    public class RenovarDto
    {
        public int Dias { get; set; }
    }

    public class NotificarDto
    {
        public string Nota { get; set; }
    }
}
