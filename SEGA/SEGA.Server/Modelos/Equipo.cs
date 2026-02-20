using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SEGA.Server.Modelos
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

        public EstadoEquipoEnum Estado { get; set; } = EstadoEquipoEnum.Disponible;

        public int? CategoriaId { get; set; }
        [ForeignKey("CategoriaId")]
        public virtual Categoria? Categoria { get; set; }
    }
}
