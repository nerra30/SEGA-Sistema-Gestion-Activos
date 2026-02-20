import { useEffect, useState } from 'react';
import { getPrestamos, solicitarRenovacion, notificarDevolucion } from '../services/api';

/**
 * Componente MisPrestamos
 * Es el panel personal del rol "Solicitante".
 * Muestra el historial de equipos prestados a este usuario en específico.
 * Permite solicitar renovaciones si el equipo está vencido y dejar notas de devolución.
 * * @param {Object} usuario - Objeto con los datos del usuario logueado (necesario para filtrar por su ID).
 */
function MisPrestamos({ usuario }) {
    // Estado para guardar la lista de préstamos que le pertenecen a este usuario
    const [prestamos, setPrestamos] = useState([]);

    // Estado para manejar el filtro visual de la tabla. Por defecto oculta el historial pasado.
    const [filtro, setFiltro] = useState('Vigentes');

    // Cargar los datos al montar el componente en pantalla
    useEffect(() => { cargar(); }, []);

    // Consulta a la API y filtra la información
    const cargar = async () => {
        const data = await getPrestamos();

        // FILTRO DE SEGURIDAD LOCAL: 
        // Nos aseguramos de guardar en el estado SOLO los préstamos donde 
        // el usuarioId coincida con el ID del usuario que inició sesión.
        setPrestamos(data.filter(p => p.usuarioId === usuario.id));
    };

    // Maneja el flujo cuando el usuario quiere extender el tiempo de su préstamo
    const handleRenovar = async (id) => {
        // Pedimos al usuario la cantidad de días mediante un prompt nativo
        const diasInput = prompt("¿Por cuántos días deseas renovar el préstamo?\n El tiempo mínimo es de 3 días.", "3");

        if (!diasInput) return; // Si cancela la ventanita, cortamos la ejecución aquí

        // Enviamos la petición de renovación a la API
        await solicitarRenovacion(id, diasInput);
        alert(`✅ Solicitud enviada por ${diasInput} días. Esperando aprobación del Gestor.`);
        cargar(); // Recargamos para que el estado cambie a "En Renovación" visualmente
    };

    // Maneja el flujo cuando el usuario avisa que ya entregó el equipo físicamente
    const handleNotificar = async (id) => {
        // Pedimos una nota explicativa (útil si lo dejó con otra persona o en otra oficina)
        const nota = prompt("Ingresa una nota sobre la devolución (ej: 'Lo dejé en recepción')");

        if (!nota) return; // Si cancela, no hacemos nada

        // Guardamos la nota en la API para que el Gestor la vea en su panel
        await notificarDevolucion(id, nota);
        alert("✅ Devolución notificada al encargado.");
        cargar();
    };

    // =============================================
    // LÓGICA DE FILTRADO PARA LA TABLA
    // =============================================
    // Evalúa el estado 'filtro' y devuelve un nuevo arreglo para renderizar
    const prestamosFiltrados = prestamos.filter(p => {
        // Vigentes: Muestra todo lo que está fluyendo (Pendiente, Activo, Renovando)
        if (filtro === 'Vigentes') return p.estado === 1 || p.estado === 2 || p.estado === 5;
        if (filtro === 'Pendientes') return p.estado === 1;
        if (filtro === 'Activos') return p.estado === 2;
        if (filtro === 'Renovacion') return p.estado === 5;
        // Historial: Muestra lo que ya terminó su ciclo
        if (filtro === 'Historial') return p.estado === 3 || p.estado === 4;

        return true;
    });

    return (
        <div>
            <h2>Mis Préstamos</h2>

            {/* =============================================
                INTERFAZ DEL FILTRO
            ============================================= */}
            <div style={{ marginBottom: '15px', background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 'bold' }}>Mostrar:</label>
                <select
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', minWidth: '200px' }}
                >
                    <option value="Vigentes">Préstamos Vigentes</option>
                    <option value="Activos">Solo Activos</option>
                    <option value="Pendientes">Solicitudes Pendientes</option>
                    <option value="Renovacion">En Renovación</option>
                    <option value="Historial">Finalizados / Rechazados</option>
                </select>
            </div>

            {/* =============================================
                TABLA DE PRÉSTAMOS DEL USUARIO
            ============================================= */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#333', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Equipo</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Vencimiento</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Estado</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Iteramos sobre el arreglo ya filtrado */}
                        {prestamosFiltrados.map(p => {
                            // Cálculo dinámico para saber si este préstamo en particular ya venció
                            const vencido = new Date(p.fechaLimite) < new Date();

                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>

                                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{p.equipo?.nombre}</td>

                                    {/* COLUMNA VENCIMIENTO: Cambia a rojo y negrita si está Activo Y Vencido */}
                                    <td style={{ padding: '12px 15px', color: (vencido && p.estado === 2) ? '#d13438' : 'inherit', fontWeight: (vencido && p.estado === 2) ? 'bold' : 'normal' }}>
                                        {p.fechaLimite ? new Date(p.fechaLimite).toLocaleDateString() : '--'}

                                        {/* Etiqueta visual extra de "VENCIDO" */}
                                        {(vencido && p.estado === 2) && (
                                            <span style={{ marginLeft: '5px', fontSize: '11px', background: '#d13438', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                                                VENCIDO
                                            </span>
                                        )}
                                    </td>

                                    {/* COLUMNA ESTADO: Etiquetas visuales del estatus del trámite */}
                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                        {p.estado === 1 && <span style={badgeStyle('#fff4ce', '#665d1e')}>Pendiente</span>}
                                        {p.estado === 2 && <span style={badgeStyle('#dff6dd', '#107C10')}>Activo</span>}
                                        {p.estado === 3 && <span style={badgeStyle('#f3f2f1', '#a19f9d')}>Finalizado</span>}
                                        {p.estado === 4 && <span style={badgeStyle('#fee', '#d13438')}>Rechazado</span>}
                                        {p.estado === 5 && <span style={badgeStyle('#e1dfdd', '#333')}>En Renovación</span>}
                                    </td>

                                    {/* COLUMNA ACCIONES: Funciones disponibles para el Solicitante */}
                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>

                                        {/* Las acciones solo están disponibles si el préstamo está Activo (2) */}
                                        {p.estado === 2 && (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>

                                                {/* El botón de Renovar SOLO aparece si la fecha límite ya se superó (vencido) */}
                                                {vencido && (
                                                    <button onClick={() => handleRenovar(p.id)} style={btnAccion} title="Renovar Préstamo">🔄</button>
                                                )}

                                                <button onClick={() => handleNotificar(p.id)} style={btnSecundario} title="Notificar Devolución">📩</button>
                                            </div>
                                        )}

                                        {/* Placeholder si el estado no permite acciones */}
                                        {p.estado !== 2 && <span style={{ color: '#aaa', fontSize: '13px' }}>--</span>}
                                    </td>
                                </tr>
                            );
                        })}

                        {/* Fila de contingencia si no hay resultados en el filtro actual */}
                        {prestamosFiltrados.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                    No se encontraron préstamos en esta vista.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- ESTILOS ---

const btnAccion = {
    background: '#0078D4',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '500'
};

const btnSecundario = {
    background: 'white',
    border: '1px solid #8a8886',
    color: '#323130',
    padding: '6px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '13px'
};

const badgeStyle = (bg, color) => ({
    background: bg,
    color: color,
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block'
});

export default MisPrestamos;