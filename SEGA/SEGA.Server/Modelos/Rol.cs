using System.Text.Json.Serialization;

namespace SEGA.Server.Modelos
{
    public class Rol
    {
        public int Id { get; set; }
        public string Nombre { get; set; } = null!;

        // Relación: Un rol tiene muchos usuarios
        [JsonIgnore] // Evita ciclos infinitos al enviar a React
        public ICollection<Usuario>? Usuarios { get; set; }
    }
}
