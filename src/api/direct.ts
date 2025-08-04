// Direct API calls to facets endpoints

export interface Cluster {
  id: string;
  createdBy: string | null;
  creationDate: string | null;
  lastModifiedDate: string;
  lastModifiedBy: string;
  name: string;
  cloud: string;
  tz: string;
  stackName: string;
  releaseStream: string;
  cdPipelineParent: string | null;
  requireSignOff: boolean;
  deleted: boolean;
  autoSignOffSchedule: string | null;
  enableAutoSignOff: boolean;
  configured: boolean;
  branch: string | null;
  clusterCode: string;
  commonEnvironmentVariables: Record<string, any>;
  variables: Record<string, any>;
  secrets: any;
  globalVariables: Record<string, any>;
  clusterState: string;
  schedules: Record<string, any>;
  k8sRequestsToLimitsRatio: number;
  componentVersions: Record<string, string>;
  cloudAccountId: string;
  cloudAccountSecretId: string | null;
  isEphemeral: boolean;
  pauseReleases: boolean;
  baseClusterId: string | null;
  baseClusterName: string | null;
  namespace: string | null;
  awsRegion: string | null;
  azs: string[] | null;
  vpcCIDR: string | null;
  externalId: string | null;
  roleARN: string | null;
  accessKeyId: string | null;
  secretAccessKey: string | null;
  providedVPCId: string | null;
  instanceTypes: string[];
  repository: string;
  entityType: string;
  secretsUid: string;
  versioningKey: string;
  numberOfVersions: number;
}

export interface ClustersResponse {
  content: Cluster[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}

export interface ClustersParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
}

export async function getClusters(params: ClustersParams = {}): Promise<ClustersResponse> {
  const {
    page = 0,
    perPage = 50,
    sortBy = 'LAST_MODIFIED_DATE'
  } = params;

  const url = `/cc-ui/v1/stacks/clusters?page=${page}&perPage=${perPage}&sortBy=${sortBy}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'priority': 'u=1, i',
      'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin'
    },
    mode: 'cors',
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch clusters: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Helper function to get cluster by name
export async function getClusterByName(name: string): Promise<Cluster | null> {
  const response = await getClusters();
  return response.content.find(cluster => cluster.name === name) || null;
}

// Helper function to get clusters by cloud provider
export async function getClustersByCloud(cloud: string): Promise<Cluster[]> {
  const response = await getClusters();
  return response.content.filter(cluster => cluster.cloud === cloud);
}

// Helper function to get clusters by release stream
export async function getClustersByReleaseStream(releaseStream: string): Promise<Cluster[]> {
  const response = await getClusters();
  return response.content.filter(cluster => cluster.releaseStream === releaseStream);
}