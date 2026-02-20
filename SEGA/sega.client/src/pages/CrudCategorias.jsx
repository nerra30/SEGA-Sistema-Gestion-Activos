import { useEffect, useState } from 'react';
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../services/api';

/**
 * Componente CrudCategorias
 * Permite al Administrador gestionar (Crear, Leer, Actualizar, Eliminar) 
 * las categorías a las que pertenecen los equipos.
 */
function CrudCategorias() {
    // Estado principal que guarda la lista de categorías obtenidas del backend/mock
    const [categorias, setCategorias] = useState([]);

    // Estado que maneja los datos actuales del formulario (para crear o editar)
    const [form, setForm] = useState({
        id: 0,
        nombre: '',
        descripcion: ''
    });

    // Bandera (boolean) para saber si el usuario está creando una nueva categoría o editando una existente
    const [modoEdicion, setModoEdicion] = useState(false);

    // useEffect se ejecuta una sola vez al montar el componente para traer las categorías inicialmente
    useEffect(() => { cargar(); }, []);

    // Función para solicitar la lista de categorías a la API y guardarlas en el estado
    const cargar = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    };

    // Función genérica para manejar los cambios en cualquier input del formulario.
    // Utiliza el atributo 'name' del input para saber qué propiedad del objeto 'form' debe actualizar.
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Función que se ejecuta al hacer submit en el formulario
    const guardar = async (e) => {
        e.preventDefault(); // Evita que la página se recargue por defecto

        if (modoEdicion) {
            // Si estamos en modo edición, llamamos al endpoint de actualización
            await actualizarCategoria(form.id, form);
            alert("Categoría actualizada correctamente");
        } else {
            // Si no, llamamos al endpoint de creación
            await crearCategoria(form);
            alert("Categoría creada correctamente");
        }

        // Una vez guardado, limpiamos el formulario, salimos del modo edición y recargamos la tabla
        setForm({ id: 0, nombre: '', descripcion: '' });
        setModoEdicion(false);
        cargar();
    };

    // Función para preparar el formulario cuando el usuario hace clic en "Editar" en la tabla
    const seleccionarParaEditar = (cat) => {
        // Copiamos los datos de la fila seleccionada hacia el estado del formulario
        setForm({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || '' // Evita errores si la descripción viene como null de la base de datos
        });
        setModoEdicion(true); // Cambiamos la interfaz a modo edición
    };

    // Función para eliminar una categoría específica
    const eliminar = async (id) => {
        // Validación de seguridad obligatoria para evitar borrados accidentales
        if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;

        try {
            const res = await eliminarCategoria(id);
            if (res.ok) {
                alert("Exito! categoría eliminada correctamente");
                cargar(); // Recargamos la tabla para que desaparezca la categoría borrada
            } else {
                alert("No se puede eliminar, es posible que tenga equipos asociados.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2> Gestión de Categorías </h2>

            {/* =============================================
                ZONA DE FORMULARIO (Creación y Edición)
            ============================================= */}
            <div style={{ background: '#f3f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>

                {/* Título dinámico que cambia según el estado 'modoEdicion' */}
                <h3>{modoEdicion ? '✏️ Editar Categoría' : '➕ Nueva Categoría'}</h3>

                <form onSubmit={guardar} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'end' }}>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label>Nombre:</label>
                        <input
                            name="nombre"
                            value={form.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ej: Cómputo, Audiovisual..."
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ flex: 2, minWidth: '300px' }}>
                        <label>Descripción:</label>
                        <input
                            name="descripcion"
                            value={form.descripcion}
                            onChange={handleChange}
                            placeholder="Descripción breve..."
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {/* Botón de Submit que cambia su texto dinámicamente */}
                        <button type="submit" style={btnGuardar}>
                            {modoEdicion ? 'Actualizar' : 'Crear'}
                        </button>

                        {/* Botón de Cancelar: SOLO se muestra si estamos en modo edición */}
                        {modoEdicion && (
                            <button
                                type="button"
                                onClick={() => {
                                    setModoEdicion(false);
                                    setForm({ id: 0, nombre: '', descripcion: '' });
                                }}
                                style={btnCancelar}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <br></br>

            {/* =============================================
                ZONA DE TABLA (Listado de Categorías)
            ============================================= */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead style={{ background: '#333', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ textAlign: 'left' }}>Descripción</th>
                        <th style={{ width: '150px', textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Mapeamos el arreglo de categorías para generar una fila por cada elemento */}
                    {categorias.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.nombre}</td>
                            <td>{c.descripcion}</td>
                            <td style={{ textAlign: 'center' }}>
                                {/* Botones de acción vinculados a las funciones superiores pasando el objeto o el ID */}
                                <button onClick={() => seleccionarParaEditar(c)} style={btnEditar} title="Editar">✏️</button>
                                <button onClick={() => eliminar(c.id)} style={btnEliminar} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))}

                    {/* Mensaje de fallback por si la base de datos está vacía */}
                    {categorias.length === 0 && (
                        <tr>
                            <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                No hay categorías registradas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// --- Estilos ---
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnGuardar = { background: '#107C10', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' };
const btnCancelar = { background: '#666', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' };
const btnEditar = { background: '#0078D4', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px', borderRadius: '4px' };
const btnEliminar = { background: '#d13438', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' };

export default CrudCategorias;