import { useEffect, useState } from 'react';
import { getEquipos, getCategorias, crearSolicitud } from '../services/api';

function SolicitarPrestamo({ usuario }) {
    const [equipos, setEquipos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true); // Nuevo estado para feedback visual

    // FILTROS: Inicializamos vacíos para que muestren TODO por defecto
    const [busqueda, setBusqueda] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        try {
            setCargando(true);
            const [dataEquipos, dataCategorias] = await Promise.all([
                getEquipos(),
                getCategorias()
            ]);

            // Filtramos solo los disponibles (Estado 1)
            setEquipos(dataEquipos.filter(e => e.estado === 1));
            setCategorias(dataCategorias);
        } catch (error) {
            console.error("Error cargando catálogo:", error);
        } finally {
            setCargando(false);
        }
    };

    const solicitar = async (id) => {
        // 1. Preguntamos los días
        const dias = prompt("¿Cuántos días lo necesitas?", "3");

        // Si cancela, no hacemos nada
        if (!dias) return;

        // Calculamos una fecha tentativa (aunque el Gestor define la final al aprobar)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));

        // 2. Enviamos la solicitud Y los días como segundo argumento
        await crearSolicitud({
            equipoId: id,
            usuarioId: usuario.id,
            fechaLimite: fechaLimite.toISOString(),
            estado: 1 // 1 = Pendiente
        }, dias); // <--- ¡AQUÍ SE PASAN LOS DÍAS!

        alert(`✅ Solicitud enviada por ${dias} días (Pendiente de Aprobación)`);
        cargarDatos();
    };

    // --- LÓGICA DE FILTRADO ---
    // Si categoriaSeleccionada es "" (vacío), muestra todo.
    const equiposFiltrados = equipos.filter(e => {
        const coincideNombre = e.nombre.toLowerCase().includes(busqueda.toLowerCase());
        const coincideCategoria = categoriaSeleccionada === ""
            ? true
            : e.categoriaId === parseInt(categoriaSeleccionada);

        return coincideNombre && coincideCategoria;
    });

    return (
        <div>
            <h2>Solicitar Préstamo</h2>

            {/* PANEL DE FILTROS */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                alignItems: 'end', // Alinea los inputs abajo
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {/* Buscador */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Buscar equipo:</label>
                    <input
                        type="text"
                        placeholder="Ej: Laptop..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={inputStyle}
                    />
                </div>

                {/* Filtro Categoría */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Categoría:</label>
                    <select
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        style={inputStyle}
                    >
                        {/* El value="" asegura que al elegir esto, el filtro se desactive y muestre todo */}
                        <option value="">Ver Todos</option>
                        {categorias.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* INDICADOR DE CARGA */}
            {cargando && <p>Cargando inventario...</p>}

            <p> Catálogo de Equipos Disponibles</p>

            {/* Lista de equipos */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
            }}>
                {!cargando && equiposFiltrados.map(e => (
                    <div key={e.id} style={cardStyle}>
                        <div>
                            {/* Header de la tarjeta con color según categoría (opcional, decorativo) */}
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{
                                    background: '#e1dfdd',
                                    color: '#333',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}>
                                    {e.categoria ? e.categoria.nombre : 'General'}
                                </span>
                            </div>

                            <h3 style={{ margin: '0 0 5px 0', color: '#0078D4', fontSize: '18px' }}>{e.nombre}</h3>

                            <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: '#666' }}>
                                Serial: <strong>{e.serial}</strong>
                            </p>
                        </div>

                        <button onClick={() => solicitar(e.id)} style={btnSolicitar}>
                            Solicitar
                        </button>
                    </div>
                ))}

                {/* Mensaje si no hay resultados */}
                {!cargando && equiposFiltrados.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No hay equipos disponibles con estos filtros.</p>
                        <button
                            onClick={() => { setBusqueda(""); setCategoriaSeleccionada(""); }}
                            style={{ background: 'transparent', border: '1px solid #0078D4', color: '#0078D4', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Ver todo el inventario
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- ESTILOS ---

const inputStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    boxSizing: 'border-box'
};

const cardStyle = {
    background: 'white',
    border: '1px solid #e1dfdd',
    borderRadius: '8px',
    padding: '15px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '160px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default'
};

const btnSolicitar = {
    width: '100%',
    padding: '8px',
    background: '#107C10',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
    fontSize: '14px'
};

export default SolicitarPrestamo;