import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';

// =============================================
// IMPORTACIÓN DE VISTAS
// =============================================
import SolicitarPrestamo from './pages/SolicitarPrestamo';
import MisPrestamos from './pages/MisPrestamos';
import GestionPrestamos from './pages/GestionPrestamos';
import CrudEquipos from './pages/CrudEquipos';
import CrudUsuarios from './pages/CrudUsuarios';
import CrudCategorias from './pages/CrudCategorias';

/**
 * Componente Principal (App)
 */
function App() {
    // ESTADO GLOBAL 1: Almacena la información del usuario conectado. Si es null, nadie ha iniciado sesión.
    const [usuario, setUsuario] = useState(null);

    // ESTADO GLOBAL 2: Controla la "pestaña" o pantalla actual que se está mostrando.
    const [vista, setVista] = useState('login');

    // =============================================
    // PROTECCIÓN DE RUTAS (GUARDIA DE AUTENTICACIÓN)
    // =============================================
    // Si no hay un usuario en memoria, bloqueamos el acceso y renderizamos SOLO la pantalla de Login.
    if (!usuario) {
        return <Login onLogin={(u) => {
            setUsuario(u); // Guardamos al usuario que el Login nos devuelve como válido

            // REDIRECCIÓN INTELIGENTE:
            // Dependiendo del rol con el que entró, lo mandamos a su pantalla principal correspondiente.
            if (u.rol === 'Solicitante') setVista('mis-prestamos');
            if (u.rol === 'Gestor') setVista('gestion');
            if (u.rol === 'Administrador') setVista('equipos');
        }} />;
    }

    // Si el código llega hasta aquí, significa que SÍ hay un usuario validado.
    return (
        <div className="app-container">

            {/* CABECERA (Siempre visible si estás logueado)
                Le pasamos al Header quién es el usuario, en qué vista estamos, 
                y las funciones para cambiar de vista o cerrar sesión. */}
            <Header
                usuario={usuario}
                vistaActual={vista}
                cambiarVista={setVista}
                onLogout={() => setUsuario(null)} // Al poner null, el "if(!usuario)" de arriba vuelve a dispararse y nos saca al Login
            />

            {/* CONTENEDOR PRINCIPAL DE PANTALLAS */}
            <main>

                {/* =============================================
                    RUTAS EXCLUSIVAS PARA: SOLICITANTE
                ============================================= */}
                {usuario.rol === 'Solicitante' && (
                    <>
                        {/* Renderizado condicional: Solo dibuja el componente si "vista" coincide */}
                        {vista === 'solicitar' && <SolicitarPrestamo usuario={usuario} />}
                        {vista === 'mis-prestamos' && <MisPrestamos usuario={usuario} />}
                    </>
                )}

                {/* =============================================
                    RUTAS EXCLUSIVAS PARA: GESTOR
                ============================================= */}
                {usuario.rol === 'Gestor' && (
                    <>
                        {vista === 'gestion' && <GestionPrestamos />}
                    </>
                )}

                {/* =============================================
                    RUTAS EXCLUSIVAS PARA: ADMINISTRADOR
                ============================================= */}
                {usuario.rol === 'Administrador' && (
                    <>
                        {vista === 'equipos' && <CrudEquipos />}
                        {vista === 'usuarios' && <CrudUsuarios />}
                        {vista === 'categorias' && <CrudCategorias />}
                    </>
                )}
            </main>

            {/* PIE DE PÁGINA (Siempre visible si estás logueado) */}
            <Footer />
        </div>
    );
}

export default App;