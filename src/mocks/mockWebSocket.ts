import { mockResponses, mockToolCalls } from './mockApi';

export class MockWebSocket {
  public readyState: number = WebSocket.CONNECTING;
  public url: string;
  public onopen: ((event: Event) => void) | null = null;
  public onmessage: ((event: MessageEvent) => void) | null = null;
  public onclose: ((event: CloseEvent) => void) | null = null;
  public onerror: ((event: Event) => void) | null = null;

  private listeners: { [key: string]: ((event: any) => void)[] } = {};
  private messageQueue: any[] = [];
  private isTyping = false;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionStable = true;

  constructor(url: string) {
    this.url = url;
    console.log('MockWebSocket created for:', url);
    
    // Simulate connection with occasional instability
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      const openEvent = new Event('open');
      if (this.onopen) this.onopen(openEvent);
      this.dispatchEvent('open', openEvent);
      
      // Simulate random disconnections (5% chance every 30 seconds)
      this.scheduleRandomDisconnect();
    }, 300);
  }

  private scheduleRandomDisconnect() {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
    }
    
    // Schedule next potential disconnect in 30-60 seconds
    const delay = 30000 + Math.random() * 30000;
    this.disconnectTimer = setTimeout(() => {
      // 5% chance of simulated disconnect
      if (Math.random() < 0.05 && this.connectionStable) {
        this.simulateDisconnect();
      } else {
        this.scheduleRandomDisconnect();
      }
    }, delay);
  }

  private simulateDisconnect() {
    console.log('MockWebSocket: Simulating connection loss');
    this.connectionStable = false;
    this.readyState = WebSocket.CLOSED;
    
    const closeEvent = new CloseEvent('close', { 
      code: 1006, // Abnormal closure
      reason: 'Connection lost' 
    });
    
    if (this.onclose) this.onclose(closeEvent);
    this.dispatchEvent('close', closeEvent);
    
    // Simulate reconnection after 3-5 seconds
    setTimeout(() => {
      this.simulateReconnect();
    }, 3000 + Math.random() * 2000);
  }

  private simulateReconnect() {
    console.log('MockWebSocket: Simulating reconnection');
    this.readyState = WebSocket.CONNECTING;
    
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      this.connectionStable = true;
      
      const openEvent = new Event('open');
      if (this.onopen) this.onopen(openEvent);
      this.dispatchEvent('open', openEvent);
      
      // Resume random disconnect scheduling
      this.scheduleRandomDisconnect();
    }, 1000 + Math.random() * 2000);
  }

  addEventListener(type: string, listener: (event: any) => void) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void) {
    if (this.listeners[type]) {
      this.listeners[type] = this.listeners[type].filter(l => l !== listener);
    }
  }

  dispatchEvent(type: string, event: any) {
    if (this.listeners[type]) {
      this.listeners[type].forEach(listener => listener(event));
    }
  }

  send(data: string) {
    if (this.readyState !== WebSocket.OPEN) return;

    try {
      const message = JSON.parse(data);
      console.log('Mock WebSocket sent:', message);

      if (message.type === 'message') {
        this.handleUserMessage(message.payload.message);
      } else if (message.type === 'confirmation_response') {
        this.handleConfirmationResponse(message.payload);
      }
    } catch (err) {
      console.error('Mock WebSocket: Invalid JSON', err);
    }
  }

  close(code?: number, reason?: string) {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
    
    this.readyState = WebSocket.CLOSED;
    const closeEvent = new CloseEvent('close', { 
      code: code || 1000, 
      reason: reason || 'Normal closure' 
    });
    if (this.onclose) this.onclose(closeEvent);
    this.dispatchEvent('close', closeEvent);
  }

  private handleUserMessage(userMessage: string) {
    if (this.isTyping) return;
    
    this.isTyping = true;

    // Check if we should simulate an error (10% chance for certain keywords)
    const lowerMessage = userMessage.toLowerCase();
    const shouldError = (lowerMessage.includes('error') || 
                        lowerMessage.includes('fail') || 
                        lowerMessage.includes('break') ||
                        lowerMessage.includes('crash')) && Math.random() < 0.6;

    // Check if we should simulate a disconnect (2% chance for certain keywords)
    const shouldDisconnect = (lowerMessage.includes('disconnect') || 
                             lowerMessage.includes('network') || 
                             lowerMessage.includes('connection')) && Math.random() < 0.3;

    if (shouldDisconnect) {
      // Simulate disconnect during processing
      setTimeout(() => {
        this.simulateDisconnect();
      }, 2000);
      return;
    }

    if (shouldError) {
      // Send error packet after a delay
      setTimeout(() => {
        this.sendErrorPacket(userMessage);
      }, 1000);
      return;
    }

    // Send individual tool calls first with delays
    setTimeout(() => {
      this.executeIndividualToolCalls(userMessage);
    }, 800); // 1 second delay before starting tool calls
  }

  private sendErrorPacket(userMessage: string) {
    const errorMessages = [
      'Failed to connect to Kubernetes cluster: connection timeout',
      'Authentication failed: invalid kubeconfig credentials',
      'Namespace "invalid-namespace" not found',
      'Resource quota exceeded: cannot create more pods',
      'Network policy violation: access denied to service',
      'Node "worker-node-3" is not ready: disk pressure detected',
      'Image pull failed: repository does not exist or access denied',
      'Service account "default" lacks required permissions'
    ];

    const errorMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];

    const errorEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'error',
        payload: {
          message: errorMessage,
          code: 'CLUSTER_ERROR',
          details: {
            timestamp: new Date().toISOString(),
            operation: 'kubectl_operation',
            context: userMessage
          }
        }
      })
    });

    if (this.onmessage) this.onmessage(errorEvent);
    this.dispatchEvent('message', errorEvent);

    // End the conversation after error
    setTimeout(() => {
      const endEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'end'
        })
      });

      if (this.onmessage) this.onmessage(endEvent);
      this.dispatchEvent('message', endEvent);
      this.isTyping = false;
    }, 500);
  }

  private executeIndividualToolCalls(userMessage: string) {
    const lowerMessage = userMessage.toLowerCase();
    let toolSequence: any[] = [];

    // Determine which tools to execute based on the message
    if (lowerMessage.includes('pod') || lowerMessage.includes('status') || lowerMessage.includes('check')) {
      toolSequence = [
        { name: 'kubectl_get_pods', args: { namespace: 'default', output: 'wide' } },
        { name: 'kubectl_get_nodes', args: { output: 'wide' } },
        { name: 'kubectl_cluster_info', args: {} }
      ];
    } else if (lowerMessage.includes('deploy') || lowerMessage.includes('create')) {
      toolSequence = [
        {
          name: 'kubectl_apply',
          args: {
            manifest: {
              apiVersion: 'apps/v1',
              kind: 'Deployment',
              metadata: { name: 'nginx-deployment' },
              spec: {
                replicas: 3,
                selector: { matchLabels: { app: 'nginx' } },
                template: {
                  metadata: { labels: { app: 'nginx' } },
                  spec: {
                    containers: [{
                      name: 'nginx',
                      image: 'nginx:latest',
                      ports: [{ containerPort: 80 }]
                    }]
                  }
                }
              }
            }
          }
        },
        {
          name: 'kubectl_expose',
          args: { resource: 'deployment/nginx-deployment', port: 80, type: 'ClusterIP' }
        },
        {
          name: 'kubectl_get_pods',
          args: { namespace: 'default', selector: 'app=nginx' }
        }
      ];
    } else if (lowerMessage.includes('service') || lowerMessage.includes('network')) {
      toolSequence = [
        { name: 'kubectl_get_services', args: { namespace: 'default', output: 'wide' } },
        { name: 'kubectl_get_endpoints', args: { namespace: 'default' } },
        { name: 'kubectl_get_ingress', args: { namespace: 'default' } }
      ];
    } else if (lowerMessage.includes('node') || lowerMessage.includes('cluster')) {
      toolSequence = [
        { name: 'kubectl_get_nodes', args: { output: 'wide' } },
        { name: 'kubectl_top_nodes', args: {} },
        { name: 'kubectl_describe_node', args: { nodeName: 'worker-node-1' } }
      ];
    } else {
      // Default sequence for general queries
      toolSequence = [
        { name: 'kubectl_get_pods', args: { namespace: 'default' } },
        { name: 'kubectl_get_services', args: { namespace: 'default' } }
      ];
    }

    // Send individual tool calls with 1 second delays between packets
    this.sendIndividualToolCalls(toolSequence, 0, () => {
      // After all tool calls, send the response
      setTimeout(() => {
        this.sendStreamingResponse(userMessage);
      }, 1000); // 1 second delay before response
    });
  }

  private sendIndividualToolCalls(tools: any[], index: number, onComplete: () => void) {
    if (index >= tools.length) {
      onComplete();
      return;
    }

    const tool = tools[index];
    const messageEvent = new MessageEvent('message', {
      data: JSON.stringify({
        type: 'tool_call',
        payload: {
          name: tool.name,
          arguments: tool.args
        }
      })
    });

    if (this.onmessage) this.onmessage(messageEvent);
    this.dispatchEvent('message', messageEvent);

    // Send next tool call after 1 second delay
    setTimeout(() => {
      this.sendIndividualToolCalls(tools, index + 1, onComplete);
    }, 1000);
  }

  private sendStreamingResponse(userMessage: string) {
    let response = this.generateResponse(userMessage);
    
    // Sometimes request confirmation for dangerous operations
    if (userMessage.toLowerCase().includes('delete') || 
        userMessage.toLowerCase().includes('remove') ||
        userMessage.toLowerCase().includes('destroy')) {
      
      setTimeout(() => {
        const confirmEvent = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'confirmation_request',
            payload: {
              id: `confirm_${Date.now()}`,
              command: `kubectl delete pod ${userMessage.includes('pod') ? 'example-pod' : 'example-resource'}`
            }
          })
        });

        if (this.onmessage) this.onmessage(confirmEvent);
        this.dispatchEvent('message', confirmEvent);
      }, 500);
      
      response = "I need your confirmation before proceeding with this potentially destructive operation.";
    }

    // Stream the response with realistic timing
    const chunks = this.createStreamingChunks(response);
    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentIndex < chunks.length) {
        const messageEvent = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'message',
            payload: {
              message: chunks[currentIndex]
            }
          })
        });

        if (this.onmessage) this.onmessage(messageEvent);
        this.dispatchEvent('message', messageEvent);
        currentIndex++;
      } else {
        // End of message
        clearInterval(streamInterval);
        const endEvent = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'end'
          })
        });

        if (this.onmessage) this.onmessage(endEvent);
        this.dispatchEvent('message', endEvent);
        this.isTyping = false;
      }
    }, 50 + Math.random() * 40); // 50-90ms per chunk for realistic typing
  }

  private createStreamingChunks(text: string): string[] {
    const chunks: string[] = [];
    const words = text.split(' ');
    
    // Create more natural chunks (1-3 words at a time)
    for (let i = 0; i < words.length; i++) {
      const chunkSize = Math.random() > 0.7 ? Math.min(3, words.length - i) : 1;
      const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
      chunks.push(chunk);
      i += chunkSize - 1;
    }
    
    return chunks;
  }

  private generateResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('pod')) {
      return "I've checked your cluster and found the following pods:\n\n```bash\nNAME                    READY   STATUS    RESTARTS   AGE\nnginx-deployment-1      1/1     Running   0          2d\napi-server-2           1/1     Running   1          1d\ndatabase-pod           1/1     Running   0          3h\nredis-cache            1/1     Running   0          1d\n```\n\n✅ **Cluster Health**: All pods are running normally\n\n**Key Findings:**\n- **4 active pods** across the default namespace\n- **No failed pods** detected\n- **Low restart count** indicates stability\n- **Resource utilization** within normal ranges\n\nYour cluster appears to be in excellent health with no immediate issues requiring attention.";
    }
    
    if (lowerMessage.includes('node')) {
      return "I've analyzed your cluster nodes and their resource usage:\n\n```bash\nNAME           STATUS   ROLES    AGE   VERSION   CPU%   MEMORY%\nmaster-node    Ready    master   5d    v1.28.0   15%    45%\nworker-node-1  Ready    worker   5d    v1.28.0   32%    67%\nworker-node-2  Ready    worker   5d    v1.28.0   28%    52%\n```\n\n## 📊 **Resource Analysis**\n\n### **Node Health**\n- ✅ All **3 nodes** are in `Ready` state\n- ✅ Running Kubernetes **v1.28.0** (latest stable)\n- ✅ No node pressure conditions detected\n\n### **Resource Utilization**\n- **Master Node**: Low utilization (15% CPU, 45% Memory)\n- **Worker Node 1**: Moderate load (32% CPU, 67% Memory) \n- **Worker Node 2**: Balanced load (28% CPU, 52% Memory)\n\n### **Recommendations**\n- Worker-node-1 has the highest memory usage but is still within acceptable limits\n- Consider monitoring memory trends on worker-node-1\n- Overall cluster capacity is healthy with room for growth";
    }
    
    if (lowerMessage.includes('deploy')) {
      return "## 🚀 **Deployment Successful**\n\nI've successfully created and configured your nginx deployment:\n\n### **✅ Resources Created**\n\n1. **Deployment**: `nginx-deployment`\n   - **Replicas**: 3 pods\n   - **Image**: nginx:latest\n   - **Strategy**: RollingUpdate\n\n2. **Service**: `nginx-service`\n   - **Type**: ClusterIP\n   - **Port**: 80 → 80\n   - **Selector**: app=nginx\n\n3. **Pod Status**: All 3 pods running and ready\n\n### **📋 Current State**\n\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nginx-deployment\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: nginx\n  template:\n    spec:\n      containers:\n      - name: nginx\n        image: nginx:latest\n        ports:\n        - containerPort: 80\n```\n\n### **🔗 Next Steps**\n\nYour application is now accessible within the cluster at `nginx-service.default.svc.cluster.local:80`\n\n**Would you like me to:**\n- Create an **Ingress** to expose it externally?\n- Set up **monitoring** and health checks?\n- Configure **auto-scaling** policies?";
    }
    
    if (lowerMessage.includes('service')) {
      return "## 🌐 **Network Configuration Overview**\n\nHere's the current network setup in your cluster:\n\n### **🔧 Services**\n```bash\nNAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)   AGE\nkubernetes   ClusterIP   10.96.0.1       <none>        443/TCP   5d\nnginx-svc    ClusterIP   10.96.1.100     <none>        80/TCP    2d\napi-svc      NodePort    10.96.1.200     <none>        80:30080/TCP   1d\n```\n\n### **🎯 Endpoints**\n```bash\nNAME         ENDPOINTS                     AGE\nnginx-svc    10.244.1.5:80,10.244.2.3:80  2d\napi-svc      10.244.1.8:8080              1d\n```\n\n### **📊 Network Health**\n\n- ✅ **All services** have healthy endpoints\n- ✅ **Traffic routing** is working correctly\n- ✅ **Load balancing** across multiple pods\n- ✅ **DNS resolution** functioning properly\n\n### **🔍 Service Details**\n\n1. **kubernetes**: Core API server (system service)\n2. **nginx-svc**: Internal web service with 2 backend pods\n3. **api-svc**: External API accessible via NodePort 30080\n\n**Network connectivity is optimal** with no routing issues detected.";
    }
    
    // Return a random response for other messages
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  }

  private handleConfirmationResponse(payload: { id: string; confirmed: boolean }) {
    setTimeout(() => {
      const responseMessage = payload.confirmed 
        ? "✅ **Command executed successfully**\n\nThe resource has been deleted from your cluster. All associated pods and services have been terminated gracefully."
        : "❌ **Operation cancelled**\n\nNo changes were made to your cluster. All resources remain in their current state.";

      const messageEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'message',
          payload: {
            message: responseMessage
          }
        })
      });

      if (this.onmessage) this.onmessage(messageEvent);
      this.dispatchEvent('message', messageEvent);
      
      setTimeout(() => {
        const endEvent = new MessageEvent('message', {
          data: JSON.stringify({
            type: 'end'
          })
        });

        if (this.onmessage) this.onmessage(endEvent);
        this.dispatchEvent('message', endEvent);
      }, 200);
    }, 400);
  }

  // WebSocket constants
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
}

// Override global WebSocket in development
if (import.meta.env.DEV) {
  console.log('Setting up MockWebSocket for development');
  (window as any).WebSocket = MockWebSocket;
}