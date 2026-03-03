import Swal from 'sweetalert2';
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

    // Cargar los préstamos al montar el componente
    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            const data = await getPrestamos();
            setPrestamos(data);
        } catch (error) {
            console.error("Error al cargar los préstamos:", error);
        }
    };

    // =============================================
    // LÓGICA DE DASHBOARD (Contadores en tiempo real)
    // =============================================
    const contadores = {
        pendientes: prestamos.filter(p => p.estado === 1).length,
        activos: prestamos.filter(p => p.estado === 2).length,
        vencidos: prestamos.filter(p => {
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

            const diasRaw = parseInt(prestamoActual.diasSolicitados);
            const diasExtra = isNaN(diasRaw) ? 3 : diasRaw;

            if (prestamoActual.estado === 1 || prestamoActual.estado === 5) {
                const fechaBase = new Date();
                fechaBase.setDate(fechaBase.getDate() + diasExtra);
                nuevaFechaIso = fechaBase.toISOString();

                // Notificaciones de éxito de SweetAlert
                if (prestamoActual.estado === 1) {
                    Swal.fire({ title: '¡Aprobada!', text: `Solicitud aprobada exitosamente por ${diasExtra} días.`, icon: 'success', timer: 2500, confirmButtonColor: '#107C10' });
                } else if (prestamoActual.estado === 5) {
                    Swal.fire({ title: '¡Renovada!', text: `El tiempo se extendió por ${diasExtra} días adicionales.`, icon: 'success', timer: 2500, confirmButtonColor: '#107C10' });
                }
            }
        } else {
            // Lógica de Rechazo con SweetAlert
            if (prestamoActual.estado === 5) {
                nuevoEstado = 2;
                Swal.fire({ title: 'Rechazada', text: 'La renovación ha sido rechazada. El préstamo vuelve a estar Activo con su fecha original.', icon: 'info', confirmButtonColor: '#0078D4' });
            } else {
                nuevoEstado = 4;
                Swal.fire({ title: 'Rechazada', text: 'La solicitud de préstamo ha sido rechazada.', icon: 'warning', confirmButtonColor: '#d13438' });
            }
        }

        try {
            await gestionarEstadoPrestamo(id, nuevoEstado, nuevaFechaIso);
            cargar();
        } catch (error) {
            Swal.fire('Error', 'No se pudo procesar la solicitud con el servidor.', 'error');
        }
    };

    // =============================================
    // MODAL DE DEVOLUCIÓN (Construido con SweetAlert HTML)
    // =============================================
    const handleRecepcion = async (prestamo) => {
        // Usamos la inyección HTML de SweetAlert para crear el diseño del ticket
        const notaHTML = prestamo.notaDevolucion || "El usuario no dejó ningún comentario.";

        const result = await Swal.fire({
            title: 'Recepción de Equipo',
            html: `
                <div style="text-align: left; background: #f3f2f1; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 14px;">
                    <p style="margin: 0 0 10px 0;"><strong>Equipo:</strong> ${prestamo.equipo?.nombre}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Usuario:</strong> ${prestamo.usuario?.nombreCompleto}</p>
                    <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;" />
                    <p style="margin: 0 0 5px 0;"><strong>Nota del Usuario:</strong></p>
                    <div style="background: white; padding: 10px; border-radius: 4px; border: 1px solid #ccc; font-style: italic; color: #555;">
                        ${notaHTML}
                    </div>
                </div>
                <p style="margin-bottom: 0;">¿En qué estado se recibe el equipo?</p>
            `,
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonColor: '#107C10',   // Verde para Buen Estado
            denyButtonColor: '#d13438',      // Rojo para Mal Estado
            cancelButtonColor: '#666',       // Gris para Cancelar
            confirmButtonText: 'Buen Estado',
            denyButtonText: 'Mal Estado',
            cancelButtonText: 'Cancelar',
            width: '500px'
        });

        // isConfirmed = Clic en Buen Estado | isDenied = Clic en Mal Estado
        if (result.isConfirmed || result.isDenied) {
            const buenEstado = result.isConfirmed;

            try {
                // Mandamos 1 (Disponible) si volvió bien, o 3 (Mantenimiento) si volvió mal
                await finalizarPrestamo(prestamo.id, buenEstado ? 1 : 3);

                if (buenEstado) {
                    Swal.fire({ title: '¡Recibido!', text: 'El equipo vuelve a estar disponible en el inventario.', icon: 'success', timer: 2500, confirmButtonColor: '#107C10' });
                } else {
                    Swal.fire({ title: '¡Atención!', text: 'El equipo se ha enviado a Mantenimiento.', icon: 'warning', timer: 3000, confirmButtonColor: '#d13438' });
                }
                cargar();
            } catch (error) {
                Swal.fire('Error', 'No se pudo registrar la recepción del equipo.', 'error');
            }
        }
    };

    // =============================================
    // FILTRADO DE LA TABLA
    // =============================================
    const prestamosFiltrados = prestamos.filter(p => {
        if (filtro === 'Vigentes') return p.estado === 1 || p.estado === 2 || p.estado === 5 || p.estado === 6;
        if (filtro === 'Pendientes') return p.estado === 1;
        if (filtro === 'Activos') return p.estado === 2;
        if (filtro === 'Finalizado') return p.estado === 3;
        if (filtro === 'Rechazado') return p.estado === 4;
        if (filtro === 'Renovacion') return p.estado === 5;
        if (filtro === 'Devolucion') return p.estado === 6;
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
                    <option value="Devolucion">Solicitudes Devolución</option>
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
                                    {p.estado === 5 && <span style={badgeStyle('#e1f0fa', '#0078D4')}>En Renovación</span>}
                                    {p.estado === 6 && <span style={badgeStyle('#ffdab9', '#d83b01')}>En Devolución</span>}
                                </td>

                                {/* COLUMNA INFO EXTRA: Avisos importantes para el gestor */}
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>

                                        {(p.estado === 1 || p.estado === 5) && diasSolicitadosValidos && (
                                            <span style={{
                                                background: '#e1f0fa', color: '#0078D4', fontWeight: 'bold',
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '10px', border: '1px solid #0078D4'
                                            }}>
                                                📅 Pide {p.diasSolicitados || 3} días
                                            </span>
                                        )}

                                        {isVencido && (
                                            <span style={{
                                                background: '#fde7d9', color: '#d13438', fontWeight: 'bold',
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d13438'
                                            }}>
                                                ⚠️ VENCIDO
                                            </span>
                                        )}

                                        {p.estado === 2 && !isFechaValida && (
                                            <span style={{ fontSize: '10px', color: 'red' }}>Fecha inválida</span>
                                        )}

                                        {p.notaDevolucion && !p.notaDevolucion.startsWith("RENOVACION:") && (
                                            <div title={p.notaDevolucion} style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#555', cursor: 'help', fontStyle: 'italic', background: '#f3f2f1', padding: '2px 6px', borderRadius: '4px' }}>
                                                {p.notaDevolucion}
                                            </div>
                                        )}

                                        {!isVencido && !p.notaDevolucion && p.estado !== 1 && p.estado !== 5 && (
                                            <span style={{ color: '#ccc', fontSize: '12px' }}>--</span>
                                        )}
                                    </div>
                                </td>

                                {/* COLUMNA BOTONES DE ACCIÓN */}
                                <td style={{ textAlign: 'center' }}>
                                    {(p.estado === 1 || p.estado === 5) && (
                                        <>
                                            <button onClick={() => procesarSolicitud(p.id, true)} style={btnVerde} title="Aprobar">✅</button>
                                            <button onClick={() => procesarSolicitud(p.id, false)} style={btnRojo} title="Rechazar">❌</button>
                                        </>
                                    )}

                                    {(p.estado === 2 || p.estado === 6) && (
                                        <button onClick={() => handleRecepcion(p)} style={btnAzul} title='Recibir Equipo'>📥</button>
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

export default GestionPrestamos;