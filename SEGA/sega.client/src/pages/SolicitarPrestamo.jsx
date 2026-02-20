import { useEffect, useState } from 'react';
import { getEquipos, getCategorias, crearSolicitud } from '../services/api';

/**
 * Componente SolicitarPrestamo
 * Catálogo interactivo para el rol "Solicitante".
 * Muestra únicamente los equipos que están con estado 1 (Disponible)
 * y permite filtrarlos por texto o categoría para solicitar un préstamo.
 * * @param {Object} usuario - Datos del usuario logueado, necesarios para asociar el préstamo a su ID.
 */
function SolicitarPrestamo({ usuario }) {
    // Estados para almacenar los datos obtenidos del servidor
    const [equipos, setEquipos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Bandera para mostrar un mensaje de "Cargando..." mientras esperamos la respuesta de la API
    const [cargando, setCargando] = useState(true);

    // =============================================
    // ESTADOS PARA LOS FILTROS DE BÚSQUEDA
    // =============================================
    // Se inician vacíos para que, por defecto, se renderice todo el catálogo disponible
    const [busqueda, setBusqueda] = useState("");
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

    // Se ejecuta una sola vez al cargar la pantalla
    useEffect(() => {
        cargarDatos();
    }, []);

    // Función asíncrona para obtener el inventario y las categorías simultáneamente
    const cargarDatos = async () => {
        try {
            setCargando(true);

            // Promise.all permite hacer ambas peticiones a la API al mismo tiempo, 
            // ahorrando tiempo de carga para el usuario.
            const [dataEquipos, dataCategorias] = await Promise.all([
                getEquipos(),
                getCategorias()
            ]);

            // FILTRO ESTRICTO: Solo mostramos en el catálogo los equipos cuyo estado sea 1 (Disponible)
            // Esto evita que un usuario solicite algo que ya está prestado o en mantenimiento.
            setEquipos(dataEquipos.filter(e => e.estado === 1));
            setCategorias(dataCategorias);

        } catch (error) {
            console.error("Error cargando catálogo:", error);
        } finally {
            // Se ejecuta siempre, haya fallado o no, para quitar el mensaje de "Cargando..."
            setCargando(false);
        }
    };

    // =============================================
    // FLUJO DE SOLICITUD DE PRÉSTAMO
    // =============================================
    // Se ejecuta cuando el usuario hace clic en el botón verde de "Solicitar" de una tarjeta
    const solicitar = async (id) => {
        // 1. Pedimos al usuario cuántos días requiere el equipo
        const dias = prompt("¿Por cuántos días necesitas el equipo?\n" + " El tiempo mínimo es de 3 días.", "3");

        // Si el usuario cancela la ventana emergente, abortamos la función
        if (!dias) return;

        // Calculamos una fecha de vencimiento TENTATIVA (El gestor puede modificarla luego).
        // Instanciamos la fecha de hoy y le sumamos los días indicados por el usuario.
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));

        // 2. Construimos el objeto del préstamo y lo enviamos al backend
        await crearSolicitud({
            equipoId: id,
            usuarioId: usuario.id,
            fechaLimite: fechaLimite.toISOString(), // Lo guardamos en formato ISO (estándar de BD)
            estado: 1 // Entra con estado 1 (Pendiente de Aprobación por un Gestor)
        }, dias); // Pasamos los días también para que la API simulada los registre

        // Confirmación visual para el usuario y refresco del catálogo 
        // (El equipo solicitado desaparecerá temporalmente de esta vista)
        alert(`✅ Solicitud enviada por ${dias} días (Pendiente de Aprobación)`);
        cargarDatos();
    };

    // =============================================
    // LÓGICA DE FILTRADO COMBINADO
    // =============================================
    // Se ejecuta dinámicamente cada vez que el usuario escribe en el buscador o elige una categoría.
    const equiposFiltrados = equipos.filter(e => {
        // Verifica si el nombre del equipo incluye lo que el usuario escribió (Ignorando mayúsculas/minúsculas)
        const coincideNombre = e.nombre.toLowerCase().includes(busqueda.toLowerCase());

        // Verifica si el equipo pertenece a la categoría seleccionada.
        // Si el select está en "" (Ver Todos), esta condición siempre es verdadera.
        const coincideCategoria = categoriaSeleccionada === ""
            ? true
            : e.categoriaId === parseInt(categoriaSeleccionada);

        // El equipo solo se renderiza si pasa AMBAS pruebas
        return coincideNombre && coincideCategoria;
    });

    return (
        <div>
            <h2>Solicitar Préstamo</h2>

            {/* =============================================
                PANEL DE FILTROS (Buscador y Selector)
            ============================================= */}
            <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                alignItems: 'end', // Empuja los inputs hacia abajo para alinearlos con sus etiquetas
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {/* 1. Buscador por texto (Nombre del equipo) */}
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

                {/* 2. Desplegable por Categorías */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Categoría:</label>
                    <select
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        style={inputStyle}
                    >
                        {/* El value="" actúa como comodín para desactivar el filtro */}
                        <option value="">Ver Todos</option>
                        {categorias.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* MENSAJE DE ESPERA DE CARGA */}
            {cargando && <p>Cargando inventario...</p>}

            <p> Catálogo de Equipos Disponibles</p>

            {/* =============================================
                GRILLA DEL CATÁLOGO DE EQUIPOS
            ============================================= */}
            {/* CSS Grid para crear tarjetas responsivas que se ajustan solas al ancho de pantalla */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
            }}>
                {/* Mapeamos el array ya filtrado para renderizar las tarjetas */}
                {!cargando && equiposFiltrados.map(e => (
                    <div key={e.id} style={cardStyle}>
                        <div>
                            {/* Insignia visual indicando a qué categoría pertenece el equipo */}
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

                        {/* Botón de acción que desencadena el flujo de solicitud */}
                        <button onClick={() => solicitar(e.id)} style={btnSolicitar}>
                            Solicitar
                        </button>
                    </div>
                ))}

                {/* =============================================
                    MENSAJE DE "SIN RESULTADOS" (Fallback)
                ============================================= */}
                {/* Se muestra si no hay equipos que coincidan con los filtros del usuario */}
                {!cargando && equiposFiltrados.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
                        <p>No hay equipos disponibles con estos filtros.</p>

                        {/* Botón de conveniencia para limpiar todos los filtros de un golpe */}
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