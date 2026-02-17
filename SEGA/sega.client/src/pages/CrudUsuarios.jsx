import { useEffect, useState } from 'react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/api';

function CrudUsuarios() {
    const [usuarios, setUsuarios] = useState([]);

    // Estado del formulario
    const [form, setForm] = useState({
        id: 0,
        nombreCompleto: '',
        email: '',
        password: '',
        rolId: 3 // Por defecto 3: Solicitante
    });

    const [modoEdicion, setModoEdicion] = useState(false);

    useEffect(() => { cargar(); }, []);

    const cargar = async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const guardar = async (e) => {
        e.preventDefault();

        // Validación básica de campos vacíos (opcional pero recomendada)
        if (!form.nombreCompleto || !form.email) return alert("Completa los datos obligatorios");

        try {
            if (modoEdicion) {
                await actualizarUsuario(form.id, form);
                alert("Usuario actualizado correctamente");
            } else {
                if (!form.password) return alert("La contraseña es obligatoria");
                await crearUsuario(form);
                alert("Usuario creado correctamente");
            }
            // Limpiar
            setForm({ id: 0, nombreCompleto: '', email: '', password: '', rolId: 3 });
            setModoEdicion(false);
            cargar();
        } catch (error) {
            alert("Error al guardar. Verifica la consola.");
        }
    };

    const seleccionarParaEditar = (usuario) => {
        setForm({
            id: usuario.id,
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            password: '',
            rolId: usuario.rolId
        });
        setModoEdicion(true);
    };

    const eliminar = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
        await eliminarUsuario(id);
        cargar();
    };

    return (
        <div>
            <h2> Gestión de Usuarios </h2>

            {/* FORMULARIO */}
            <div style={{ background: '#f3f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>{modoEdicion ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}</h3>

                <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

                    <div>
                        <label>Nombre Completo:</label>
                        <input name="nombreCompleto" value={form.nombreCompleto} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div>
                        <label>Email:</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required style={inputStyle} />
                    </div>

                    <div>
                        <label>Contraseña:</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder={modoEdicion ? "(Opcional)" : "Requerida"} style={inputStyle} />
                    </div>

                    {/* SELECTOR DE ROLES */}
                    <div>
                        <label>Rol Asignado:</label>
                        <select name="rolId" value={form.rolId} onChange={handleChange} style={inputStyle}>
                            <option value="1">Administrador</option>
                            <option value="2">Gestor</option>
                            <option value="3">Solicitante</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        <button type="submit" style={btnGuardar}>
                            {modoEdicion ? 'Actualizar' : 'Crear'}
                        </button>
                        {modoEdicion && (
                            <button type="button" onClick={() => { setModoEdicion(false); setForm({ id: 0, nombreCompleto: '', email: '', password: '', rolId: 3 }); }} style={btnCancelar}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <br></br>

            {/* TABLA  */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead style={{ background: '#0078D4', color: 'white' }}>
                    <tr>
                        <th style={{ padding: '10px', textAlign: 'left' }}>Nombre</th>
                        <th style={{ textAlign: 'left' }}>Email</th>
                        <th style={{ textAlign: 'left' }}>Rol</th>
                        <th style={{ textAlign: 'center' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map(u => (
                        <tr key={u.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>{u.nombreCompleto}</td>
                            <td>{u.email}</td>
                            <td>
                                {/* ETIQUETAS VISUALES POR ROL */}
                                {u.rolId === 1 && <span>Admin</span>}
                                {u.rolId === 2 && <span>Gestor</span>}
                                {u.rolId === 3 && <span>Solicitante</span>}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <button onClick={() => seleccionarParaEditar(u)} style={btnEditar} title="Editar">✏️</button>
                                <button onClick={() => eliminar(u.id)} style={btnEliminar} title="Eliminar">🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ESTILOS
const inputStyle = { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' };
const btnGuardar = { background: '#107C10', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' };
const btnCancelar = { background: '#666', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' };
const btnEditar = { background: '#0078D4', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', marginRight: '5px', borderRadius: '4px' };
const btnEliminar = { background: '#d13438', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px' };

export default CrudUsuarios;