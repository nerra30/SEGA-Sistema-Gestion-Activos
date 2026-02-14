import logo from '../assets/logo2.png';
function Header({ usuario, vistaActual, cambiarVista, onLogout }) {
    const btnStyle = (v) => ({
        padding: '10px 15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
        borderBottom: vistaActual === v ? '3px solid white' : 'none', fontWeight: vistaActual === v ? 'bold' : 'normal'
    });

    return (
        <header style={{
            background: '#0078D4',
            color: 'white',
            padding: '0 30px', // Un poco más de padding a los lados
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Separa los bloques izquierda y derecha al máximo
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 100 // Asegura que quede por encima del contenido
        }}>

            {/* =============================================
                BLOQUE IZQUIERDO: LOGO + MENÚ
            ============================================= */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>

                {/* LOGO */}
                <img src={logo} alt="Logo SEGA" style={{ width: '100px', marginBottom: '0px' }} />

                {/* Menu */}
                <nav style={{ display: 'flex', gap: '5px' }}>
                    {usuario.rol === 'Solicitante' && (
                        <>
                            <button style={btnStyle('solicitar')} onClick={() => cambiarVista('solicitar')}>Catálogo</button>
                            <button style={btnStyle('mis-prestamos')} onClick={() => cambiarVista('mis-prestamos')}>Mis Préstamos</button>
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


            {/* =============================================
                BLOQUE DERECHO: INFO USUARIO + SALIR
            ============================================= */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>

                {/* INFO DEL USUARIO */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{usuario.nombreCompleto} ({usuario.rol})</span>
                </div>

                {/* BOTÓN SALIR (Estilo solo texto) */}
                <button
                    onClick={onLogout}
                    style={{
                        background: 'transparent', // Sin fondo
                        border: 'none',            // Sin borde
                        color: 'white',            // Color blanco
                        padding: '10px 0',         // Quitamos padding lateral
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',         // Un poco más grueso para que destaque
                        textTransform: 'uppercase', // Opcional: en mayúsculas se ve elegante
                        letterSpacing: '1px',
                        opacity: 0.9,
                        transition: 'opacity 0.2s'
                    }}
                    // Efecto hover simple para que se ilumine al pasar el mouse
                    onMouseOver={(e) => e.target.style.opacity = '1'}
                    onMouseOut={(e) => e.target.style.opacity = '0.9'}
                >
                    Salir
                </button>
            </div>
        </header>
    );
}

export default Header;