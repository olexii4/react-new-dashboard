import axios from 'axios';

export const fetchDevfiles = (): Promise<{ devfiles: che.DevfileMetaData[]; registryUrl: string }> => {
  return axios.get('/api/workspace/settings').then((resp: { data: che.WorkspaceSettings }) => {
    // TODO  remove 'https://che-devfile-registry.openshift.io'. Just for testing.
    const registryUrl = resp && resp.data && resp.data.cheWorkspaceDevfileRegistryUrl || 'https://che-devfile-registry.openshift.io';
    return axios.get(`${registryUrl}/devfiles/index.json`).then((resp: { data: che.DevfileMetaData[] }) => {
      const devfiles = resp.data;
      return axios.get('/api/devfile').then((resp: { data: any }) => {
        const jsonSchema = resp.data;
        return Promise.resolve({ devfiles, registryUrl, jsonSchema });
      }).catch(() => {
        return Promise.resolve({ devfiles, registryUrl });
      });
    }).catch(error => {
      return Promise.reject(error.response);
    });
  }).catch(error => {
    return Promise.reject(error.response);
  });
};

export const fetchDevfile = (url: string): Promise<che.WorkspaceDevfile> => {
  return axios.get(url)
    .then(response => response.data)
    .catch(error => Promise.reject(new Error(error.response)));
};
