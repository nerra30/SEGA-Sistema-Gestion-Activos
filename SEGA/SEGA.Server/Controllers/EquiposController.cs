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

        public EquiposController(SegaContext contexto)
        {
            _contexto = contexto;
        }

        // 1. OBTENER TODOS LOS EQUIPOS (GET: api/equipos) - Devuelve una lista de equipos con su categoría incluida
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Equipo>>> GetEquipos()
        {
            // El .Include es vital para que React reciba el nombre de la Categoría y no solo el número (ID)
            return await _contexto.Equipos
                .Include(e => e.Categoria)
                .ToListAsync();
        }

        // 2. CREAR EQUIPO (POST: api/equipos)  - Recibe un equipo desde React y lo guarda en la base de datos
        [HttpPost]
        public async Task<IActionResult> PostEquipo(Equipo equipo)
        {
            // El estado por defecto es 1 (Disponible) según tu base de datos
            _contexto.Equipos.Add(equipo);
            await _contexto.SaveChangesAsync();

            return Ok();
        }

        // 3. EDITAR EQUIPO (PUT: api/equipos/{id})  - Recibe un equipo actualizado desde React y lo guarda en la base de datos
        [HttpPut("{id}")]
        public async Task<IActionResult> PutEquipo(int id, Equipo equipo)
        {
            if (id != equipo.Id) return BadRequest();

            _contexto.Entry(equipo).State = EntityState.Modified;

            try
            {
                await _contexto.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!EquipoExists(id)) return NotFound();
                else throw;
            }

            return Ok();
        }

        // 4. ELIMINAR EQUIPO (DELETE: api/equipos/{id}) - Recibe el ID del equipo a eliminar desde React y lo borra de la base de datos
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEquipo(int id)
        {
            var equipo = await _contexto.Equipos.FindAsync(id);
            if (equipo == null) return NotFound();

            _contexto.Equipos.Remove(equipo);

            try
            {
                await _contexto.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Si da error al borrar, probablemente es porque el equipo tiene préstamos en el historial.
                // React ya tiene un alert() preparado para cuando devolvemos un BadRequest aquí.
                return BadRequest("No se puede eliminar el equipo porque tiene historial de préstamos.");
            }

            return Ok();
        }


        // MÉTODO AUXILIAR PARA VER SI UN EQUIPO EXISTE (USADO EN EL PUT)
        private bool EquipoExists(int id)
        {
            return _contexto.Equipos.Any(e => e.Id == id);
        }
    }
}
