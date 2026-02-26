namespace SEGA.Server.Modelos
{
    public enum EstadoEquipoEnum
    {
        Disponible = 1,
        Prestado = 2,
        Mantenimiento = 3,
        Retirado = 4
    }

    public enum EstadoPrestamoEnum
    {
        Pendiente = 1,
        Aprobado = 2,
        Finalizado = 3,
        Rechazado = 4,
        EnRenovacion = 5,
        EnProcesoDevolucion = 6
      
    }
}
