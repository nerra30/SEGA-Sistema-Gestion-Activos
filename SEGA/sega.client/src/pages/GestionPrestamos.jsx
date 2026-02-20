import { useEffect, useState } from 'react';
import { getPrestamos, gestionarEstadoPrestamo, finalizarPrestamo } from '../services/api';

function GestionPrestamos() {
    const [prestamos, setPrestamos] = useState([]);
    const [filtro, setFiltro] = useState('Todos');

    // Estado para el Modal de Recepción
    const [modalVisible, setModalVisible] = useState(false);
    const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const data = await getPrestamos();
        setPrestamos(data);
    };

    // --- LÓGICA DASHBOARD BLINDADA ---
    const contadores = {
        pendientes: prestamos.filter(p => p.estado === 1).length,
        activos: prestamos.filter(p => p.estado === 2).length,
        vencidos: prestamos.filter(p => {
            // Verificamos que sea estado 2 Y que la fecha sea válida antes de comparar
            const fecha = new Date(p.fechaLimite);
            return p.estado === 2 && !isNaN(fecha) && fecha < new Date();
        }).length,
        renovacion: prestamos.filter(p => p.estado === 5).length
    };

    // --- ACCIONES GESTOR ---
    const procesarSolicitud = async (id, aprobar) => {
        const prestamoActual = prestamos.find(p => p.id === id);
        if (!prestamoActual) return;

        let nuevoEstado;
        let nuevaFechaIso = null;

        if (aprobar) {
            nuevoEstado = 2; // Pasa a Activo

            // 1. VALIDACIÓN ESTRICTA DE DÍAS (Anti-NaN)
            // Si diasSolicitados es null, undefined o "NaN", usamos 3.
            const diasRaw = parseInt(prestamoActual.diasSolicitados);
            const diasExtra = isNaN(diasRaw) ? 3 : diasRaw;

            // 2. Lógica de cálculo de fecha (Solo si es Nueva o Renovación)
            if (prestamoActual.estado === 1 || prestamoActual.estado === 5) {
                const fechaBase = new Date(); // HOY
                fechaBase.setDate(fechaBase.getDate() + diasExtra);
                nuevaFechaIso = fechaBase.toISOString();

                console.log(`✅ Aprobado por ${diasExtra} días. Nueva fecha: ${nuevaFechaIso}`);
            }

        } else {
            // Rechazo
            if (prestamoActual.estado === 5) {
                nuevoEstado = 2;
                alert("Renovación rechazada. Vuelve a estado Activo.");
            } else {
                nuevoEstado = 4;
            }
        }

        await gestionarEstadoPrestamo(id, nuevoEstado, nuevaFechaIso);
        cargar();
    };

    // Abre el modal para revisar la nota antes de finalizar
    const abrirModalRecepcion = (prestamo) => {
        setPrestamoSeleccionado(prestamo);
        setModalVisible(true);
    };

    const confirmarRecepcion = async (buenEstado) => {
        if (!prestamoSeleccionado) return;
        await finalizarPrestamo(prestamoSeleccionado.id, buenEstado ? 1 : 3);
        setModalVisible(false);
        setPrestamoSeleccionado(null);
        cargar();
    };

    // --- FILTRADO ---
    const prestamosFiltrados = prestamos.filter(p => {
        if (filtro === 'Todos') return true;
        if (filtro === 'Pendientes') return p.estado === 1;
        if (filtro === 'Activos') return p.estado === 2;
        if (filtro === 'Finalizado') return p.estado === 3;
        if (filtro === 'Rechazado') return p.estado === 4;
        if (filtro === 'Renovacion') return p.estado === 5;
        return true;
    });

    return (
        <div>
            <h2>Gestión de Equipos</h2>

            {/* DASHBOARD CARDS */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={cardStyle('#ffeb3a', 'black')}>Pendientes: {contadores.pendientes}</div>
                <div style={cardStyle('#4caf50', 'black')}>Activos: {contadores.activos}</div>
                <div style={cardStyle('#f44336', 'black')}>Vencidos: {contadores.vencidos}</div>
                <div style={cardStyle('#2196f3', 'black')}>Renovaciones: {contadores.renovacion}</div>
            </div>

            {/* FILTROS */}
            <div style={{ marginBottom: '15px', background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filtrar vista: </label>
                <select onChange={(e) => setFiltro(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
                    <option value="Todos">Ver Todo</option>
                    <option value="Pendientes">Solicitudes Pendientes</option>
                    <option value="Activos">Préstamos Activos</option>
                    <option value="Renovacion">Solicitudes Renovación</option>
                    <option value="Finalizado">Préstamos Finalizados</option>
                    <option value="Rechazado">Préstamos Rechazados</option>
                </select>
            </div>

            {/* TABLA DE GESTIÓN */}
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
                        // CÁLCULO DE VENCIMIENTO SEGURO
                        const fechaObj = new Date(p.fechaLimite);
                        const isFechaValida = !isNaN(fechaObj); // ¿Es una fecha real?
                        const isVencido = p.estado === 2 && isFechaValida && fechaObj < new Date();

                        // VALIDACIÓN VISUAL DE DÍAS (Para evitar "Pide NaN días")
                        const diasSolicitadosValidos = p.diasSolicitados && !isNaN(parseInt(p.diasSolicitados));

                        return (
                            <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}>{p.usuario?.nombreCompleto}</td>
                                <td>{p.equipo?.nombre}</td>
                                <td>
                                    {p.estado === 1 && <span style={badgeStyle('#fff4ce', '#665d1e')}>Nueva Solicitud</span>}
                                    {p.estado === 2 && <span style={badgeStyle('#dff6dd', '#107C10')}>En Préstamo</span>}
                                    {p.estado === 3 && <span style={badgeStyle('#f3f2f1', '#a19f9d')}>Finalizado</span>}
                                    {p.estado === 4 && <span style={badgeStyle('#fee', '#d13438')}>Rechazado</span>}
                                    {p.estado === 5 && <span style={badgeStyle('#e1dfdd', '#333')}>En Renovación</span>}
                                </td>

                                {/* COLUMNA DE INFO */}
                                <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>

                                        {/* 1. INDICADOR DE DÍAS (Solo si el dato es válido) */}
                                        {(p.estado === 1 || p.estado === 5) && diasSolicitadosValidos && (
                                            <span style={{
                                                background: '#e1f0fa', color: '#0078D4', fontWeight: 'bold',
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '10px', border: '1px solid #0078D4'
                                            }}>
                                                📅 Pide {p.diasSolicitados || 3} días
                                            </span>
                                        )}

                                        {/* 2. ALERTA DE VENCIMIENTO */}
                                        {isVencido && (
                                            <span style={{
                                                background: '#fde7d9', color: '#d13438', fontWeight: 'bold',
                                                fontSize: '11px', padding: '2px 8px', borderRadius: '4px', border: '1px solid #d13438'
                                            }}>
                                                ⚠️ VENCIDO
                                            </span>
                                        )}

                                        {/* Si la fecha está rota y está activo, mostrar aviso técnico (Opcional) */}
                                        {p.estado === 2 && !isFechaValida && (
                                            <span style={{ fontSize: '10px', color: 'red' }}>Fecha inválida</span>
                                        )}

                                        {/* 3. NOTA DE DEVOLUCIÓN */}
                                        {p.notaDevolucion && (
                                            <div title={p.notaDevolucion} style={{ maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#555', cursor: 'help' }}>
                                                💬 {p.notaDevolucion}
                                            </div>
                                        )}

                                        {/* 4. GUIÓN SI NO HAY NADA */}
                                        {!isVencido && !p.notaDevolucion && p.estado !== 1 && p.estado !== 5 && (
                                            <span style={{ color: '#ccc', fontSize: '12px' }}>--</span>
                                        )}
                                    </div>
                                </td>

                                <td style={{ textAlign: 'center' }}>
                                    {/* BOTONES */}
                                    {(p.estado === 1 || p.estado === 5) && (
                                        <>
                                            <button onClick={() => procesarSolicitud(p.id, true)} style={btnVerde} title="Aprobar">✅</button>
                                            <button onClick={() => procesarSolicitud(p.id, false)} style={btnRojo} title="Rechazar">❌</button>
                                        </>
                                    )}

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

            {/* MODAL (Sin cambios en lógica, solo visual) */}
            {modalVisible && prestamoSeleccionado && (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0, color: '#0078D4' }}>Recepción de Equipo</h3>
                        <div style={{ background: '#f3f2f1', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left' }}>
                            <p><strong>Equipo:</strong> {prestamoSeleccionado.equipo?.nombre}</p>
                            <p><strong>Usuario:</strong> {prestamoSeleccionado.usuario?.nombreCompleto}</p>
                            <hr style={{ border: '0', borderTop: '1px solid #ccc', margin: '10px 0' }} />
                            <p><strong>Nota del Usuario:</strong></p>
                            <div style={{ background: 'white', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontStyle: 'italic', color: '#555' }}>
                                {prestamoSeleccionado.notaDevolucion || "El usuario no dejó ningún comentario."}
                            </div>
                        </div>
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