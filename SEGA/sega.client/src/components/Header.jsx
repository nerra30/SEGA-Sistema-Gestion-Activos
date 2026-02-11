function Header({ usuario, vistaActual, cambiarVista, onLogout }) {
    const btnStyle = (v) => ({
        padding: '10px 15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer',
        borderBottom: vistaActual === v ? '3px solid white' : 'none', fontWeight: vistaActual === v ? 'bold' : 'normal'
    });

    return (
        <header style={{ background: '#0078D4', color: 'white', padding: '15px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
                <h2 style={{ margin: 0 }}>SEGA</h2>
                <small>{usuario.nombre} ({usuario.rol})</small>
            </div>
            <nav>
                {/* MENÚ SOLICITANTE */}
                {usuario.rol === 'Solicitante' && (
                    <>
                        <button style={btnStyle('solicitar')} onClick={() => cambiarVista('solicitar')}>Catálogo</button>
                        <button style={btnStyle('mis-prestamos')} onClick={() => cambiarVista('mis-prestamos')}>Mis Préstamos</button>
                    </>
                )}

                {/* MENÚ GESTOR */}
                {usuario.rol === 'Gestor' && (
                    <button style={btnStyle('gestion')} onClick={() => cambiarVista('gestion')}>Panel de Gestión</button>
                )}

                {/* MENÚ ADMINISTRADOR */}
                {usuario.rol === 'Administrador' && (
                    <>
                        <button style={btnStyle('usuarios')} onClick={() => cambiarVista('usuarios')}>Usuarios</button>
                        <button style={btnStyle('equipos')} onClick={() => cambiarVista('equipos')}>Equipos</button>
                        <button style={btnStyle('categorias')} onClick={() => cambiarVista('categorias')}>Categorías</button>
                    </>
                )}
            </nav>
            <button onClick={onLogout} style={{ background: '#d13438', color: 'white', border: 'none', padding: '5px 10px' }}>Salir</button>
        </header>
    );
}
export default Header;