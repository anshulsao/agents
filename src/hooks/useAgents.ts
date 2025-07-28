import { useState, useEffect } from 'react';

export interface StartingPrompt {
  title: string;
  prompt: string;
}

export interface AgentDetail {
  name: string;
  tools: string[];
  starting_prompts: StartingPrompt[];
}

export function useAgents() {
  const [agents, setAgents] = useState<AgentDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchAgents() {
      try {

          const res = await fetch('/ai-api/agents/details');
          if (!res.ok) throw new Error(`Error fetching agents: ${res.status}`);
          const data = await res.json();
          setAgents(data);

      } catch (err) {
        console.error('Failed to fetch agents:', err);
        // Fallback to mock agent details
        setAgents([{
          name: 'kubernetes-expert',
          tools: [],
          starting_prompts: [
            {
              title: 'Post-Release Issue',
              prompt: 'I am facing an issue after my release and the symptoms are the service is unresponsive—what information do you need first?'
            },
            {
              title: 'CrashLoop Investigation', 
              prompt: 'My pod is crashlooping and I want to know why—what diagnostics should we collect right now?'
            }
          ]
        }]);
      } finally {
        setLoading(false);
      }
    }
    fetchAgents();
  }, []);

  return { agents, loading };
}