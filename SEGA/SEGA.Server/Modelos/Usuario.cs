using System.Text.Json.Serialization;

namespace SEGA.Server.Modelos
{
    public class Usuario
    {
        public int Id { get; set; }
        public string NombreCompleto { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;

        public int RolId { get; set; }

        // Navegación
        public Rol? Rol { get; set; }

        [JsonIgnore]
        public ICollection<Prestamo>? Prestamos { get; set; }
    }
}
