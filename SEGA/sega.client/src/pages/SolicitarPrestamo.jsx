import Swal from 'sweetalert2';
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
            const [dataEquipos, dataCategorias] = await Promise.all([
                getEquipos(),
                getCategorias()
            ]);

            // FILTRO ESTRICTO: Solo mostramos en el catálogo los equipos cuyo estado sea 1 (Disponible)
            setEquipos(dataEquipos.filter(e => e.estado === 1));
            setCategorias(dataCategorias);

        } catch (error) {
            console.error("Error cargando catálogo:", error);
        } finally {
            setCargando(false);
        }
    };

    // =============================================
    // FLUJO DE SOLICITUD DE PRÉSTAMO CON SWEETALERT
    // =============================================
    const solicitar = async (id) => {
        // 1. Modal interactivo pidiendo los días
        const { value: dias } = await Swal.fire({
            title: 'Solicitar Préstamo',
            text: '¿Por cuántos días necesitas el equipo? (Mínimo 3)',
            input: 'number',
            inputValue: 3, // Valor por defecto sugerido
            showCancelButton: true,
            confirmButtonColor: '#107C10',
            cancelButtonColor: '#666',
            confirmButtonText: 'Enviar Solicitud',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                // Validación en tiempo real para evitar envíos erróneos
                if (!value || value < 3) {
                    return 'Debes solicitar el equipo por al menos 3 días';
                }
            }
        });

        // Si el usuario cancela la ventana o da clic fuera de ella, abortamos la función
        if (!dias) return;

        try {
            // Calculamos la fecha de vencimiento tentativa
            const fechaLimite = new Date();
            fechaLimite.setDate(fechaLimite.getDate() + parseInt(dias));

            // 2. Enviamos la petición a la API
            await crearSolicitud({
                equipoId: id,
                usuarioId: usuario.id,
                fechaLimite: fechaLimite.toISOString(),
                estado: 1 // Entra como Pendiente
            }, dias);

            // 3. Confirmación de éxito
            Swal.fire({
                title: '¡Solicitud Enviada!',
                text: `Has solicitado el equipo por ${dias} días. (Pendiente de Aprobación del Gestor)`,
                icon: 'success',
                confirmButtonColor: '#107C10'
            });

            // Refrescamos el catálogo para que el equipo desaparezca
            cargarDatos();

        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al enviar tu solicitud. Inténtalo de nuevo.', 'error');
        }
    };

    // =============================================
    // LÓGICA DE FILTRADO COMBINADO
    // =============================================
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
                alignItems: 'end',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
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

                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>Categoría:</label>
                    <select
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        style={inputStyle}
                    >
                        <option value="">Ver Todos</option>
                        {categorias.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {cargando && <p>Cargando inventario...</p>}
            <p> Catálogo de Equipos Disponibles</p>

            {/* GRILLA DEL CATÁLOGO DE EQUIPOS */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px'
            }}>
                {!cargando && equiposFiltrados.map(e => (
                    <div key={e.id} style={cardStyle}>
                        <div>
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

                {/* MENSAJE DE "SIN RESULTADOS" */}
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