namespace SEGA.Server.Modelos
{
    public enum EstadoEquipoEnum
    {
        Disponible = 1,
        Prestado = 2,
        Retirado = 3
    }

    public enum EstadoPrestamoEnum
    {
        Pendiente = 1,
        Aprobado = 2,
        Rechazado = 3,
        EnRenovacion = 4,
        EnProcesoDevolucion = 5,
        Finalizado = 6
    }
}
