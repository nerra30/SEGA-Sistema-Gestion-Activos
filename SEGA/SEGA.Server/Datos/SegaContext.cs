using Microsoft.EntityFrameworkCore;
using SEGA.Server.Modelos;

namespace SEGA.Server.Datos
{
    public class SegaContext : DbContext
    {
        public SegaContext(DbContextOptions<SegaContext> options) : base(options) { }

        public DbSet<Equipo> Equipos { get; set; }

        public DbSet<Prestamo> Prestamos { get; set; }

        public DbSet<Rol> Roles { get; set; }

        public DbSet<Usuario> Usuarios { get; set; }

        public DbSet<Categoria> Categorias { get; set; }
    }
}
