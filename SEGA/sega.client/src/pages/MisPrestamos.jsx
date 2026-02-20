import { useEffect, useState } from 'react';
import { getPrestamos, solicitarRenovacion, notificarDevolucion } from '../services/api';

function MisPrestamos({ usuario }) {
    const [prestamos, setPrestamos] = useState([]);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        const data = await getPrestamos();
        // Filtra solo los míos y activos (estado 2)
        // Nota: Si quieres ver historial, quita la condición de estado !== 3
        setPrestamos(data.filter(p => p.usuarioId === usuario.id && p.estado !== 3));
    };

    // Función de renovar
    const handleRenovar = async (id) => {
        // 1. Preguntamos los días
        const diasInput = prompt("¿Por cuántos días deseas renovar el préstamo?", "3");

        // 2. Validamos que haya escrito algo
        if (!diasInput) return;

        // 3. Enviamos el ID y los DÍAS a la API
        await solicitarRenovacion(id, diasInput);

        alert(`Solicitud enviada por ${diasInput} días.`);
        cargar();
    };

    const handleNotificar = async (id) => {
        const nota = prompt("Ingresa una nota sobre la devolución (ej: 'Lo dejé en recepción')");
        if (!nota) return;
        await notificarDevolucion(id, nota);
        alert("Devolución notificada al gestor.");
        cargar();
    };

    return (
        <div>
            <h2>Mis Préstamos</h2>

            {/* TABLA */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#0078D4', color: 'white' }}>
                        <tr>
                            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Equipo</th>
                            <th style={{ padding: '12px 15px', textAlign: 'left' }}>Vencimiento</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Estado</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {prestamos.map(p => {
                            // Calculamos si está vencido
                            const vencido = new Date(p.fechaLimite) < new Date();

                            return (
                                <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{p.equipo?.nombre}</td>

                                    <td style={{ padding: '12px 15px', color: vencido ? '#d13438' : 'inherit', fontWeight: vencido ? 'bold' : 'normal' }}>
                                        {new Date(p.fechaLimite).toLocaleDateString()}
                                        {vencido && <span style={{ marginLeft: '5px', fontSize: '11px', background: '#d13438', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>VENCIDO</span>}
                                    </td>

                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                        {p.estado === 1 && <span style={badgeStyle('#fde7d9', '#a4262c')}>Pendiente</span>}
                                        {p.estado === 2 && <span style={badgeStyle('#dff6dd', '#107C10')}>Activo</span>}
                                        {p.estado === 4 && <span style={badgeStyle('#f3f2f1', '#d13438')}>Rechazado</span>}
                                        {p.estado === 5 && <span style={badgeStyle('#e1dfdd', '#333')}>En Renovación</span>}
                                    </td>

                                    <td style={{ padding: '12px 15px', textAlign: 'center' }}>
                                        {p.estado === 2 && (
                                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>

                                                {/* CAMBIO AQUÍ: Solo mostrar si 'vencido' es true */}
                                                {vencido && (
                                                    <button onClick={() => handleRenovar(p.id)} style={btnAccion} title="Renovar Préstamo">🔄</button>
                                                )}

                                                {/* El botón de devolver siempre visible para activos */}
                                                <button onClick={() => handleNotificar(p.id)} style={btnSecundario} title="Notificar Devolución">📩</button>
                                            </div>
                                        )}
                                        {p.estado !== 2 && <span style={{ color: '#aaa', fontSize: '13px' }}>--</span>}
                                    </td>
                                </tr>
                            );
                        })}

                        {prestamos.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                    No tienes préstamos activos actualmente.
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