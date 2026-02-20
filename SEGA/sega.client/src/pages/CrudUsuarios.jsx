import { useEffect, useState } from 'react';
import { getUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/api';

/**
 * Componente CrudUsuarios
 * Panel de Administración para la gestión de usuarios del sistema.
 * Permite dar de alta a nuevos usuarios, asignarles roles (Admin, Gestor, Solicitante),
 * editar sus datos y eliminarlos.
 */
function CrudUsuarios() {
    // Estado principal que almacena la lista completa de usuarios
    const [usuarios, setUsuarios] = useState([]);

    // Estado unificado para manejar todos los campos del formulario
    const [form, setForm] = useState({
        id: 0,
        nombreCompleto: '',
        email: '',
        password: '',
        rolId: 3 // Por defecto asignamos 3 (Solicitante) por seguridad
    });

    // Bandera para saber si la vista está en modo "Creación" o "Edición"
    const [modoEdicion, setModoEdicion] = useState(false);

    // Cargar la lista de usuarios al momento de montar el componente
    useEffect(() => { cargar(); }, []);

    // Función asíncrona para obtener los usuarios desde la API/Mock
    const cargar = async () => {
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (error) {
            console.error("Error cargando usuarios:", error);
        }
    };

    // Función genérica para registrar lo que el usuario escribe en el formulario
    const handleChange = (e) => {
        // Extraemos dinámicamente el nombre del input y su valor
        const { name, value } = e.target;

        // VALIDACIÓN CLAVE: Si el campo que cambió es el select de roles ('rolId'), 
        // lo convertimos a número entero para evitar fallos de tipo de dato en la base de datos.
        const valorProcesado = name === 'rolId' ? parseInt(value) : value;

        setForm({ ...form, [name]: valorProcesado });
    };

    // Función principal que se ejecuta al presionar "Crear" o "Actualizar"
    const guardar = async (e) => {
        e.preventDefault(); // Evitamos que la página haga un refresh completo

        // Validación básica: Evitar que guarden usuarios sin nombre o sin correo
        if (!form.nombreCompleto || !form.email) return alert("Completa los datos obligatorios");

        try {
            if (modoEdicion) {
                // Flujo de Edición
                await actualizarUsuario(form.id, form);
                alert("Usuario actualizado correctamente");
            } else {
                // Flujo de Creación (Exigimos contraseña de forma obligatoria)
                if (!form.password) return alert("La contraseña es obligatoria");
                await crearUsuario(form);
                alert("Usuario creado correctamente");
            }

            // Limpieza del estado del formulario y recarga de la tabla
            setForm({ id: 0, nombreCompleto: '', email: '', password: '', rolId: 3 });
            setModoEdicion(false);
            cargar();
        } catch (error) {
            alert("Error al guardar. Verifica la consola.");
        }
    };

    // Función para cargar el formulario con los datos de un usuario que se van a editar
    const seleccionarParaEditar = (usuario) => {
        setForm({
            id: usuario.id,
            nombreCompleto: usuario.nombreCompleto,
            email: usuario.email,
            password: '', // Dejamos la contraseña en blanco por seguridad (se actualiza solo si el admin escribe algo)
            rolId: usuario.rolId
        });
        setModoEdicion(true); // Activamos el modo edición para cambiar textos y botones
    };

    // Función para eliminar a un usuario
    const eliminar = async (id) => {
        // Confirmación de seguridad en pantalla
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

        try {
            await eliminarUsuario(id);
            alert("Exito! El usuario fue eliminado correctamente");
            cargar(); // Refrescamos la tabla
        } catch (error) {
            // Manejo de errores por restricciones de llave foránea (ej. si el usuario tiene préstamos ligados)
            alert("❌ No se puede eliminar posiblemente tiene préstamos activos.");
        }
    };

    return (
        <div>
            <h2> Gestión de Usuarios </h2>

            {/* =============================================
                ZONA DE FORMULARIO
            ============================================= */}
            <div style={{ background: '#f3f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>

                {/* Título dinámico que se adapta al modo actual */}
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
                        {/* El placeholder informa al admin que no es obligatorio poner contraseña si solo está editando otros datos */}
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder={modoEdicion ? "(Opcional)" : "Requerida"} style={inputStyle} />
                    </div>

                    {/* SELECTOR DE ROLES */}
                    <div>
                        <label>Rol Asignado:</label>
                        <select name="rolId" value={form.rolId} onChange={handleChange} style={inputStyle}>
                            {/* Los values son los identificadores numéricos que guarda el backend */}
                            <option value="1">Administrador</option>
                            <option value="2">Gestor</option>
                            <option value="3">Solicitante</option>
                        </select>
                    </div>

                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                        <button type="submit" style={btnGuardar}>
                            {modoEdicion ? 'Actualizar' : 'Crear'}
                        </button>

                        {/* Botón para deshacer la selección y volver al modo creación */}
                        {modoEdicion && (
                            <button type="button" onClick={() => { setModoEdicion(false); setForm({ id: 0, nombreCompleto: '', email: '', password: '', rolId: 3 }); }} style={btnCancelar}>
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <br></br>

            {/* =============================================
                ZONA DE TABLA Y LISTADO
            ============================================= */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                <thead style={{ background: '#333', color: 'white' }}>
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
                                {/* ETIQUETAS VISUALES POR ROL: Traduce el ID numérico a un texto amigable */}
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