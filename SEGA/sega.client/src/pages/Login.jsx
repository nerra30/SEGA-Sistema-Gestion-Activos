import { useState, useEffect } from 'react';
import { getUsuarios } from '../services/api';
import logo from '../assets/logo.png';

/**
 * Componente Login
 * Puerta de entrada a la aplicación. Valida las credenciales del usuario
 * y determina a qué panel debe ser redirigido según su rol.
 * * @param {function} onLogin - Función inyectada desde App.jsx para cambiar el estado global de autenticación.
 */
function Login({ onLogin }) {
    // Estados para controlar los inputs del formulario
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Estado para mostrar mensajes de error (credenciales inválidas)
    const [error, setError] = useState("");

    // Lista temporal de usuarios obtenida de la API/Mock para validar el login en el frontend
    const [usuariosBD, setUsuariosBD] = useState([]);

    // Cargar usuarios al montar el componente.
    // NOTA TÉCNICA: En un entorno de producción real, el front-end NUNCA descarga la base 
    // de datos de usuarios. En su lugar, enviaría las credenciales a un endpoint (ej: /api/login)
    // y el backend respondería con un Token (JWT). Esta lógica es exclusiva para la fase de simulación.
    useEffect(() => {
        const cargar = async () => {
            try {
                const data = await getUsuarios();
                setUsuariosBD(data);
            } catch (err) {
                console.error("Error conectando con API:", err);
                setError("Error de conexión con el servidor");
            }
        };
        cargar();
    }, []);

    // Función auxiliar o "Diccionario"
    // Traduce el identificador numérico del rol que viene de la base de datos 
    // a un String legible que App.jsx y Header.jsx entienden para renderizar los menús.
    const obtenerNombreRol = (rolId) => {
        switch (rolId) {
            case 1: return 'Administrador';
            case 2: return 'Gestor';
            case 3: return 'Solicitante';
            default: return 'Desconocido';
        }
    };

    // Función principal que se ejecuta al presionar "Iniciar Sesión"
    const handleLogin = (e) => {
        e.preventDefault(); // Evita que la página se recargue
        setError("");       // Limpia errores previos

        // 1. Buscamos si existe un usuario con el correo ingresado
        const usuarioEncontrado = usuariosBD.find(u => u.email === email);

        if (usuarioEncontrado) {
            // 2. Si el usuario existe, validamos que la contraseña coincida
            if (usuarioEncontrado.password === password) {

                // ¡Login Exitoso!
                // Creamos un nuevo objeto de usuario inyectándole el nombre del rol en texto
                const usuarioConRol = {
                    ...usuarioEncontrado,
                    rol: obtenerNombreRol(usuarioEncontrado.rolId)
                };

                // Pasamos este objeto validado al componente padre (App.jsx) para que dé acceso
                onLogin(usuarioConRol);

            } else {
                setError("❌ Contraseña incorrecta");
            }
        } else {
            setError("❌ Usuario no encontrado");
        }
    };

    // Herramienta exclusiva para desarrolladores (Bypass de escritura)
    // Llena automáticamente los campos y dispara el login con un pequeño retraso
    // para dar un efecto visual de que el sistema está trabajando.
    const loginRapido = (emailTest, passTest) => {
        setEmail(emailTest);
        setPassword(passTest);

        setTimeout(() => {
            const user = usuariosBD.find(u => u.email === emailTest);
            if (user) {
                onLogin({ ...user, rol: obtenerNombreRol(user.rolId) });
            }
        }, 500); // Retraso de medio segundo
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* ZONA DE CABECERA Y LOGO */}
                <img src={logo} alt="Logo SEGA" style={{ width: '300px', marginBottom: '20px' }} />
                <p style={{ color: '#666', marginBottom: '20px' }}>Sistema de Gestión de Activos</p>

                {/* =============================================
                    FORMULARIO DE AUTENTICACIÓN
                ============================================= */}
                <form onSubmit={handleLogin} style={styles.form}>

                    {/* Input: Correo Electrónico */}
                    <div style={{ marginBottom: '15px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@escuela.edu"
                            required
                            style={styles.input}
                        />
                    </div>

                    {/* Input: Contraseña */}
                    <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                            style={styles.input}
                        />
                    </div>

                    {/* Renderizado condicional del mensaje de error (solo aparece si hay texto en el estado 'error') */}
                    {error && <div style={styles.error}>{error}</div>}

                    {/* Botón de Enviar */}
                    <button type="submit" style={styles.button}>Iniciar Sesión</button>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                {/* =============================================
                    ZONA DE PRUEBAS / QA (Accesos Rápidos)
                ============================================= */}
                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Accesos Rápidos (pruebas)</h4>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <button onClick={() => loginRapido('admin@sega.com', '123')} style={styles.quickBtn}>
                            Entrar como Admin
                        </button>
                        <button onClick={() => loginRapido('juan@sega.com', '123')} style={styles.quickBtn}>
                            Entrar como Gestor
                        </button>
                        <button onClick={() => loginRapido('maria@sega.com', '123')} style={styles.quickBtn}>
                            Entrar como Solicitante
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

// ESTILOS 
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Segoe UI, sans-serif' },
    card: { background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', textAlign: 'center', width: '100%', maxWidth: '400px' },
    form: { display: 'flex', flexDirection: 'column' },
    input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' },
    button: { background: '#0078D4', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
    error: { color: '#d13438', background: '#fde7e9', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' },
    quickBtn: { background: 'white', border: '1px solid #ddd', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', textAlign: 'left', paddingLeft: '15px', color: '#333' }
};

export default Login;