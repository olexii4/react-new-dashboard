import axios from 'axios';

function resolveIconUrl(metadata: che.DevfileMetaData, url: string): string {
  if (!metadata.icon || metadata.icon.startsWith('http')) {
    return metadata.icon;
  }
  return new URL(metadata.icon, url).href;
}

function resolveLinkSelf(metadata: che.DevfileMetaData, url: string): string {
  if (metadata.links.self.startsWith('http')) {
    return metadata.links.self;
  }
  return new URL(metadata.links.self, url).href;
}

/**
 * Fetches devfiles metadata for given registry urls.
 * @param registryUrls space-separated list of urls
 */
export async function fetchMetadata(registryUrls: string): Promise<che.DevfileMetaData[]> {
  // create new instance of `axios` to avoid adding an authorization header
  const axiosInstance = axios.create()

  const urls = registryUrls.split(/\s+/);

  try {
    const requests = urls.map(async registryUrl => {
      registryUrl = registryUrl[registryUrl.length - 1] === '/' ? registryUrl : registryUrl + '/';
      const indexUrl = new URL('devfiles/index.json', registryUrl);
      const response = await axiosInstance.get<che.DevfileMetaData[]>(indexUrl.href);

      return response.data.map(meta => {
        meta.icon = resolveIconUrl(meta, registryUrl);
        meta.links.self = resolveLinkSelf(meta, registryUrl);
        return meta;
      });
    })
    const allMetadata = await Promise.all(requests);
    return allMetadata.reduce((_allMetadata, registryMetadata) => {
      return _allMetadata.concat(registryMetadata);
    }, []);
  } catch (e) {
    throw new Error('Failed to fetch devfiles metadata:' + e);
  }
};
