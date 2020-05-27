import Axios from 'axios';
import * as Qs from 'qs';

const API_WORKSPACE = '/api/workspace';

export async function fetchWorkspaces(): Promise<Array<che.Workspace>> {
  try {
    const response = await Axios.get<Array<che.Workspace>>(API_WORKSPACE);
    return response.data;
  }
  catch (e) {
    throw new Error(`Failed to fetch workspaces, ` + e);
  }
};

export async function startWorkspace(workspaceId: string): Promise<che.Workspace> {
  try {
    const response = await Axios.post<che.Workspace>(`${API_WORKSPACE}/${workspaceId}/runtime`);
    return response.data;
  } catch (e) {
    throw new Error(`Failed to start the workspace with ID: ${workspaceId}, ` + e);
  }
};

export async function stopWorkspace(workspaceId: string): Promise<che.Workspace> {
  try {
    const response = await Axios.delete(`${API_WORKSPACE}/${workspaceId}/runtime`);
    return response.data;
  } catch (e) {
    throw new Error(`Failed to stop the workspace with ID: ${workspaceId}, ` + e);
  }
};

export async function deleteWorkspace(workspaceId: string): Promise<che.Workspace> {
  try {
    const response = await Axios.delete(`${API_WORKSPACE}/${workspaceId}`);
    return response.data;
  } catch (e) {
    throw new Error(`Failed to delete the workspace with ID: ${workspaceId}, ` + e);
  }
};

export async function updateWorkspace(workspace: che.Workspace): Promise<che.Workspace> {
  try {
    const response = await Axios.put(`${API_WORKSPACE}/${workspace.id}`, workspace);
    return response.data;
  } catch (e) {
    throw new Error(`Failed to update the workspace with ID: ${workspace.id}, ` + e);
  }
};

export async function createWorkspaceFromDevfile(
  devfile: che.WorkspaceDevfile,
  cheNamespace: string | undefined,
  infrastructureNamespace: string | undefined,
  attributes: { [key: string]: string } = {},
): Promise<che.Workspace> {
  const attrs = Object.keys(attributes).map(key => `${key}:${attributes[key]}`);

  try {
    const response = await Axios({
      method: 'POST',
      url: `${API_WORKSPACE}/devfile`,
      data: devfile,
      params: {
        attribute: attrs,
        namespace: cheNamespace,
        'infrastructure-namespace': infrastructureNamespace,
      },
      paramsSerializer: function (params) {
        return Qs.stringify(params, { arrayFormat: 'repeat' })
      },
    });
    return response.data;
  } catch (e) {
    throw new Error(`Failed to create a workspace from devfile: ${JSON.stringify(devfile)}, ` + e);
  }
}

export async function fetchSettings(): Promise<che.WorkspaceSettings> {
  try {
    const response = await Axios.get<che.WorkspaceSettings>(`${API_WORKSPACE}/settings`);
    return response.data;
  } catch (e) {
    throw new Error(`Failed to fetch workspaces settings, ` + e);
  }
}
