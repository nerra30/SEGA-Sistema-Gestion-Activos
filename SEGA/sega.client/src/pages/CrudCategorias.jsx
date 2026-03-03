import Swal from 'sweetalert2';
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
            // Opcional: Mostrar error al cargar
            Swal.fire('Error', 'No se pudieron cargar las categorías', 'error');
        }
    };

    // Función genérica para manejar los cambios en cualquier input del formulario.
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Función que se ejecuta al hacer submit en el formulario
    const guardar = async (e) => {
        e.preventDefault(); // Evita que la página se recargue por defecto

        try {
            if (modoEdicion) {
                // Modo edición
                await actualizarCategoria(form.id, form);
                Swal.fire({
                    title: '¡Actualizada!',
                    text: 'Categoría actualizada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#107C10',
                    timer: 2000 // Se cierra solo después de 2 segundos (opcional)
                });
            } else {
                // Modo creación
                await crearCategoria(form);
                Swal.fire({
                    title: '¡Creada!',
                    text: 'Categoría creada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#107C10',
                    timer: 2000
                });
            }

            // Limpieza y recarga
            setForm({ id: 0, nombre: '', descripcion: '' });
            setModoEdicion(false);
            cargar();
        } catch (error) {
            Swal.fire('Error', 'Ocurrió un problema al guardar la categoría', 'error');
        }
    };

    // Función para preparar el formulario cuando el usuario hace clic en "Editar" en la tabla
    const seleccionarParaEditar = (cat) => {
        setForm({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || ''
        });
        setModoEdicion(true);
    };

    // Función para eliminar una categoría específica
    const eliminar = async (id) => {
        // Reemplazo del window.confirm nativo
        const confirmacion = await Swal.fire({
            title: '¿Estás seguro de eliminar este registro?',
            text: "No podrás revertir esta acción.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d13438',
            cancelButtonColor: '#666',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmacion.isConfirmed) return; // Si el usuario cancela, no hacemos nada

        try {
            const res = await eliminarCategoria(id);
            if (res.ok) {
                Swal.fire({
                    title: '¡Eliminada!',
                    text: 'La categoría ha sido eliminada.',
                    icon: 'success',
                    confirmButtonColor: '#107C10',
                    timer: 2000
                });
                cargar();
            } else {
                // Reemplazo del alert de error
                Swal.fire({
                    title: 'Error',
                    text: 'No se puede eliminar, es posible que tenga equipos asociados.',
                    icon: 'error',
                    confirmButtonColor: '#0078D4'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Ocurrió un error inesperado al eliminar', 'error');
        }
    };

    return (
        <div>
            <h2> Gestión de Categorías </h2>

            {/* =============================================
                ZONA DE FORMULARIO (Creación y Edición)
            ============================================= */}
            <div style={{ background: '#f3f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>

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
                        <button type="submit" style={btnGuardar}>
                            {modoEdicion ? 'Actualizar' : 'Crear'}
                        </button>

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
                    {categorias.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.nombre}</td>
                            <td>{c.descripcion}</td>
                            <td style={{ textAlign: 'center' }}>
                                <button onClick={() => seleccionarParaEditar(c)} style={btnEditar} title="Editar">✏️</button>
                                <button onClick={() => eliminar(c.id)} style={btnEliminar} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))}

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