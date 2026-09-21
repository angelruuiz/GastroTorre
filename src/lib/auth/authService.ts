// ==============================================================================
// 🏛️ GASTROTORRE — SERVICIO DE AUTENTICACIÓN Y CONTROL DE ACCESO
// ==============================================================================
// Roles: 'superadmin' (Ángel Ruiz) | 'owner' (Hostelero de restaurante)
// ==============================================================================

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  passwordHash: string; // Plain/hash for internal matching
  name: string;
  role: 'superadmin' | 'owner';
  restaurantId?: string;
  restaurantSlug?: string;
  restaurantName?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

const STORAGE_KEYS = {
  USERS: 'gastrotorre_auth_accounts_v3',
  SESSION: 'gastrotorre_active_session_v3',
};

// Cuentas iniciales del sistema (Superadmin y Hosteleros Piloto)
export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin',
    email: 'admin@gastrotorre.es',
    username: 'admin',
    passwordHash: 'wEyzye9b', // Contraseña de SUPERADMIN solicitada
    name: 'Ángel Ruiz (Superadmin)',
    role: 'superadmin',
    createdAt: '2026-01-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-jarales',
    email: 'jarales@gastrotorre.es',
    username: 'jarales',
    passwordHash: 'Jarales2026!',
    name: 'Asador Los Jarales',
    role: 'owner',
    restaurantId: 'asador-los-jarales',
    restaurantSlug: 'asador-los-jarales',
    restaurantName: 'Asador Los Jarales',
    createdAt: '2026-01-15T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-latavola',
    email: 'latavola@gastrotorre.es',
    username: 'latavola',
    passwordHash: 'Tavola2026!',
    name: 'La Tavola di Torrelodones',
    role: 'owner',
    restaurantId: 'la-tavola',
    restaurantSlug: 'la-tavola',
    restaurantName: 'La Tavola di Torrelodones',
    createdAt: '2026-01-20T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-olivo',
    email: 'olivo@gastrotorre.es',
    username: 'olivo',
    passwordHash: 'Olivo2026!',
    name: 'Bistró El Olivo',
    role: 'owner',
    restaurantId: 'el-olivo-bistro',
    restaurantSlug: 'el-olivo-bistro',
    restaurantName: 'Bistró El Olivo',
    createdAt: '2026-02-01T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-smash',
    email: 'smash@gastrotorre.es',
    username: 'smash',
    passwordHash: 'Smash2026!',
    name: 'Torre Smash & Brew',
    role: 'owner',
    restaurantId: 'torre-smash',
    restaurantSlug: 'torre-smash',
    restaurantName: 'Torre Smash & Brew',
    createdAt: '2026-02-10T00:00:00Z',
    isActive: true,
  },
  {
    id: 'usr-huerta',
    email: 'huerta@gastrotorre.es',
    username: 'huerta',
    passwordHash: 'Huerta2026!',
    name: 'Café & Brunch La Huerta',
    role: 'owner',
    restaurantId: 'la-huerta-brunch',
    restaurantSlug: 'la-huerta-brunch',
    restaurantName: 'Café & Brunch La Huerta',
    createdAt: '2026-02-15T00:00:00Z',
    isActive: true,
  },
];

export class AuthService {
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Obtener todas las cuentas de usuario registradas
  public static getUsers(): UserAccount[] {
    if (!this.isClient()) return INITIAL_ACCOUNTS;
    const stored = localStorage.getItem(STORAGE_KEYS.USERS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_ACCOUNTS));
    return INITIAL_ACCOUNTS;
  }

  // Guardar lista de cuentas
  public static saveUsers(users: UserAccount[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  // Autenticar usuario con usuario/email y contraseña
  public static login(identifier: string, password: string): { success: boolean; user?: UserAccount; error?: string } {
    const cleanId = identifier.trim().toLowerCase();
    const users = this.getUsers();

    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) &&
        u.passwordHash === password
    );

    if (!user) {
      return { success: false, error: 'Usuario o contraseña incorrectos.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Esta cuenta ha sido desactivada por el administrador.' };
    }

    // Actualizar último login
    const updatedUser = { ...user, lastLogin: new Date().toISOString() };
    const updatedList = users.map((u) => (u.id === user.id ? updatedUser : u));
    this.saveUsers(updatedList);

    // Guardar sesión activa
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(updatedUser));
    }

    return { success: true, user: updatedUser };
  }

  // Obtener sesión activa actual
  public static getCurrentUser(): UserAccount | null {
    if (!this.isClient()) return null;
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Cerrar sesión
  public static logout(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // --------------------------------------------------------------------------
  // MÉTODOS EXCLUSIVOS DE SUPERADMIN
  // --------------------------------------------------------------------------

  // Cambiar contraseña de cualquier usuario
  public static changePassword(userId: string, newPassword: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return false;

    users[index].passwordHash = newPassword;
    this.saveUsers(users);

    // Si es el usuario actual, actualizar la sesión
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.passwordHash = newPassword;
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(current));
    }

    return true;
  }

  // Crear nueva cuenta de hostelero
  public static createHosteleroAccount(account: {
    email: string;
    username: string;
    password: string;
    name: string;
    restaurantId: string;
    restaurantSlug: string;
    restaurantName: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    const users = this.getUsers();
    const exists = users.some(
      (u) =>
        u.email.toLowerCase() === account.email.toLowerCase() ||
        u.username.toLowerCase() === account.username.toLowerCase()
    );

    if (exists) {
      return { success: false, error: 'Ya existe un usuario con este correo electrónico o nombre de usuario.' };
    }

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      email: account.email,
      username: account.username,
      passwordHash: account.password,
      name: account.name,
      role: 'owner',
      restaurantId: account.restaurantId,
      restaurantSlug: account.restaurantSlug,
      restaurantName: account.restaurantName,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    users.push(newUser);
    this.saveUsers(users);
    return { success: true, user: newUser };
  }

  // Activar / Desactivar cuenta
  public static toggleAccountStatus(userId: string): boolean {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return false;

    // No permitir desactivar al superadmin principal
    if (users[index].role === 'superadmin') return false;

    users[index].isActive = !users[index].isActive;
    this.saveUsers(users);
    return true;
  }

  // Eliminar cuenta
  public static deleteAccount(userId: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user || user.role === 'superadmin') return false;

    const filtered = users.filter((u) => u.id !== userId);
    this.saveUsers(filtered);
    return true;
  }
}
