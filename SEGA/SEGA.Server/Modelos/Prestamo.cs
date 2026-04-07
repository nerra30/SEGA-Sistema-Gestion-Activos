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

        [Column("Observaciones")]
        public string? NotaDevolucion { get; set; }

        // Propiedad calculada para mostrar los días solicitados en la renovación
        [NotMapped]
        public int DiasSolicitados
        {
            get
            {
                // Si se pidió renovación, extraemos los días de la nota
                if (Estado == 5 && !string.IsNullOrEmpty(NotaDevolucion) && NotaDevolucion.StartsWith("RENOVACION:"))
                {
                    if (int.TryParse(NotaDevolucion.Split(':')[1], out int diasExtra))
                    {
                        return diasExtra; // Devuelve los días extra que el Gestor debe aprobar
                    }
                }

                // Comportamiento normal: calcula la duración del préstamo original
                return (FechaLimite - FechaSolicitud).Days;
            }
            set { /* Mantenemos el set vacío para que el JSON deserializer no falle */ }
        }

        // Navegación
        public Equipo? Equipo { get; set; }
        public Usuario? Usuario { get; set; }
    }
}