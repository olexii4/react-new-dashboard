import axios from 'axios';
import Qs from 'Qs';
import { load } from 'js-yaml';


const API_WORKSPACE = '/api/workspace';

export const fetchWorkspaces = (): Promise<Array<che.Workspace>> => {
  return axios.get(API_WORKSPACE).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const startWorkspace = (workspaceId: string): Promise<che.Workspace> => {
  return axios.post(`${API_WORKSPACE}/${workspaceId}/runtime`).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const stopWorkspace = (workspaceId: string): Promise<che.Workspace> => {
  return axios.delete(`${API_WORKSPACE}/${workspaceId}/runtime`).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const deleteWorkspace = (workspaceId: string): Promise<che.Workspace> => {
  return axios.delete(`${API_WORKSPACE}/${workspaceId}`).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const updateWorkspace = (workspace: che.Workspace): Promise<che.Workspace> => {
  return axios.put(`${API_WORKSPACE}/${workspace.id}`, workspace).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const createWorkspace = (devfileUrl: string, attr: { [param: string]: string }): Promise<che.Workspace> => {
  return axios.get(devfileUrl).then(resp => {
    return axios({
      method: 'post',
      url: `${API_WORKSPACE}/devfile`,
      data: load(resp.data),
      params: { attribute: `stackName:${attr.stackName}` }
    }).then(resp => {
      return Promise.resolve(resp.data);
    }).catch(error => {
      return Promise.reject(error.response);
    });
  });
};

export const createWorkspaceFromDevfile = (
  devfile: che.WorkspaceDevfile,
  cheNamespace: string | undefined,
  infrastructureNamespace: string | undefined,
  attributes: { [key: string]: string } = {},
): Promise<che.Workspace> => {
  const attrs = Object.keys(attributes).map(key => `${key}:${attributes[key]}`);
  return axios({
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
  }).then(resp => {
    return resp.data;
  }).catch(error => {
    return Promise.reject(new Error(error.message));
  });
}

export const fetchSettings = (): Promise<che.WorkspaceSettings> => {
  return axios.get<che.WorkspaceSettings>(`${API_WORKSPACE}/settings`)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      return Promise.reject(new Error(error.response));
    });
}
