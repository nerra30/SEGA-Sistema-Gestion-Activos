// INTERRUPTOR DE MODO (true = Usa datos en memoria para pruebas, false = Conecta al backend en C#)
const MODO_SIMULACION = true;

// URL base para el backend real
const API_URL = "https://localhost:7164/api";
const headersConfig = { "Content-Type": "application/json; charset=UTF-8" };

// ==========================================
// DATOS FALSOS (MOCKS) - BASE DE DATOS EN MEMORIA
// ==========================================
// Estos arreglos simulan las tablas de una base de datos cuando MODO_SIMULACION está activo.

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
    { id: 2, nombreCompleto: "Juan Pérez", email: "juan@sega.com", password: "123", rolId: 2 }, // Gestor
    { id: 3, nombreCompleto: "María Sánchez", email: "maria@sega.com", password: "123", rolId: 3 } // Solicitante
];

let mockPrestamos = [
    {
        id: 101, equipoId: 2, usuarioId: 3, fechaSolicitud: "2023-10-01", fechaLimite: "2023-10-05", estado: 2,
        equipo: { nombre: "Proyector Epson" }, usuario: { nombreCompleto: "María Sánchez" }
    },
    {
        id: 102, equipoId: 3, usuarioId: 3, fechaSolicitud: "2023-10-10", fechaLimite: "2025-11-12", estado: 2,
        equipo: { nombre: "MacBook Air" }, usuario: { nombreCompleto: "María Sánchez" }
    }
];

// ==========================================
// HELPER PARA SIMULAR RETRASO DE RED
// ==========================================
/**
 * Envuelve las respuestas simuladas en una Promesa con un `setTimeout`.
 * Esto imita el tiempo de latencia que tomaría una petición real a un servidor.
 */
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
// Todas las funciones exportadas aquí verifican primero el MODO_SIMULACION.
// Si es true, operan sobre los arreglos de arriba.
// Si es false, hacen peticiones fetch() reales al backend.

// --- CRUD USUARIOS ---
export const getUsuarios = async () => {
    if (MODO_SIMULACION) return simularRed(mockUsuarios);
    return (await fetch(`${API_URL}/usuarios`)).json();
};

export const crearUsuario = async (usuario) => {
    if (MODO_SIMULACION) {
        usuario.id = mockUsuarios.length + 1; // Auto-incremento de ID básico
        mockUsuarios.push(usuario);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/usuarios`, { method: "POST", headers: headersConfig, body: JSON.stringify(usuario) });
};

export const actualizarUsuario = async (id, usuario) => {
    if (MODO_SIMULACION) {
        const index = mockUsuarios.findIndex(u => u.id === id);
        // Mezcla los datos existentes con los datos modificados
        if (index !== -1) mockUsuarios[index] = { ...mockUsuarios[index], ...usuario };
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

// --- CRUD CATEGORÍAS ---
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
    if (MODO_SIMULACION) {
        const index = mockCategorias.findIndex(c => c.id === id);
        if (index !== -1) {
            mockCategorias[index] = { ...mockCategorias[index], ...cat };
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/categorias/${id}`, { method: "PUT", headers: headersConfig, body: JSON.stringify(cat) });
};

