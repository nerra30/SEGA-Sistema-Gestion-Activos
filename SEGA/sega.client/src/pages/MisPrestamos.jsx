import Swal from 'sweetalert2';
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
        try {
            const data = await getPrestamos();
            // FILTRO DE SEGURIDAD LOCAL
            setPrestamos(data.filter(p => p.usuarioId === usuario.id));
        } catch (error) {
            console.error("Error cargando mis préstamos:", error);
        }
    };

    // Maneja el flujo cuando el usuario quiere extender el tiempo de su préstamo
    const handleRenovar = async (id) => {
        // Modal interactivo para pedir los días
        const { value: diasInput } = await Swal.fire({
            title: 'Renovar Préstamo',
            text: '¿Por cuántos días deseas renovar el préstamo? (Mínimo 3)',
            input: 'number',
            inputValue: 3,
            showCancelButton: true,
            confirmButtonColor: '#0078D4', // Azul para acciones secundarias/renovaciones
            cancelButtonColor: '#666',
            confirmButtonText: 'Solicitar Renovación',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value || value < 3) {
                    return 'Debes solicitar al menos 3 días adicionales';
                }
            }
        });

        if (!diasInput) return; // Si cancela, cortamos la ejecución

        try {
            // Enviamos la petición de renovación a la API
            await solicitarRenovacion(id, diasInput);

            Swal.fire({
                title: '¡Solicitud enviada!',
                text: `Renovación por ${diasInput} días en espera de aprobación del Gestor.`,
                icon: 'success',
                confirmButtonColor: '#107C10',
                timer: 3000
            });

            cargar(); // Recargamos para que el estado cambie a "En Renovación" visualmente
        } catch (error) {
            Swal.fire('Error', 'No se pudo enviar la solicitud de renovación.', 'error');
        }
    };

    // Maneja el flujo cuando el usuario avisa que ya entregó el equipo físicamente
    const handleNotificar = async (id) => {
        // Modal con un área de texto (textarea) para notas largas
        const { value: nota } = await Swal.fire({
            title: 'Notificar Devolución',
            text: 'Ingresa una nota sobre la entrega y/o motivo de la devolución',
            input: 'textarea',
            inputPlaceholder: 'Ej: Lo dejé en recepción...  Se devuelve por malfuncionamiento...',
            showCancelButton: true,
            confirmButtonColor: '#107C10',
            cancelButtonColor: '#666',
            confirmButtonText: 'Enviar Notificación',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value || value.trim() === '') {
                    return 'Debes ingresar una nota para poder notificar la devolución';
                }
            }
        });

        if (!nota) return; // Si cancela

        try {
            // Guardamos la nota en la API para que el Gestor la vea en su panel
            await notificarDevolucion(id, nota);

            Swal.fire({
                title: '¡Notificada!',
                text: 'La devolución ha sido notificada al encargado exitosamente.',
                icon: 'success',
                confirmButtonColor: '#107C10',
                timer: 2500
            });

            cargar();
        } catch (error) {
            Swal.fire('Error', 'No se pudo enviar la notificación.', 'error');
        }
    };

    // =============================================
    // LÓGICA DE FILTRADO PARA LA TABLA
    // =============================================
    const prestamosFiltrados = prestamos.filter(p => {
        if (filtro === 'Vigentes') return p.estado === 1 || p.estado === 2 || p.estado === 5 || p.estado === 6;
        if (filtro === 'Pendientes') return p.estado === 1;
        if (filtro === 'Activos') return p.estado === 2;
        if (filtro === 'Renovacion') return p.estado === 5;
        if (filtro === 'Devolucion') return p.estado === 6;
        if (filtro === 'Historial') return p.estado === 3 || p.estado === 4;
        if (filtro === 'Todos') return true;
        return true;
    });

    return (
        <div>
            <h2>Mis Préstamos</h2>

            {/* INTERFAZ DEL FILTRO */}
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
                    <option value="Devolucion">En Devolución</option>
                    <option value="Historial">Finalizados / Rechazados</option>
                    <option value="Todos">Todos</option>
                </select>
            </div>

            {/* TABLA DE PRÉSTAMOS DEL USUARIO */}
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
                        {prestamosFiltrados.map(p => {
                            const vencido = new Date(p.fechaLimite) < new Date();

                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>

                                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{p.equipo?.nombre}</td>

                                    <td style={{ padding: '12px 15px', color: (vencido && p.estado === 2) ? '#d13438' : 'inherit', fontWeight: (vencido && p.estado === 2) ? 'bold' : 'normal' }}>
                                        {p.fechaLimite ? new Date(p.fechaLimite).toLocaleDateString() : '--'}

                                        {(vencido && p.estado === 2) && (
                                            <span style={{ marginLeft: '5px', fontSize: '11px', background: '#d13438', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                                                VENCIDO
                                            </span>
                                        )}
                                    </td>

                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                        {p.estado === 1 && <span style={badgeStyle('#fff4ce', '#665d1e')}>Pendiente</span>}
                                        {p.estado === 2 && <span style={badgeStyle('#dff6dd', '#107C10')}>Activo</span>}
                                        {p.estado === 3 && <span style={badgeStyle('#f3f2f1', '#a19f9d')}>Finalizado</span>}
                                        {p.estado === 4 && <span style={badgeStyle('#fee', '#d13438')}>Rechazado</span>}
                                        {p.estado === 5 && <span style={badgeStyle('#e1f0fa', '#0078D4')}>En Renovación</span>}
                                        {p.estado === 6 && <span style={badgeStyle('#ffdab9', '#d83b01')}>En Devolución</span> }
                                    </td>

                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                        {p.estado === 2 && (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                                {vencido && (
                                                    <button onClick={() => handleRenovar(p.id)} style={btnAccion} title="Renovar Préstamo">🔄</button>
                                                )}
                                                <button onClick={() => handleNotificar(p.id)} style={btnSecundario} title="Notificar Devolución">📩</button>
                                            </div>
                                        )}
                                        {p.estado !== 2 && <span style={{ color: '#aaa', fontSize: '13px' }}>--</span>}
                                    </td>
                                </tr>
                            );
                        })}

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