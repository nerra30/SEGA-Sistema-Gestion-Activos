using System.ComponentModel.DataAnnotations.Schema;

namespace SEGA.Server.Modelos
{
    public class Prestamo
    {
        public int Id { get; set; }

        public int EquipoId { get; set; }
        public int UsuarioId { get; set; }

        public DateTime FechaSolicitud { get; set; } = DateTime.Now;
        public DateTime FechaLimite { get; set; }
        public DateTime? FechaDevolucion { get; set; }

        public int Estado { get; set; } = 1;

        // En SQL se llama Observaciones, pero C# y React lo verán como NotaDevolucion
        [Column("Observaciones")]
        public string? NotaDevolucion { get; set; }

        // React necesita "diasSolicitados" para mostrarlo en el frontend, 
        // pero no existe en SQL. Lo calculamos en tiempo real con [NotMapped].
        [NotMapped]
        public int DiasSolicitados
        {
            get
            {
                return (FechaLimite - FechaSolicitud).Days;
            }
            set { /* Necesario para que el JSON lo pueda recibir, aunque no lo guardemos directo en BD */ }
        }

        // Navegación
        public Equipo? Equipo { get; set; }
        public Usuario? Usuario { get; set; }
    }
}