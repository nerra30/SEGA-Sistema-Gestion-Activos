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
    { id: 4, nombre: "Cable USB", serial: "CAB-002", estado: 1, categoriaId: 3, categoria: { nombre: "Accesorios" } },
    { id: 5, nombre: "Mouse", serial: "Acc-001", estado: 1, categoriaId: 1, categoria: { nombre: "Accesorios" } },
    { id: 6, nombre: "Impresora HP", serial: "HP 500", estado: 1, categoriaId: 2, categoria: { nombre: "Audiovisual" } },
    { id: 7, nombre: "MacBook Pro", serial: "MAC-100", estado: 1, categoriaId: 1, categoria: { nombre: "Cómputo" } },
    { id: 8, nombre: "Teclado", serial: "hp-007", estado: 1, categoriaId: 3, categoria: { nombre: "Accesorios" } }
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
        id: 102, equipoId: 3, usuarioId: 3, fechaSolicitud: "2023-10-10", fechaLimite: "2026-10-12", estado: 1,
        equipo: { nombre: "MacBook Air" }, usuario: { nombreCompleto: "María Estudiante" }
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
    if (MODO_SIMULACION) return simularRed([...mockPrestamos]);
    return (await fetch(`${API_URL}/prestamos`)).json();
};

export const crearSolicitud = async (solicitud, dias) => {
    if (MODO_SIMULACION) {
        // 1. Agregar el préstamo
        mockPrestamos.push({
            id: Math.floor(Math.random() * 1000),
            ...solicitud,
            diasSolicitados: dias ? parseInt(dias) : 3, // Aca guardamos los dias
            estado: 1, // Pendiente
            equipo: mockEquipos.find(e => e.id === solicitud.equipoId) || { nombre: "Equipo Simulado" },
            usuario: { nombreCompleto: "Usuario Actual" }
        });

        // 2. Cambiamos el estado del equipo a "Prestado" (2) inmediatamente 
        // para que nadie más lo pida mientras está pendiente.
        const equipo = mockEquipos.find(e => e.id === solicitud.equipoId);
        if (equipo) equipo.estado = 2; // Lo marcamos como no disponible

        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos`, { method: "POST", headers: headersConfig, body: JSON.stringify(solicitud,dias) });
};

export const gestionarEstadoPrestamo = async (id, estado, nuevaFecha = null) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);

        if (p) {
            p.estado = estado; // Actualizamos estado

            // ¡ESTA ES LA CLAVE! Si llega una fecha nueva, la guardamos
            if (nuevaFecha) {
                p.fechaLimite = nuevaFecha;
            }

            // Sincronizar equipo (lógica visual)
            // Si aprobamos (2), el equipo pasa a Prestado (2)
            if (estado === 2) {
                const eq = mockEquipos.find(e => e.id === p.equipoId);
                if (eq) eq.estado = 2;
            }
            // Si rechazamos (4), el equipo se libera (1) por si acaso estaba reservado
            if (estado === 4) {
                const equipo = mockEquipos.find(e => e.id === p.equipoId);
                if (equipo) equipo.estado = 1;
            }
        }
        return simularRed({ ok: true });
    }
    // Backend Real
    return fetch(`${API_URL}/prestamos/${id}/estado`, {
        method: "PUT",
        headers: headersConfig,
        body: JSON.stringify({ estado, fechaLimite: nuevaFecha })
    });
};

export const finalizarPrestamo = async (id, estadoEquipo) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) {
            p.estado = 3; // Finalizado en el historial de préstamos

            // Actualizar el equipo real
            const eq = mockEquipos.find(e => e.id === p.equipoId);
            if (eq) {
                // Si el equipo volvió bien (1), queda Disponible (1)
                // Si volvió dañado (3), queda en Mantenimiento (3)
                eq.estado = estadoEquipo === 1 ? 1 : 3;
            }
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/finalizar`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ estadoEquipo }) });
};

// Solicitar Renovacióm
export const solicitarRenovacion = async (id, dias) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) {
            p.estado = 5; // En renovación
            p.diasSolicitados = parseInt(dias); // aca se guarda los dias
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/renovar`, { method: "PUT", body: JSON.stringify({ dias }) });
};


// Notificar Devolución
export const notificarDevolucion = async (id, nota) => {
    if (MODO_SIMULACION) {
        // Buscamos el préstamo 
        const p = mockPrestamos.find(pr => pr.id === id);

        if (p) {
            // Guardamos la nota en el objeto
            p.notaDevolucion = nota;
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/notificar`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ nota }) });
};