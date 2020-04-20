import axios from 'axios';
import { load } from 'js-yaml';

export const fetchWorkspaces = (): Promise<Array<che.IWorkspace>> => {
  return axios.get('/api/workspace').then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const startWorkspace = (workspaceId: string): Promise<che.IWorkspace> => {
  return axios.post(`/api/workspace/${workspaceId}/runtime`).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const stopWorkspace = (workspaceId: string): Promise<che.IWorkspace> => {
  return axios.delete(`/api/workspace/${workspaceId}/runtime`).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const deleteWorkspace = (workspaceId: string): Promise<che.IWorkspace> => {
  return axios.delete(`/api/workspace/${workspaceId}`).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const updateWorkspace = (workspace: che.IWorkspace): Promise<che.IWorkspace> => {
  return axios.put(`/api/workspace/${workspace.id}`, workspace).then(resp => {
    return Promise.resolve(resp.data);
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const createWorkspace = (devfileUrl: string, attr: { [param: string]: string }): Promise<che.IWorkspace> => {
  return axios.get(devfileUrl).then(resp => {
    return axios({
      method: 'post',
      url: `/api/workspace/devfile`,
      data: load(resp.data),
      params: { attribute: `stackName:${attr.stackName}` }
    }).then(resp => {
      return Promise.resolve(resp.data);
    }).catch(error => {
      return Promise.reject(error.response);
    });
  });
};
