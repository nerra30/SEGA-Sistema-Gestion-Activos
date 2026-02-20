import { useEffect, useState } from 'react';
import { getPrestamos, gestionarEstadoPrestamo, finalizarPrestamo } from '../services/api';

/**
 * Componente GestionPrestamos
 * Es el panel principal para el rol "Gestor".
 * Permite visualizar métricas, aprobar/rechazar solicitudes, 
 * gestionar renovaciones y registrar la devolución física de equipos.
 */
function GestionPrestamos() {
    // Lista completa de préstamos obtenidos de la base de datos/API
    const [prestamos, setPrestamos] = useState([]);

    // Filtro activo para la vista de la tabla. Por defecto oculta el historial pasado.
    const [filtro, setFiltro] = useState('Vigentes');

    // Estados para controlar el Modal (ventanita emergente) de recepción de equipos
    const [modalVisible, setModalVisible] = useState(false);
    const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);

    // Cargar los préstamos al montar el componente
    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const data = await getPrestamos();
        setPrestamos(data);
    };

    // =============================================
    // LÓGICA DE DASHBOARD (Contadores en tiempo real)
    // =============================================
    // Se recalculan automáticamente cada vez que cambia el estado 'prestamos'
    const contadores = {
        pendientes: prestamos.filter(p => p.estado === 1).length,
        activos: prestamos.filter(p => p.estado === 2).length,
        vencidos: prestamos.filter(p => {
            // Un préstamo está vencido si su estado es 2 (Activo) 
            // y su fecha límite es menor a la fecha de hoy.
            const fecha = new Date(p.fechaLimite);
            return p.estado === 2 && !isNaN(fecha) && fecha < new Date();
        }).length,
        renovacion: prestamos.filter(p => p.estado === 5).length
    };

    // =============================================
    // ACCIONES DEL GESTOR (Aprobar/Rechazar)
    // =============================================
    const procesarSolicitud = async (id, aprobar) => {
        const prestamoActual = prestamos.find(p => p.id === id);
        if (!prestamoActual) return;

        let nuevoEstado;
        let nuevaFechaIso = null;

        if (aprobar) {
            nuevoEstado = 2; // Pasa a estado "Activo" (En Préstamo)

            // Validamos los días solicitados. Si viene corrupto (NaN), asignamos 3 días por defecto.
            const diasRaw = parseInt(prestamoActual.diasSolicitados);
            const diasExtra = isNaN(diasRaw) ? 3 : diasRaw;

            // Solo calculamos una nueva fecha si es una Solicitud Nueva (1) o Renovación (5)
            if (prestamoActual.estado === 1 || prestamoActual.estado === 5) {
                const fechaBase = new Date(); // Fecha de hoy
                fechaBase.setDate(fechaBase.getDate() + diasExtra); // Sumamos los días solicitados
                nuevaFechaIso = fechaBase.toISOString(); // Convertimos a formato estándar para la BD

                // Alertas de éxito específicas según lo que se aprobó
                if (prestamoActual.estado === 1) {
                    alert(`✅ Solicitud aprobada exitosamente por ${diasExtra} días.`);
                } else if (prestamoActual.estado === 5) {
                    alert(`✅ Renovación aprobada. El tiempo se extendió por ${diasExtra} días adicionales.`);
                }
            }
        } else {
            // Lógica de Rechazo
            if (prestamoActual.estado === 5) {
                nuevoEstado = 2; // Si rechazan la renovación, el préstamo vuelve a estar activo normal
                alert("❌ La renovación ha sido rechazada. El préstamo vuelve a estar Activo con su fecha original.");
            } else {
                nuevoEstado = 4; // Rechazo de solicitud nueva
                alert("❌ La solicitud de préstamo ha sido rechazada.");
            }
        }

        // Enviamos los cambios al backend y recargamos
        await gestionarEstadoPrestamo(id, nuevoEstado, nuevaFechaIso);
        cargar();
    };

    // =============================================
    // MODAL DE DEVOLUCIÓN
    // =============================================
    // Prepara los datos y abre la ventana para evaluar en qué estado vuelve el equipo
    const abrirModalRecepcion = (prestamo) => {
        setPrestamoSeleccionado(prestamo);
        setModalVisible(true);
    };

    // Ejecuta el cierre del préstamo dependiendo de la revisión física del equipo
    const confirmarRecepcion = async (buenEstado) => {
        if (!prestamoSeleccionado) return;

        // Mandamos 1 (Disponible) si volvió bien, o 3 (Mantenimiento) si volvió mal
        await finalizarPrestamo(prestamoSeleccionado.id, buenEstado ? 1 : 3);

        if (buenEstado) {
            alert("✅ Equipo recibido en buen estado. El equipo vuelve a estar disponible.");
        } else {
            alert("⚠️ Equipo recibido en mal estado. El equipo se envía a Mantenimiento.");
        }

        // Limpiamos y cerramos modal
        setModalVisible(false);
        setPrestamoSeleccionado(null);
        cargar();
    };

    // =============================================
    // FILTRADO DE LA TABLA
    // =============================================
    // Devuelve una nueva lista basada en el menú desplegable de "Filtrar por"
    const prestamosFiltrados = prestamos.filter(p => {
        if (filtro === 'Vigentes') return p.estado === 1 || p.estado === 2 || p.estado === 5;
        if (filtro === 'Pendientes') return p.estado === 1;
        if (filtro === 'Activos') return p.estado === 2;
        if (filtro === 'Finalizado') return p.estado === 3;
        if (filtro === 'Rechazado') return p.estado === 4;
        if (filtro === 'Renovacion') return p.estado === 5;
        if (filtro === 'Todos') return true;
        return true;
    });

    return (
        <div>
            <h2>Gestión de Equipos</h2>

            {/* TARJETAS DEL DASHBOARD SUPERIOR */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={cardStyle('#ffeb3a', 'black')}>Pendientes: {contadores.pendientes}</div>
                <div style={cardStyle('#4caf50', 'black')}>Activos: {contadores.activos}</div>
                <div style={cardStyle('#f44336', 'black')}>Vencidos: {contadores.vencidos}</div>
                <div style={cardStyle('#2196f3', 'black')}>Renovaciones: {contadores.renovacion}</div>
            </div>

            {/* SELECTOR DE FILTROS */}
            <div style={{ marginBottom: '15px', background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filtrar por: </label>
                <select value={filtro} onChange={(e) => setFiltro(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
                    <option value="Vigentes">Todos los Vigentes</option>
                    <option value="Pendientes">Solicitudes Pendientes</option>
                    <option value="Activos">Préstamos Activos</option>
                    <option value="Renovacion">Solicitudes Renovación</option>
                    <option value="Finalizado">Préstamos Finalizados</option>
                    <option value="Rechazado">Préstamos Rechazados</option>
                    <option value="Todos">Ver todos</option>
                </select>
            </div>

            {/* TABLA PRINCIPAL DE GESTIÓN */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <thead style={{ background: '#333', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '12px' }}>Usuario</th>
                        <th>Equipo</th>
                        <th>Estado</th>
                        <th style={{ textAlign: 'center' }}>Info / Alertas</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {prestamosFiltrados.map(p => {
                        // Lógica visual específica para cada fila (Vencimientos y Días)
                        const fechaObj = new Date(p.fechaLimite);
                        const isFechaValida = !isNaN(fechaObj);
                        const isVencido = p.estado === 2 && isFechaValida && fechaObj < new Date();
                        const diasSolicitadosValidos = p.diasSolicitados && !isNaN(parseInt(p.diasSolicitados));

                        return (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{p.usuario?.nombreCompleto}</td>
                                <td>{p.equipo?.nombre}</td>

                                {/* COLUMNA ESTADO: Etiquetas visuales dinámicas */}
                                <td style={{ textAlign: 'center' }}>
                                    {p.estado === 1 && <span style={badgeStyle('#fff4ce', '#665d1e')}>Nueva Solicitud</span>}
                                    {p.estado === 2 && <span style={badgeStyle('#dff6dd', '#107C10')}>En Préstamo</span>}
                                    {p.estado === 3 && <span style={badgeStyle('#f3f2f1', '#a19f9d')}>Finalizado</span>}
                                    {p.estado === 4 && <span style={badgeStyle('#fee', '#d13438')}>Rechazado</span>}
                                    {p.estado === 5 && <span style={badgeStyle('#e1dfdd', '#333')}>En Renovación</span>}
                                </td>

                                {/* COLUMNA INFO EXTRA: Avisos importantes para el gestor */}
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>

                                        {/* Muestra cuántos días pide el usuario en solicitudes nuevas/renovaciones */}
                                        {(p.estado === 1 || p.estado === 5) && diasSolicitadosValidos && (
                                            <span style={{
                                                background: '#e1f0fa', color: '#0078D4', fontWeight: 'bold',
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '10px', border: '1px solid #0078D4'
                                            }}>
                                                📅 Pide {p.diasSolicitados || 3} días
                                            </span>
                                        )}

                                        {/* Alerta roja intermitente o estática si el préstamo ya caducó */}
                                        {isVencido && (
                                            <span style={{
                                                background: '#fde7d9', color: '#d13438', fontWeight: 'bold',
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d13438'
                                            }}>
                                                ⚠️ VENCIDO
                                            </span>
                                        )}

                                        {/* Alerta técnica si la fecha guardada en BD está corrupta */}
                                        {p.estado === 2 && !isFechaValida && (
                                            <span style={{ fontSize: '10px', color: 'red' }}>Fecha inválida</span>
                                        )}

                                        {/* Si el alumno dejó una nota al devolver por su cuenta, se muestra aquí */}
                                        {p.notaDevolucion && (
                                            <div title={p.notaDevolucion} style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#555', cursor: 'help' }}>
                                                {p.notaDevolucion}
                                            </div>
                                        )}

                                        {/* Relleno visual si no hay alertas que mostrar */}
                                        {!isVencido && !p.notaDevolucion && p.estado !== 1 && p.estado !== 5 && (
                                            <span style={{ color: '#ccc', fontSize: '12px' }}>--</span>
                                        )}
                                    </div>
                                </td>

                                {/* COLUMNA BOTONES DE ACCIÓN: Cambian según el estado del préstamo */}
                                <td style={{ textAlign: 'center' }}>

                                    {/* Botones Aprobar/Rechazar para Solicitudes Nuevas o Renovaciones */}
                                    {(p.estado === 1 || p.estado === 5) && (
                                        <>
                                            <button onClick={() => procesarSolicitud(p.id, true)} style={btnVerde} title="Aprobar">✅</button>
                                            <button onClick={() => procesarSolicitud(p.id, false)} style={btnRojo} title="Rechazar">❌</button>
                                        </>
                                    )}

                                    {/* Botón de Recibir Equipo cuando está en préstamo */}
                                    {p.estado === 2 && (
                                        <button onClick={() => abrirModalRecepcion(p)} style={btnAzul} title='Recibir Equipo'>📥</button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {prestamosFiltrados.length === 0 && (
                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No hay registros en esta vista.</td></tr>
                    )}
                </tbody>
            </table>

            {/* =============================================
                MODAL DE RECEPCIÓN (Flotante)
            ============================================= */}
            {modalVisible && prestamoSeleccionado && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0, color: '#0078D4' }}>Recepción de Equipo</h3>
                        <div style={{ background: '#f3f2f1', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                            <p><strong>Equipo:</strong> {prestamoSeleccionado.equipo?.nombre}</p>
                            <p><strong>Usuario:</strong> {prestamoSeleccionado.usuario?.nombreCompleto}</p>
                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '10px 0' }} />

                            {/* Muestra la nota que dejó el usuario, si aplica */}
                            <p><strong>Nota del Usuario:</strong></p>
                            <div style={{ background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontStyle: 'italic', color: '#555' }}>
                                {prestamoSeleccionado.notaDevolucion || "El usuario no dejó ningún comentario."}
                            </div>
                        </div>

                        {/* Botones de dictamen físico del Gestor */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => confirmarRecepcion(true)} style={btnGrandeVerde}>Buen Estado</button>
                            <button onClick={() => confirmarRecepcion(false)} style={btnGrandeNaranja}>Mal Estado</button>
                        </div>

                        <button onClick={() => setModalVisible(false)} style={btnCerrarModal}>Cancelar</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- ESTILOS ---
const cardStyle = (bg, color = 'black') => ({
    padding: '15px', borderRadius: '8px', background: bg, color: color, flex: '1 1 200px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});
const badgeStyle = (bg, color) => ({
    background: bg, color: color, padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
});
const btnVerde = { marginRight: 5, background: '#107C10', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' };
const btnRojo = { background: '#d13438', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' };
const btnAzul = { background: '#0078D4', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };
const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalStyle = { background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '500px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' };
const btnGrandeVerde = { background: '#107C10', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', flex: 1 };
const btnGrandeNaranja = { background: '#d13438', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', cursor: 'pointer', flex: 1 };
const btnCerrarModal = { background: 'transparent', border: 'none', color: '#666', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline' };

export default GestionPrestamos;