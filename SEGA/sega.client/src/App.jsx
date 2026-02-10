import { useEffect, useState } from 'react';
import './App.css';

function App() {
    // 1. Variable de estado para guardar la lista de equipos
    const [equipos, setEquipos] = useState([]);

    // 2. Este "Efecto" se ejecuta una sola vez cuando carga la página
    useEffect(() => {
        obtenerEquipos();
    }, []);

    // 3. Función asíncrona para llamar a tu API de C#
    const obtenerEquipos = async () => {
        try {
            // El "proxy" de Visual Studio redirige esto al puerto correcto del Backend
            const respuesta = await fetch('https://localhost:7164/api/equipos');

            if (respuesta.ok) {
                const datos = await respuesta.json();
                setEquipos(datos); // Guardamos los datos en la variable
            } else {
                console.error("Error al obtener datos:", respuesta.status);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    return (
        <div style={{ padding: "2rem", fontFamily: "Segoe UI, sans-serif" }}>
            <h1 style={{ color: "#0078D4" }}>SEGA - Gestión de Activos</h1>
            <p>Inventario en tiempo real conectado a SQL Server.</p>

            {/* TABLA DE RESULTADOS */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }} border="1">
                <thead style={{ backgroundColor: "#f0f0f0", textAlign: "left" }}>
                    <tr>
                        <th style={{ padding: "10px" }}>ID</th>
                        <th style={{ padding: "10px" }}>Nombre del Equipo</th>
                        <th style={{ padding: "10px" }}>Serial</th>
                        <th style={{ padding: "10px" }}>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Si no hay equipos, mostramos mensaje de carga */}
                    {equipos.length === 0 ? (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                                {equipos === null ? "Error al cargar" : "Cargando datos o tabla vacía..."}
                            </td>
                        </tr>
                    ) : (
                        // Mapeamos (recorremos) la lista de equipos
                        equipos.map((equipo) => (
                            <tr key={equipo.id}>
                                <td style={{ padding: "10px" }}>{equipo.id}</td>
                                <td style={{ padding: "10px" }}>{equipo.nombre}</td>
                                <td style={{ padding: "10px" }}>{equipo.serial}</td>
                                <td style={{ padding: "10px" }}>
                                    {/* Lógica visual para los estados */}
                                    {equipo.estado === 1 && <span style={{ color: "green" }}>🟢 Disponible</span>}
                                    {equipo.estado === 2 && <span style={{ color: "orange" }}>🔴 Prestado</span>}
                                    {equipo.estado === 3 && <span style={{ color: "gray" }}>⚫ Retirado</span>}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default App;