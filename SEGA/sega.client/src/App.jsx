import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';

// Vistas
import SolicitarPrestamo from './pages/SolicitarPrestamo';
import MisPrestamos from './pages/MisPrestamos';
import GestionPrestamos from './pages/GestionPrestamos';
import CrudEquipos from './pages/CrudEquipos';
import CrudUsuarios from './pages/CrudUsuarios';
import CrudCategorias from './pages/CrudCategorias';


function App() {
    const [usuario, setUsuario] = useState(null);
    const [vista, setVista] = useState('login');

    if (!usuario) {
        return <Login onLogin={(u) => {
            setUsuario(u);
            // Redirección inicial según rol
            if (u.rol === 'Solicitante') setVista('solicitar');
            if (u.rol === 'Gestor') setVista('gestion');
            if (u.rol === 'Administrador') setVista('equipos');
        }} />;
    }

    return (
        <div className="app-container">
            <Header usuario={usuario} vistaActual={vista} cambiarVista={setVista} onLogout={() => setUsuario(null)} />

            <main>
                {/* RUTAS SOLICITANTE */}
                {usuario.rol === 'Solicitante' && (
                    <>
                        {vista === 'solicitar' && <SolicitarPrestamo usuario={usuario} />}
                        {vista === 'mis-prestamos' && <MisPrestamos usuario={usuario} />}
                    </>
                )}

                {/* RUTAS GESTOR */}
                {usuario.rol === 'Gestor' && (
                    <>
                        {vista === 'gestion' && <GestionPrestamos />}
                    </>
                )}

                {/* RUTAS ADMINISTRADOR */}
                {usuario.rol === 'Administrador' && (
                    <>
                        {vista === 'equipos' && <CrudEquipos />}
                        {vista === 'usuarios' && <CrudUsuarios />}
                        {vista === 'categorias' && <CrudCategorias />}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default App;