export const eliminarCategoria = async (id) => {
    if (MODO_SIMULACION) {
        mockCategorias = mockCategorias.filter(c => c.id !== id);
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/categorias/${id}`, { method: "DELETE" });
};

// --- CRUD EQUIPOS ---
export const getEquipos = async () => {
    if (MODO_SIMULACION) return simularRed(mockEquipos);
    return (await fetch(`${API_URL}/equipos`)).json();
};

export const crearEquipo = async (equipo) => {
    if (MODO_SIMULACION) {
        equipo.id = mockEquipos.length + 1;
        // Simulamos la relación (JOIN) con la tabla categoría
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

        if (idx !== -1) {
            // Buscamos la categoría real para actualizar el nombre visual en la tabla
            const cat = mockCategorias.find(c => c.id === equipo.categoriaId);

            mockEquipos[idx] = {
                ...mockEquipos[idx],
                ...equipo,
                categoria: cat ? { nombre: cat.nombre } : { nombre: "Sin Cat" }
            };
        }
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

// --- GESTIÓN DE PRÉSTAMOS ---
export const getPrestamos = async () => {
    // Usamos el operador spread [...] para retornar una copia limpia y evitar mutaciones accidentales
    if (MODO_SIMULACION) return simularRed([...mockPrestamos]);
    return (await fetch(`${API_URL}/prestamos`)).json();
};

export const crearSolicitud = async (solicitud, dias) => {
    if (MODO_SIMULACION) {
        // Buscamos al usuario que hace la solicitud para anexar su nombre
        const usuarioEncontrado = mockUsuarios.find(u => u.id === solicitud.usuarioId);

        // 1. Agregar el nuevo registro de préstamo
        mockPrestamos.push({
            id: Math.floor(Math.random() * 1000), // Generamos un ID aleatorio (simulación)
            ...solicitud,
            diasSolicitados: dias ? parseInt(dias) : 3, // Guardamos los días para que el Gestor los vea
            estado: 1, // Inicia en estado 1 (Pendiente)
            equipo: mockEquipos.find(e => e.id === solicitud.equipoId) || { nombre: "Equipo Simulado" },
            usuario: usuarioEncontrado
                ? { nombreCompleto: usuarioEncontrado.nombreCompleto }
                : { nombreCompleto: "Usuario Desconocido" }
        });

        // 2. Bloquear el equipo (Cambio visual a "Prestado")
        // Así evitamos que otra persona solicite el mismo equipo mientras está en cola de aprobación
        const equipo = mockEquipos.find(e => e.id === solicitud.equipoId);
        if (equipo) equipo.estado = 2;

        return simularRed({ ok: true });
    }

    // Backend real: Mandamos los días solicitados integrados en el cuerpo JSON
    return fetch(`${API_URL}/prestamos`, {
        method: "POST",
        headers: headersConfig,
        body: JSON.stringify({ ...solicitud, diasSolicitados: dias })
    });
};

/**
 * Función que usa el Gestor para aprobar (2) o rechazar (4) préstamos o renovaciones.
 * También recalcula fechas límites cuando aprueba extensiones.
 */
export const gestionarEstadoPrestamo = async (id, estado, nuevaFecha = null) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);

        if (p) {
            p.estado = estado; // Actualizamos estado del trámite

            // Si el gestor aprobó días extra, sobreescribimos la fecha de vencimiento
            if (nuevaFecha) {
                p.fechaLimite = nuevaFecha;
            }

            // Lógica colateral: Sincronizar estado físico del equipo
            // Si el préstamo fue aprobado (2), el equipo se marca como prestado (2)
            if (estado === 2) {
                const eq = mockEquipos.find(e => e.id === p.equipoId);
                if (eq) eq.estado = 2;
            }
            // Si el préstamo fue rechazado (4), el equipo vuelve a estar disponible (1)
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

/**
 * Cierra un trámite y dictamina si el equipo devuelto está operativo o roto.
 */
export const finalizarPrestamo = async (id, estadoEquipo) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) {
            p.estado = 3; // Estado 3 = Trámite Finalizado/Cerrado

            // Actualizar el estado físico del equipo real
            const eq = mockEquipos.find(e => e.id === p.equipoId);
            if (eq) {
                // Si estadoEquipo = 1 -> Queda Disponible de nuevo
                // Si estadoEquipo = 3 -> Se envía a Mantenimiento
                eq.estado = estadoEquipo === 1 ? 1 : 3;
            }
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/finalizar`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ estadoEquipo }) });
};

// --- ACCIONES DEL SOLICITANTE ---

/**
 * Pone un préstamo activo en modo de evaluación para extender tiempo.
 */
export const solicitarRenovacion = async (id, dias) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) {
            p.estado = 5; // Pasa a estado 5 (En Renovación)
            p.diasSolicitados = parseInt(dias); // Se guardan los días para que el Gestor los dictamine
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/renovar`, { method: "PUT", body: JSON.stringify({ dias }) });
};

/**
 * Deja un comentario adjunto al préstamo cuando el alumno entrega el equipo de forma autónoma.
 */
export const notificarDevolucion = async (id, nota) => {
    if (MODO_SIMULACION) {
        const p = mockPrestamos.find(pr => pr.id === id);
        if (p) {
            p.notaDevolucion = nota; // Anexa el comentario al objeto
        }
        return simularRed({ ok: true });
    }
    return fetch(`${API_URL}/prestamos/${id}/notificar`, { method: "PUT", headers: headersConfig, body: JSON.stringify({ nota }) });
};