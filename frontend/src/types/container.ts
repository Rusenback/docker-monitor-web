export interface Container {
  id: string;
  name: string; 
  image: string;
  state: string;
  status: string;
}

export interface ContainerStats {
  container_id: string;
  cpu_percent: number; 
  memory_usage: number;
  memory_limit: number;
  memory_percent: number;
}

export interface ContainerWithStats extends ContainerStats {
  name?: string;
  image?: string;
  state?: string;
  status?: string;
}
