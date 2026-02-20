using SEGA.Server.Modelos;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEGA.Server.Modelos
{
    public class Prestamo
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EquipoId { get; set; } // Clave foránea (El ID del equipo)
        public int UsuarioId { get; set; }

        public DateTime FechaSolicitud { get; set; } = DateTime.Now;

        public DateTime FechaLimite { get; set; }

        public DateTime? FechaDevolucion { get; set; } // Puede ser nulo si no se ha definido

        public EstadoPrestamoEnum Estado { get; set; } = EstadoPrestamoEnum.Pendiente;

        // Relación virtual (Para que Entity Framework entienda la conexión)
        [ForeignKey("EquipoId")]
        public virtual Equipo? Equipo { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }
    }
}