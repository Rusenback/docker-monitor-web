import axios from 'axios';
import type {Container, ContainerStats } from '../types/container'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create ({
  baseURL: API_URL,
  timeout: 50000,
});

export const GetContainer = async (): Promise<Container[]> => {
  const response = await api.get<Container[]>('/api/containers');
  return response.data
}

export const GetContainerStats = async (id: string): Promise<ContainerStats> => {
  const response = await api.get<ContainerStats>(`/api/containers/${id}/stats`);
  return response.data;
}
