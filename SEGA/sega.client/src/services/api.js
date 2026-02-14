// INTERRUPTOR DE MODO (true = Simulación, false = Backend Real)
const MODO_SIMULACION = true;

const API_URL = "https://localhost:7164/api";
const headersConfig = { "Content-Type": "application/json; charset=UTF-8" };

// ==========================================
// DATOS FALSOS (MOCKS)
// ==========================================
let mockCategorias = [
    { id: 1, nombre: "Cómputo", descripcion: "Laptops y Tablets" },
    { id: 2, nombre: "Audiovisual", descripcion: "Proyectores y Pantallas" },
    { id: 3, nombre: "Accesorios", descripcion: "Cables y adaptadores" }
];

let mockEquipos = [
    { id: 1, nombre: "Laptop Dell Latitude", serial: "DELL-001", estado: 1, categoriaId: 1, categoria: { nombre: "Cómputo" } },
    { id: 2, nombre: "Proyector Epson", serial: "EPSON-X", estado: 2, categoriaId: 2, categoria: { nombre: "Audiovisual" } },
    { id: 3, nombre: "MacBook Air", serial: "MAC-005", estado: 3, categoriaId: 1, categoria: { nombre: "Cómputo" } },
    { id: 4, nombre: "Cable HDMI 10m", serial: "CAB-001", estado: 1, categoriaId: 3, categoria: { nombre: "Accesorios" } }
];

let mockUsuarios = [
    { id: 1, nombreCompleto: "Admin Sistema", email: "admin@sega.com", password: "123", rolId: 1 }, // Admin
    { id: 2, nombreCompleto: "Juan Pérez", email: "juan@escuela.edu", password: "123", rolId: 2 }, // Gestor
    { id: 3, nombreCompleto: "María Estudiante", email: "maria@escuela.edu", password: "123", rolId: 3 } // Solicitante
];

let mockPrestamos = [
    {
        id: 101, equipoId: 2, usuarioId: 3, fechaSolicitud: "2023-10-01", fechaLimite: "2023-10-05", estado: 2,
        equipo: { nombre: "Proyector Epson" }, usuario: { nombreCompleto: "María Estudiante" }
    },
    {
        id: 102, equipoId: 3, usuarioId: 2, fechaSolicitud: "2023-10-10", fechaLimite: "2023-10-12", estado: 1,
        equipo: { nombre: "MacBook Air" }, usuario: { nombreCompleto: "Juan Pérez" }
    }
];

// ==========================================
// HELPER PARA SIMULAR RETRASO DE RED
// ==========================================
const simularRed = (data) => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(" [MOCK API] Retornando datos:", data);
            resolve(data);
        }, 500); // 0.5 segundos de "lag" para realismo
    });
};

// ==========================================
// SERVICIOS (LÓGICA HÍBRIDA)
// ==========================================

// --- USUARIOS ---
export const getUsuarios = async () => {
    if (MODO_SIMULACION) return simularRed(mockUsuarios);
    return (await fetch(`${API_URL}/usuarios`)).json();
};

export const crearUsuario = async (usuario) => {
    if (MODO_SIMULACION) {
        usuario.id = mockUsuarios.length + 1;
        mockUsuarios.push(usuario);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/usuarios`, { method: "POST", headers: headersConfig, body: JSON.stringify(usuario) });
};

export const actualizarUsuario = async (id, usuario) => {
    if (MODO_SIMULACION) {
        const index = mockUsuarios.findIndex(u => u.id === id);
        if (index !== -1) mockUsuarios[index] = usuario;
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/usuarios/${id}`, { method: "PUT", headers: headersConfig, body: JSON.stringify(usuario) });
};

export const eliminarUsuario = async (id) => {
    if (MODO_SIMULACION) {
        mockUsuarios = mockUsuarios.filter(u => u.id !== id);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/usuarios/${id}`, { method: "DELETE" });
};

// --- CATEGORÍAS ---
export const getCategorias = async () => {
    if (MODO_SIMULACION) return simularRed(mockCategorias);
    return (await fetch(`${API_URL}/categorias`)).json();
};

export const crearCategoria = async (cat) => {
    if (MODO_SIMULACION) {
        cat.id = mockCategorias.length + 1;
        mockCategorias.push(cat);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/categorias`, { method: "POST", headers: headersConfig, body: JSON.stringify(cat) });
};

export const actualizarCategoria = async (id, cat) => {
    if (MODO_SIMULACION) return simularRed({ ok: true }); // Simplificado
    return fetch(`${API_URL}/categorias/${id}`, { method: "PUT", headers: headersConfig, body: JSON.stringify(cat) });
};

export const eliminarCategoria = async (id) => {
    if (MODO_SIMULACION) {
        mockCategorias = mockCategorias.filter(c => c.id !== id);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/categorias/${id}`, { method: "DELETE" });
};

// --- EQUIPOS ---
export const getEquipos = async () => {
    if (MODO_SIMULACION) return simularRed(mockEquipos);
    return (await fetch(`${API_URL}/equipos`)).json();
};

export const crearEquipo = async (equipo) => {
    if (MODO_SIMULACION) {
        equipo.id = mockEquipos.length + 1;
        // Simulamos la relación con categoría
        const cat = mockCategorias.find(c => c.id == equipo.categoriaId);
        equipo.categoria = cat ? { nombre: cat.nombre } : { nombre: "Sin Cat" };
        mockEquipos.push(equipo);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/equipos`, { method: "POST", headers: headersConfig, body: JSON.stringify(equipo) });
};

export const actualizarEquipo = async (id, equipo) => {
    if (MODO_SIMULACION) {
        const idx = mockEquipos.findIndex(e => e.id === id);
        if (idx !== -1) mockEquipos[idx] = { ...mockEquipos[idx], ...equipo };
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/equipos/${id}`, { method: "PUT", headers: headersConfig, body: JSON.stringify(equipo) });
};

export const eliminarEquipo = async (id) => {
    if (MODO_SIMULACION) {
        mockEquipos = mockEquipos.filter(e => e.id !== id);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/equipos/${id}`, { method: "DELETE" });
};

// --- PRÉSTAMOS ---
export const getPrestamos = async () => {
    if (MODO_SIMULACION) return simularRed(mockPrestamos);
    return (await fetch(`${API_URL}/prestamos`)).json();
};

export const crearSolicitud = async (solicitud) => {
    if (MODO_SIMULACION) {
        mockPrestamos.push({
            id: Math.floor(Math.random() * 1000),
            ...solicitud,
            estado: 1, // Pendiente
            equipo: mockEquipos.find(e => e.id === solicitud.equipoId) || { nombre: "Equipo Simulado" },
            usuario: { nombreCompleto: "Usuario Actual" } // Simplificado
        });
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos`, { method: "POST", headers: headersConfig, body: JSON.stringify(solicitud) });
};

export const gestionarEstadoPrestamo = async (id, estado) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) p.estado = estado;
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/estado`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ estado }) });
};

export const finalizarPrestamo = async (id, estadoEquipo) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) {
            p.estado = 3; // Finalizado
            // Actualizar estado del equipo simulado
            const eq = mockEquipos.find(e => e.id === p.equipoId);
            if (eq) eq.estado = estadoEquipo; // 1: Bueno, 3: Malo
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/finalizar`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ estadoEquipo }) });
};

export const solicitarRenovacion = async (id) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) p.estado = 5; // En renovación
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/renovar`, { method: "PUT" });
};

export const notificarDevolucion = async (id, nota) => {
    if (MODO_SIMULACION) return simularRed({ ok: true });
    return fetch(`${API_URL}/prestamos/${id}/notificar`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ nota }) });
};