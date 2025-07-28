// Mock API implementation for development
export const mockAgents = [
  'Kubernetes Expert',
  'DevOps Assistant', 
  'Cluster Analyzer',
  'Security Specialist',
  'Performance Monitor'
];

export const mockResponses = [
  "I can help you manage your Kubernetes cluster. What would you like to know?",
  "Let me analyze your cluster configuration and provide recommendations.",
  "I'll check the status of your pods and services.",
  "Here's what I found in your cluster:\n\n```yaml\napiVersion: v1\nkind: Pod\nmetadata:\n  name: example-pod\n  namespace: default\nspec:\n  containers:\n  - name: app\n    image: nginx:latest\n    ports:\n    - containerPort: 80\n```",
  "Your cluster appears to be healthy. All nodes are ready and pods are running normally.",
  "I recommend updating your resource limits for better performance:\n\n- CPU: 500m → 1000m\n- Memory: 512Mi → 1Gi",
  "Would you like me to help you deploy a new application or troubleshoot an existing one?"
];

export const mockToolCalls = [
  {
    name: 'kubectl_get_pods',
    args: {
      namespace: 'default',
      selector: 'app=nginx'
    }
  },
  {
    name: 'kubectl_describe_node',
    args: {
      nodeName: 'worker-node-1'
    }
  },
  {
    name: 'kubectl_apply',
    args: {
      manifest: {
        apiVersion: 'v1',
        kind: 'Service',
        metadata: {
          name: 'nginx-service'
        },
        spec: {
          selector: {
            app: 'nginx'
          },
          ports: [
            {
              port: 80,
              targetPort: 80
            }
          ]
        }
      }
    }
  }
];

export async function mockUploadKubeconfig(sessionId: string, file: File): Promise<void> {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate random success/failure for testing
  if (Math.random() > 0.8) {
    throw new Error('Invalid kubeconfig format');
  }
  
  console.log(`Mock: Uploaded kubeconfig for session ${sessionId}:`, file.name);
}

export async function mockGetKubeconfigStatus(sessionId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Check if we have a stored status for this session
  const stored = localStorage.getItem(`kubeconfig_${sessionId}`);
  return stored === 'true';
}

export function mockSetKubeconfigStatus(sessionId: string, status: boolean): void {
  localStorage.setItem(`kubeconfig_${sessionId}`, status.toString());
}