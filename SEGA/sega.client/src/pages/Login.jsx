import { useState, useEffect } from 'react';
import { getUsuarios } from '../services/api';
import logo from '../assets/logo.png';

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [usuariosBD, setUsuariosBD] = useState([]);

    // Cargar usuarios al iniciar para validar credenciales localmente
    // (En fase final, esto se reemplaza por un endpoint POST /login en el backend)
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

    // Función auxiliar para traducir ID de rol a Nombre (para que App.jsx entienda)
    const obtenerNombreRol = (rolId) => {
        switch (rolId) {
            case 1: return 'Administrador';
            case 2: return 'Gestor';
            case 3: return 'Solicitante';
            default: return 'Desconocido';
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError("");

        // 1. Buscar usuario por email
        const usuarioEncontrado = usuariosBD.find(u => u.email === email);

        // 2. Validar contraseña
        if (usuarioEncontrado) {
            if (usuarioEncontrado.password === password) {
                // ¡Login Exitoso!
                // Inyectamos el nombre del rol para que el ruteo funcione
                const usuarioConRol = {
                    ...usuarioEncontrado,
                    rol: obtenerNombreRol(usuarioEncontrado.rolId)
                };
                onLogin(usuarioConRol);
            } else {
                setError("❌ Contraseña incorrecta");
            }
        } else {
            setError("❌ Usuario no encontrado");
        }
    };

    // Atajo para desarrollo (Login rápido)
    const loginRapido = (emailTest, passTest) => {
        setEmail(emailTest);
        setPassword(passTest);
        // Pequeño timeout para que se vea el llenado y luego entre
        setTimeout(() => {
            const user = usuariosBD.find(u => u.email === emailTest);
            if (user) {
                onLogin({ ...user, rol: obtenerNombreRol(user.rolId) });
            }
        }, 500);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <img src={logo} alt="Logo SEGA" style={{ width: '300px', marginBottom: '20px' }} />
                <p style={{ color: '#666', marginBottom: '20px' }}>Sistema de Gestión de Activos</p>

                <form onSubmit={handleLogin} style={styles.form}>
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

                    {error && <div style={styles.error}>{error}</div>}

                    <button type="submit" style={styles.button}>Iniciar Sesión</button>
                </form>

                <hr style={{ margin: '30px 0', border: '0', borderTop: '1px solid #eee' }} />

                {/* ATAJOS DE DESARROLLO (DEV TOOLS) */}
                <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Accesos Rápidos (pruebas)</h4>
                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                        <button onClick={() => loginRapido('admin@sega.com', '123')} style={styles.quickBtn}>
                            Entrar como Admin
                        </button>
                        <button onClick={() => loginRapido('juan@escuela.edu', '123')} style={styles.quickBtn}>
                            Entrar como Gestor
                        </button>
                        <button onClick={() => loginRapido('maria@escuela.edu', '123')} style={styles.quickBtn}>
                            Entrar como Solicitante
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Estilos en línea para que se vea bien sin CSS externo
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5',
        fontFamily: 'Segoe UI, sans-serif'
    },
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px'
    },
    form: {
        display: 'flex',
        flexDirection: 'column'
    },
    input: {
        width: '100%',
        padding: '12px',
        borderRadius: '6px',
        border: '1px solid #ccc',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    button: {
        background: '#0078D4',
        color: 'white',
        border: 'none',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.2s'
    },
    error: {
        color: '#d13438',
        background: '#fde7e9',
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '15px',
        fontSize: '14px'
    },
    quickBtn: {
        background: 'white',
        border: '1px solid #ddd',
        padding: '8px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '13px',
        textAlign: 'left',
        paddingLeft: '15px',
        color: '#333'
    }
};

export default Login;