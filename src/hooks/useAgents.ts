import { useState, useEffect } from 'react';
import { mockAgents } from '../mocks/mockApi';

const isDev = false;

export function useAgents() {
  const [agents, setAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAgents() {
      try {
        if (isDev) {
          // Simulate API delay in development
          await new Promise(resolve => setTimeout(resolve, 800));
          setAgents(mockAgents);
        } else {
          const res = await fetch('/ai-api/agents');
          if (!res.ok) throw new Error(`Error fetching agents: ${res.status}`);
          const data = await res.json();
          setAgents(data);
        }
      } catch (err) {
        console.error('Failed to fetch agents:', err);
        // Fallback to mock agents
        setAgents(mockAgents);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  return { agents, loading };
}