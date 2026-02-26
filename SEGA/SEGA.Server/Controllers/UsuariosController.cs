using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SEGA.Server.Datos;
using SEGA.Server.Modelos;

namespace SEGA.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly SegaContext _context;

        public UsuariosController(SegaContext context)
        {
            _context = context;
        }

        // GET: api/usuarios (¡Este es el que necesita el Login para dejarte entrar!)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // POST: api/usuarios (Para crear usuarios en el CRUD)
        [HttpPost]
        public async Task<IActionResult> PostUsuario(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // PUT: api/usuarios/{id} (Para editar)
        [HttpPut("{id}")]
        public async Task<IActionResult> PutUsuario(int id, Usuario usuario)
        {
            if (id != usuario.Id) return BadRequest();

            _context.Entry(usuario).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok();
        }

        // DELETE: api/usuarios/{id} (Para eliminar)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _context.Usuarios.FindAsync(id);
            if (usuario == null) return NotFound();

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}