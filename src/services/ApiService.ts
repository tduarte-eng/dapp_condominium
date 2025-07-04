import axios from './AxiosConfig';
import type { Profile } from './Web3Service';

const VITE_API_URL = `${import.meta.env.VITE_API_URL}`;

// Defina o tipo esperado da resposta
interface LoginResponse {
  token: string;
}

export async function doApiLogin(wallet: string, secret: string, timestamp: number): Promise<string> {
  const response = await axios.post<LoginResponse>(`${VITE_API_URL}/login`, { wallet, secret, timestamp });
  return response.data.token;
}

export type ApiResident = {
  wallet: string;
  name: string;
  profile: Profile;
  phone?: string;
  email?: string;
}

export async function getApiResident(wallet: string): Promise<ApiResident> {
  const response = await axios.get(`${VITE_API_URL}/residents/${wallet}`);
  return response.data as ApiResident ;  
}


export async function addApiResident(resident: ApiResident): Promise<ApiResident> {
  const response = await axios.post(`${VITE_API_URL}/residents/`, resident);
  return response.data as ApiResident ;  
}

export async function updateApiResident(wallet: string, resident: ApiResident): Promise<ApiResident> {
  const response = await axios.patch(`${VITE_API_URL}/residents/${wallet}`, resident);
  return response.data as ApiResident ;  
}

export async function deleteApiResident(wallet:string): Promise<void> {
  await axios.delete(`${VITE_API_URL}/residents/${wallet}`);
}