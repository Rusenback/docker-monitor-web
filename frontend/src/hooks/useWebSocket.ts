import  { useEffect, useState } from 'react';
import type { Container, ContainerStats } from '../types/container';
import {GetContainer } from '../api/client'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws.//localhost:8080/ws';

interface HistoricalData {
  timestamp: number;
  cpu_percent: number;
  memory_percent: number;
}

export const useWebSocket = () => {
  const [stats, setStats] = useState<ContainerStats[]>([]);
  const [connected, setConnected] = useState(false);
  const [containers, setContainers] = useState<Container[]>([]);
  const [history, setHistory] = useState<Record<string, HistoricalData[]>>({});

  useEffect(() => {
    const fetchContainers = async () => {
      try {
        const data = await GetContainer();
        setContainers(data);
      } catch (error) {
        console.error('Failed to fetch containers:', error);
      }
    };

    fetchContainers();

    const interval = setInterval(fetchContainers, 30000);
    return () => clearInterval(interval)
  }, []);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const statsData = JSON.parse(event.data) as ContainerStats[];
        const timestamp = Date.now();

        const mergeData: ContainerStats[] = statsData.map(stat => {
          const container = containers.find(c => c.id.startsWith(stat.container_id.slice(0, 12)));
          return {
            ...stat, 
            name: container?.name,
            image: container?.image,
            state: container?.state,
            status: container?.status,
          };
        });

        setStats(mergeData);

        setHistory(prev => {
        const newHistory = {...prev};

          statsData.forEach(stat => {
            const id = stat.container_id;
            const dataPoint: HistoricalData = {
              timestamp: timestamp,
              cpu_percent: stat.cpu_percent,
              memory_percent: stat.memory_percent,
            };

            const containerHistory = [...(newHistory[id] || []), dataPoint].slice(-30);
            newHistory[id] = containerHistory;
            
          });
          return newHistory;
        });
      } catch (error) {
        console.error('failed to parse WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [containers]);

  return {stats, connected, history};
};
