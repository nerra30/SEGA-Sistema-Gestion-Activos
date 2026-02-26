using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEGA.Server.Datos;
using SEGA.Server.Modelos;

namespace SEGA.Server.Controllers
{
    // Esta ruta significa que este controlador responderá a "https://localhost:7164/api/categorias"
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly SegaContext _context;

        // Inyectamos nuestro contexto de base de datos
        public CategoriasController(SegaContext context)
        {
            _context = context;
        }

        // 1. LEER (GET: api/categorias)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            // Va a la base de datos y trae todas las categorías
            return await _context.Categorias.ToListAsync();
        }

        // 2. CREAR (POST: api/categorias)
        [HttpPost]
        public async Task<IActionResult> PostCategoria(Categoria categoria)
        {
            // Entity Framework prepara el INSERT
            _context.Categorias.Add(categoria);
            // Guarda los cambios en SQL
            await _context.SaveChangesAsync();

            return Ok(); // Le dice a React que todo salió bien (Status 200)
        }

        // 3. ACTUALIZAR (PUT: api/categorias/{id})
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCategoria(int id, Categoria categoria)
        {
            if (id != categoria.Id) return BadRequest();

            // Entity Framework prepara el UPDATE
            _context.Entry(categoria).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CategoriaExists(id)) return NotFound();
                else throw;
            }

            return Ok();
        }

        // 4. ELIMINAR (DELETE: api/categorias/{id})
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategoria(int id)
        {
            var categoria = await _context.Categorias.FindAsync(id);
            if (categoria == null) return NotFound();

            // Entity Framework prepara el DELETE
            _context.Categorias.Remove(categoria);
            await _context.SaveChangesAsync();

            return Ok(); // Esto hará que res.ok sea "true" en tu Frontend
        }

        // Función auxiliar para comprobar si existe
        private bool CategoriaExists(int id)
        {
            return _context.Categorias.Any(e => e.Id == id);
        }
    }
}
