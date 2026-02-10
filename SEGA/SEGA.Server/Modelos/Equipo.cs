using System.ComponentModel.DataAnnotations;

namespace SEGA.server.Modelos
{
    public class Equipo
    {
        [Key]
        public int Id { get; set; }

        [Required] // Obligatorio
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Serial { get; set; } = string.Empty;

        // Aquí usamos el Enum que creamos arriba
        public EstadoEquipoEnum Estado { get; set; } = EstadoEquipoEnum.Disponible;
    }
}
