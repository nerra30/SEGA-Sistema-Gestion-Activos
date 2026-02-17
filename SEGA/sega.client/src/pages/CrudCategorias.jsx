import { useEffect, useState } from 'react';
import { getCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from '../services/api';

function CrudCategorias() {
    const [categorias, setCategorias] = useState([]);

    // Estado del formulario
    const [form, setForm] = useState({
        id: 0,
        nombre: '',
        descripcion: ''
    });

    const [modoEdicion, setModoEdicion] = useState(false);

    // Cargar datos al iniciar
    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            const data = await getCategorias();
            setCategorias(data);
        } catch (error) {
            console.error("Error cargando categorías:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const guardar = async (e) => {
        e.preventDefault();

        if (modoEdicion) {
            await actualizarCategoria(form.id, form);
            alert("Categoría actualizada correctamente");
        } else {
            await crearCategoria(form);
            alert("Categoría creada correctamente");
        }

        // Limpiar y recargar
        setForm({ id: 0, nombre: '', descripcion: '' });
        setModoEdicion(false);
        cargar();
    };

    const seleccionarParaEditar = (cat) => {
        setForm({
            id: cat.id,
            nombre: cat.nombre,
            descripcion: cat.descripcion || '' // Manejar nulos si no hay descripción
        });
        setModoEdicion(true);
    };

    const eliminar = async (id) => {
        // Validación de seguridad: Preguntar antes de borrar
        // Nota: En el backend deberás validar que no tenga equipos asignados antes de borrar
        if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;

        try {
            const res = await eliminarCategoria(id);
            if (res.ok) {
                alert("Categoría eliminada");
                cargar();
            } else {
                alert("No se puede eliminar: Es posible que tenga equipos asociados.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h2> Gestión de Categorías </h2>

            {/* FORMULARIO */}
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
                                onClick={() => { setModoEdicion(false); setForm({ id: 0, nombre: '', descripcion: '' }); }}
                                style={btnCancelar}
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <br></br>

            {/* TABLA */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead style={{ background: '#0078D4', color: 'white' }}>
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