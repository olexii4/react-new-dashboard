import Axios from 'axios';

const API_DEVFILE = '/api/devfile';

export async function fetchDevfileSchema(): Promise<any> {
  try {
    const response = await Axios.get(API_DEVFILE);
    return response.data;
  } catch (e) {
    throw new Error(`Failed to fetch devfile JSON schema, ` + e);
  }
}
