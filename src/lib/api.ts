const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginResponse {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  message?: string;
}

export const adminLogin = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  
  // Store token in localStorage if present
  if (data.accessToken) {
    localStorage.setItem("auth_token", data.accessToken);
  }

  return data;
};

export const logout = () => {
  localStorage.removeItem("auth_token");
};

export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// Client Management APIs

export interface Client {
  _id: string;
  client_id?: string;
  client_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  business_type: string;
  sub_domain_name?: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
  amount_per_month?: number;
  paid_months?: number;
  createdAt?: string;
  updatedAt?: string;
  whatsapp_token?: string;
  currency_id?: {
    _id: string;
    name: string;
    symbol: string;
    code: string;
  } | null;
}

export interface ClientsResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  clients: Client[];
}

export interface CreateClientData {
  client_id?: string;
  client_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  business_type: string;
  sub_domain_name?: string;
  start_date: string;
  end_date: string;
  status: string;
  notes?: string;
  amount_per_month?: number;
  paid_months?: number;
}

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getClients = async (page = 1, limit = 25): Promise<ClientsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/clients?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch clients");
  }

  return data;
};

export const addClient = async (clientData: CreateClientData): Promise<Client> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/clients`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(clientData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add client");
  }

  return data;
};

export const updateClient = async (id: string, clientData: Partial<CreateClientData>): Promise<Client> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/clients/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(clientData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update client");
  }

  return data;
};

export const changeClientStatus = async (id: string, status: string): Promise<Client> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/clients/${id}/change-status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to change client status");
  }

  return data;
};

export const deleteClient = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/clients/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to delete client");
  }
};

// Currency Management APIs

export interface Currency {
  _id: string;
  name: string;
  symbol: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCurrencyData {
  name: string;
  symbol: string;
  code: string;
}

export const getCurrencies = async (): Promise<Currency[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/currencies/`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch currencies");
  }

  return data;
};

export const addCurrency = async (currencyData: CreateCurrencyData): Promise<Currency> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/currencies`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(currencyData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add currency");
  }

  return data;
};

export const updateCurrency = async (id: string, currencyData: Partial<CreateCurrencyData>): Promise<Currency> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/currencies/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(currencyData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update currency");
  }

  return data;
};

export const setupDefaultCurrencies = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/currencies/setup-defaults`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || "Failed to setup default currencies");
  }
};

// Dashboard Analytics APIs

export interface DashboardAnalytics {
  overview: {
    total_clients: number;
    active_clients: number;
    inactive_clients: number;
    total_revenue: number;
    expiring_soon_count: number;
  };
  expiring_soon_clients: Array<{
    _id: string;
    client_id?: string;
    client_name: string;
    email: string;
    business_name: string;
    end_date: string;
    amount_per_month?: number;
    paid_months?: number;
  }>;
  recently_expired_clients: Array<{
    _id: string;
    client_id?: string;
    client_name: string;
    email: string;
    business_name: string;
    end_date: string;
    amount_per_month?: number;
    paid_months?: number;
  }>;
  revenue_by_month: Array<{
    _id: string;
    clients_joined: number;
    revenue: number;
  }>;
  business_type_stats: Array<{
    _id: string;
    count: number;
    total_revenue: number;
    active_count: number;
  }>;
  top_clients: Array<{
    _id: string;
    client_id?: string;
    client_name: string;
    email: string;
    business_name: string;
    start_date: string;
    end_date: string;
    status: string;
    amount_per_month?: number;
    paid_months?: number;
    total_revenue?: number | null;
  }>;
}

export const getDashboardAnalytics = async (): Promise<DashboardAnalytics> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/analytics/dashboard`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch dashboard analytics");
  }

  return data;
};
