using System.Text.Json.Serialization;

namespace SEGA.Server.Modelos
{
    public class Categoria
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }

        [JsonIgnore]
        public ICollection<Equipo>? Equipos { get; set; }
    }
}