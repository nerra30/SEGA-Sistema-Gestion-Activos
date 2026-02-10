using Microsoft.EntityFrameworkCore;
using SEGA.server.Modelos;

namespace SEGA.server.Datos
{
    public class SegaContext : DbContext
    {
        public SegaContext(DbContextOptions<SegaContext> options) : base(options) { }

        // Esta línea le dice a C# que cree una tabla llamada "Equipos"
        public DbSet<Equipo> Equipos { get; set; }
    }
}
