import { useState } from 'react';
import { loginUsuario } from '../services/api';
import logo from '../assets/logo.png';

/**
 * Componente Login
 * Puerta de entrada a la aplicación. Valida las credenciales del usuario
 * de forma segura conectándose al backend C#.
 * * @param {function} onLogin - Función inyectada desde App.jsx para cambiar el estado global de autenticación.
 */
function Login({ onLogin }) {
    // Estados para controlar los inputs del formulario
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Estado para mostrar mensajes de error (credenciales inválidas)
    const [error, setError] = useState("");

    // Función auxiliar o "Diccionario"
    // Traduce el identificador numérico del rol a un String legible
    const obtenerNombreRol = (rolId) => {
        switch (rolId) {
            case 1: return 'Administrador';
            case 2: return 'Gestor';
            case 3: return 'Solicitante';
            default: return 'Desconocido';
        }
    };

    // Función principal que se ejecuta al presionar "Iniciar Sesión"
    const handleLogin = async (e) => {
        e.preventDefault(); // Evita que la página se recargue
        setError("");       // Limpia errores previos

        try {
            // Le pasamos las credenciales a nuestra API segura para que el Backend decida
            const usuarioValidado = await loginUsuario(email, password);

            // ¡Login Exitoso! 
            // Preparamos el objeto inyectándole el nombre del rol en texto
            const usuarioConRol = {
                ...usuarioValidado,
                rol: usuarioValidado.rol ? usuarioValidado.rol.nombre : obtenerNombreRol(usuarioValidado.rolId)
            };

            // Pasamos este objeto validado al componente padre (App.jsx) para que dé acceso
            onLogin(usuarioConRol);

        } catch (err) {
            // Si el backend responde con error (ej. 401 Unauthorized), mostramos este mensaje
            setError("❌ Correo o contraseña incorrectos");
        }
    };

    // Herramienta exclusiva para desarrolladores (Bypass de escritura)
    // Llena automáticamente los campos y dispara el login de forma automatizada
    const loginRapido = async (emailTest, passTest) => {
        setEmail(emailTest);
        setPassword(passTest);

        try {
            const usuarioValidado = await loginUsuario(emailTest, passTest);
            const usuarioConRol = {
                ...usuarioValidado,
                rol: usuarioValidado.rol ? usuarioValidado.rol.nombre : obtenerNombreRol(usuarioValidado.rolId)
            };
            onLogin(usuarioConRol);
        } catch (err) {
            setError("❌ Error en el acceso rápido. Verifica que el usuario exista en BD.");
        }
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

                    {/* Renderizado condicional del mensaje de error */}
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

                        {/* Se actualizaron con los datos exactos de tu Script de SQL */}
                        <button onClick={() => loginRapido('admin@sega.com', '123456')} style={styles.quickBtn}>
                            Entrar como Admin
                        </button>
                        <button onClick={() => loginRapido('mgonzalez@sega.com', '123456')} style={styles.quickBtn}>
                            Entrar como Gestor (María)
                        </button>
                        <button onClick={() => loginRapido('jperez@sega.com', '123456')} style={styles.quickBtn}>
                            Entrar como Solicitante (Juan)
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