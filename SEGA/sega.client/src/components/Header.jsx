import logo from '../assets/logo2.png';

/**
 * Componente Header
 * Muestra la barra de navegación principal de la aplicación.
 * * @param {Object} usuario - Datos del usuario logueado (nombre, rol).
 * @param {string} vistaActual - Identificador de la pantalla actual activa.
 * @param {function} cambiarVista - Función para navegar entre pantallas.
 * @param {function} onLogout - Función para cerrar la sesión actual.
 */
function Header({ usuario, vistaActual, cambiarVista, onLogout }) {

    // Genera los estilos de los botones del menú.
    // Lógica: Si la vista del botón coincide con 'vistaActual', lo marca como activo (subrayado y negrita).
    const btnStyle = (v) => ({
        padding: '10px 15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
        borderBottom: vistaActual === v ? '3px solid white' : 'none', fontWeight: vistaActual === v ? 'bold' : 'normal'
    });

    return (
        // Contenedor principal del Header
        <header style={{
            background: '#0078D4',
            color: 'white',
            padding: '0 30px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 100
        }}>

            {/* BLOQUE IZQUIERDO: Logo y Menú de navegación */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>

                {/* Logo de la aplicación */}
                <img src={logo} alt="Logo SEGA" style={{ width: '100px', marginBottom: '0px' }} />

                {/* Menú dinámico: Renderiza diferentes botones de navegación según el rol del usuario */}
                <nav style={{ display: 'flex', gap: '5px' }}>

                    {usuario.rol === 'Solicitante' && (
                        <>
                            <button style={btnStyle('mis-prestamos')} onClick={() => cambiarVista('mis-prestamos')}>Mis Préstamos</button>
                            <button style={btnStyle('solicitar')} onClick={() => cambiarVista('solicitar')}>Solicitar Préstamo</button>
                        </>
                    )}

                    {usuario.rol === 'Gestor' && (
                        <button style={btnStyle('gestion')} onClick={() => cambiarVista('gestion')}>Panel de Gestión</button>
                    )}

                    {usuario.rol === 'Administrador' && (
                        <>
                            <button style={btnStyle('equipos')} onClick={() => cambiarVista('equipos')}>Equipos</button>
                            <button style={btnStyle('usuarios')} onClick={() => cambiarVista('usuarios')}>Usuarios</button>
                            <button style={btnStyle('categorias')} onClick={() => cambiarVista('categorias')}>Categorías</button>
                        </>
                    )}
                </nav>
            </div>


            {/* BLOQUE DERECHO: Información del usuario y botón de Salir */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

                {/* Muestra el nombre completo y el rol del usuario actual */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{usuario.nombreCompleto} ({usuario.rol})</span>
                </div>

                {/* Botón para cerrar sesión */}
                <button
                    onClick={onLogout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        padding: '10px 0',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        opacity: 1,

                    }}
                >
                    Salir
                </button>
            </div>
        </header>
    );
}

export default Header;