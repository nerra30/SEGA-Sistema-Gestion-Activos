import { useEffect, useState } from 'react';
import { getEquipos, getCategorias, crearEquipo, actualizarEquipo, eliminarEquipo } from '../services/api';

function CrudEquipos() {
    const [equipos, setEquipos] = useState([]);
    const [categorias, setCategorias] = useState([]);

    // Estado del formulario
    const [form, setForm] = useState({
        id: 0,
        nombre: '',
        serial: '',
        estado: 1,
        categoriaId: '' // Para el select
    });

    const [modoEdicion, setModoEdicion] = useState(false);

    // Cargar datos iniciales (Equipos y Categorías)
    useEffect(() => { cargarDatos(); }, []);

    const cargarDatos = async () => {
        try {
            const dataEquipos = await getEquipos();
            const dataCategorias = await getCategorias();
            setEquipos(dataEquipos);
            setCategorias(dataCategorias);
        } catch (error) {
            console.error("Error cargando datos:", error);
        }
    };

    // Manejar cambios en inputs
    const handleChange = (e) => {
        // Si es categoriaId o estado, convertir a número
        const value = (e.target.name === 'categoriaId' || e.target.name === 'estado')
            ? parseInt(e.target.value)
            : e.target.value;
        setForm({ ...form, [e.target.name]: value });
    };

    // Guardar (Crear o Actualizar)
    const guardar = async (e) => {
        e.preventDefault();

        if (!form.nombre || !form.serial) return alert("Nombre y Serial son obligatorios");

        try {
            if (modoEdicion) {
                await actualizarEquipo(form.id, form);
                alert("✅ Equipo actualizado correctamente");
            } else {
                await crearEquipo(form);
                alert("✅ Equipo creado correctamente");
            }
            limpiarFormulario();
            cargarDatos();
        } catch (error) {
            alert("❌ Error al guardar. Revisa que el serial no esté repetido.");
        }
    };

    // Preparar para editar
    const seleccionarParaEditar = (equipo) => {
        setForm({
            id: equipo.id,
            nombre: equipo.nombre,
            serial: equipo.serial,
            estado: equipo.estado,
            categoriaId: equipo.categoriaId || ''
        });
        setModoEdicion(true);
    };

    // Eliminar
    const eliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este equipo?")) return;

        try {
            await eliminarEquipo(id);
            alert("🗑️ Equipo eliminado");
            cargarDatos();
        } catch (error) {
            alert("❌ No se puede eliminar (posiblemente tiene préstamos activos).");
        }
    };

    const limpiarFormulario = () => {
        setForm({ id: 0, nombre: '', serial: '', estado: 1, categoriaId: '' });
        setModoEdicion(false);
    };

    return (
        <div>
            <h2> Gestión de Inventario </h2>

            {/* FORMULARIO */}
            <div style={{ background: '#f3f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>{modoEdicion ? '✏️ Editar Equipo' : '➕ Nuevo Equipo'}</h3>

                <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>

                    {/* Nombre */}
                    <div>
                        <label>Nombre del Equipo:</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} placeholder="Ej: Laptop Dell" />
                    </div>

                    {/* Serial */}
                    <div>
                        <label>Serial / Código:</label>
                        <input name="serial" value={form.serial} onChange={handleChange} required style={inputStyle} placeholder="Ej: DELL-001" disabled={modoEdicion} title="El serial no se suele editar" />
                    </div>

                    {/* Categoría */}
                    <div>
                        <label>Categoría:</label>
                        <select name="categoriaId" value={form.categoriaId} onChange={handleChange} style={inputStyle} required>
                            <option value="">-- Seleccionar --</option>
                            {categorias.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Estado (Solo visible al editar para ajustes manuales) */}
                    <div>
                        <label>Estado Inicial:</label>
                        <select name="estado" value={form.estado} onChange={handleChange} style={inputStyle}>
                            <option value="1">Disponible</option>
                            <option value="2">Prestado</option>
                            <option value="3">Mantenimiento</option>
                            <option value="4">Retirado</option>
                        </select>
                    </div>

                    {/* Botones */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                        <button type="submit" style={btnGuardar}>
                            {modoEdicion ? 'Actualizar' : 'Crear'}
                        </button>

                        {modoEdicion && (
                            <button type="button" onClick={limpiarFormulario} style={btnCancelar}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* TABLA DE LISTADO */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead style={{ background: '#0078D4', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Equipo</th>
                        <th style={{ textAlign: 'left' }}>Serial</th>
                        <th style={{ textAlign: 'left' }}>Categoría</th>
                        <th style={{ textAlign: 'center' }}>Estado</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {equipos.map(e => (
                        <tr key={e.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{e.nombre}</td>
                            <td>{e.serial}</td>
                            <td>{e.categoria?.nombre || '---'}</td>
                            <td style={{ textAlign: 'center' }}>
                                {e.estado === 1 && <span style={badgeStyle('green')}>Disponible</span>}
                                {e.estado === 2 && <span style={badgeStyle('orange')}>Prestado</span>}
                                {e.estado === 3 && <span style={badgeStyle('#9c27b0')}>Mantenimiento</span>}
                                {e.estado === 4 && <span style={badgeStyle('gray')}>Retirado</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button onClick={() => seleccionarParaEditar(e)} style={btnEditar} title="Editar">✏️</button>
                                <button onClick={() => eliminar(e.id)} style={btnEliminar} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))}
                    {equipos.length === 0 && (
                        <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No hay equipos registrados.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

// --- Estilos ---
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnGuardar = { background: '#107C10', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' };
const btnCancelar = { background: '#666', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' };
const btnEditar = { background: '#0078D4', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px', borderRadius: '4px' };
const btnEliminar = { background: '#d13438', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' };
const badgeStyle = (color) => ({ background: color, color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' });

export default CrudEquipos;