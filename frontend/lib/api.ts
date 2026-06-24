import axios from "axios";
import Cookies from "js-cookie";

export const CELLULES_MAROC = [
  { value: "TANGER_TETOUAN_OUJDA", label: "Cellule Tanger-Tétouan-Oujda" },
  { value: "KENITRA",              label: "Cellule Kénitra" },
  { value: "AGADIR",               label: "Cellule Agadir" },
  { value: "RABAT_SALE",           label: "Cellule Rabat-Salé" },
  { value: "LAAYOUNE_DAKHLA",      label: "Cellule Laâyoune-Dakhla" },
  { value: "FEZ_MEKNES",           label: "Cellule Fès-Meknès" },
  { value: "CASABLANCA",           label: "Cellule Casablanca" },
  { value: "MARRAKECH",            label: "Cellule Marrakech" },
  { value: "AUTRE",                label: "Autre cellule" },
];

export const VILLES_MAROC = [
  "Agadir", "Al Hoceima", "Azilal", "Azrou", "Béni Mellal", "Berkane",
  "Berrechid", "Casablanca", "Chefchaouen", "Dakhla", "El Jadida",
  "Errachidia", "Essaouira", "Fès", "Guelmim", "Ifrane", "Inezgane",
  "Kénitra", "Khémisset", "Khouribga", "Laâyoune", "Larache",
  "Marrakech", "Meknès", "Midelt", "Mohammedia", "Nador",
  "Ouarzazate", "Oujda", "Rabat", "Safi", "Salé", "Settat",
  "Sidi Kacem", "Sidi Slimane", "Tan-Tan", "Tanger", "Taroudant",
  "Taourirt", "Taza", "Temara", "Tétouan", "Tiznit", "Zagora",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Injecte le token JWT sur chaque requête
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rafraîchit le token si expiré (401)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = Cookies.get("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh,
          });
          Cookies.set("access_token", data.access, { expires: 1 });
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/login";
        }
      } else {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/token/", { username, password }),
  refresh: (refresh: string) =>
    api.post("/auth/token/refresh/", { refresh }),
};

// ─── Référentiels ─────────────────────────────────────────────────────────────
export const referentielsApi = {
  getCycles: () => api.get("/referentiels/cycles/"),
  getDomaines: () => api.get("/referentiels/domaines/"),
  getFilieres: (domaineId?: number) =>
    api.get("/referentiels/filieres/", { params: domaineId ? { domaine: domaineId } : {} }),
  getNiveaux: () => api.get("/referentiels/niveaux/"),
};

// ─── Membres ──────────────────────────────────────────────────────────────────
export const membresApi = {
  list: (params?: Record<string, unknown>) => api.get("/membres/", { params }),
  get: (id: number) => api.get(`/membres/${id}/`),
  create: (data: unknown) => api.post("/membres/", data),
  update: (id: number, data: unknown) => api.put(`/membres/${id}/`, data),
  delete: (id: number) => api.delete(`/membres/${id}/`),
  exportExcel: (params?: Record<string, unknown>) =>
    api.get("/membres/export-excel/", { params, responseType: "blob" }),
  templateImport: () =>
    api.get("/membres/template-import/", { responseType: "blob" }),
  importExcel: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/membres/import-excel/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  importPdf: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/membres/import-pdf/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  etudiants: (params?: Record<string, unknown>) =>
    api.get("/membres/etudiants/", { params }),
};

// ─── Cotisations ──────────────────────────────────────────────────────────────
export const cotisationsApi = {
  list: (params?: Record<string, unknown>) => api.get("/cotisations/", { params }),
  get: (id: number) => api.get(`/cotisations/${id}/`),
  create: (data: unknown) => api.post("/cotisations/", data),
  update: (id: number, data: unknown) => api.put(`/cotisations/${id}/`, data),
  resumeMembre: (membreId: number) =>
    api.get(`/cotisations/resume-membre/${membreId}/`),
  exportExcel: (params?: Record<string, unknown>) =>
    api.get("/cotisations/export-excel/", { params, responseType: "blob" }),
  payer: (id: number, data: { montant_paye: number; mode_paiement: string; commentaire?: string }) =>
    api.post(`/cotisations/${id}/payer/`, data),
  genererTrimestre: (annee: number, trimestre: number) =>
    api.post("/cotisations/generer-trimestre/", { annee, trimestre }),
  tarifsApi: {
    list: (params?: Record<string, unknown>) =>
      api.get("/tarifs-cotisation/", { params }),
    create: (data: unknown) => api.post("/tarifs-cotisation/", data),
    update: (id: number, data: unknown) =>
      api.put(`/tarifs-cotisation/${id}/`, data),
  },
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get("/dashboard/stats/"),
  membresByCycle: () => api.get("/dashboard/membres-par-cycle/"),
  cotisationsRetard: (annee?: number, trimestre?: number) =>
    api.get("/dashboard/cotisations-retard/", {
      params: { annee, trimestre },
    }),
};

export default api;
