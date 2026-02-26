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

        // 1. OBTENER TODOS LOS PRÉSTAMOS
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Prestamo>>> ObtenerPrestamos()
        {
            return await _contexto.Prestamos
                .Include(p => p.Equipo)
                .Include(p => p.Usuario)
                .ToListAsync();
        }

        // 2. CREAR SOLICITUD DE PRÉSTAMO
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
        // PUT: api/prestamos/{id}/estado
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
        // PUT: api/prestamos/{id}/finalizar
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

        // 5. SOLICITAR RENOVACIÓN (El alumno pide más tiempo)
        // PUT: api/prestamos/{id}/renovar
        [HttpPut("{id}/renovar")]
        public async Task<IActionResult> SolicitarRenovacion(int id, [FromBody] RenovarDto dto)
        {
            var prestamo = await _contexto.Prestamos.FindAsync(id);
            if (prestamo == null) return NotFound();

            prestamo.Estado = 5; // 5 = En Renovación

            // TRUCO EXCELENTE: Como no guardamos los "días solicitados" en la BD para no alterar tu diseño SQL,
            // guardamos la petición en la nota para que el gestor lo lea.
            prestamo.NotaDevolucion = $"⚠️ SOLICITA RENOVACIÓN POR {dto.Dias} DÍAS EXTRA.";

            await _contexto.SaveChangesAsync();
            return Ok();
        }

        // 6. NOTIFICAR DEVOLUCIÓN (El alumno avisa que dejó el equipo)
        // PUT: api/prestamos/{id}/notificar
        [HttpPut("{id}/notificar")]
        public async Task<IActionResult> NotificarDevolucion(int id, [FromBody] NotificarDto dto)
        {
            var prestamo = await _contexto.Prestamos.FindAsync(id);
            if (prestamo == null) return NotFound();

            prestamo.NotaDevolucion = dto.Nota;

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
