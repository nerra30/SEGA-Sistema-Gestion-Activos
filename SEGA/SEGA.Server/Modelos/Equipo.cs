using System.Text.Json.Serialization;

namespace SEGA.Server.Modelos
{
    public class Equipo
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string Serial { get; set; } = null!;
        public int Estado { get; set; } = 1;

        public int? CategoriaId { get; set; }

        // Navegación
        public Categoria? Categoria { get; set; }

        [JsonIgnore]
        public ICollection<Prestamo>? Prestamos { get; set; }
    }
}
