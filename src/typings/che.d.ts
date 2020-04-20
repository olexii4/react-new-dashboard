declare module 'che' {
  export = che;
}

declare namespace che {

  export interface IWorkspace {
    id?: string;
    projects?: any;
    links?: {
      ide?: string
      [rel: string]: string | undefined;
    };
    temporary?: boolean;
    status?: string;
    namespace?: string;
    attributes?: IWorkspaceAttributes;
    devfile: IWorkspaceDevfile;
    runtime?: IWorkspaceRuntime;
    isLocked?: boolean;
    usedResources?: string;
  }

  export interface IWorkspaceSettings {
    cheWorkspaceDevfileRegistryUrl?: string;
    cheWorkspacePluginRegistryUrl: string;
    'che.workspace.persist_volumes.default': 'false' | 'true';
    supportedRecipeTypes: string;
  }

  export interface IWorkspaceAttributes {
    created: number;
    updated?: number;
    stackId?: string;
    stackName?: string;
    errorMessage?: string;
    infrastructureNamespace: string;

    [propName: string]: string | number | undefined;
  }

  export interface IWorkspaceConfigAttributes {
    persistVolumes?: 'false';
    editor?: string;
    plugins?: string;
  }

  export interface IWorkspaceDevfile {
    apiVersion: string;
    components: Array<any>;
    projects?: Array<any>;
    commands?: Array<any>;
    attributes?: che.IWorkspaceConfigAttributes;
    metadata: {
      name?: string;
      generateName?: string;
    }
  }

  export interface IWorkspaceRuntime {
    activeEnv: string;
    links: any[];
    machines: {
      [machineName: string]: IWorkspaceRuntimeMachine
    };
    owner: string;
    warnings: IWorkspaceWarning[];
    machineToken?: string;
  }

  export interface IWorkspaceWarning {
    code?: number;
    message: string;
  }

  export interface IWorkspaceRuntimeMachine {
    attributes: { [propName: string]: string };
    servers: { [serverName: string]: IWorkspaceRuntimeMachineServer };
  }

  export interface IWorkspaceRuntimeMachineServer {
    status: string;
    port: string;
    url: string;
    ref: string;
    protocol: string;
    path: string;
  }

  export interface IProjectSource {
    location: string;
    parameters?: {
      [paramName: string]: any
    };
    type?: string;
  }

  export interface IProfileAttributes {
    firstName?: string;
    lastName?: string;

    [propName: string]: string | number | undefined;
  }

  export interface IProfile {
    attributes?: IProfileAttributes;
    email: string;
    links?: Array<any>;
    userId: string;
  }

  export interface IUser {
    links: any[]
    attributes?: {
      firstName?: string;
      lastName?: string;
      [propName: string]: string | number | undefined;
    };
    id: string;
    name: string;
    email: string;
    family_name?: string;
    given_name?: string;
    preferred_username?: string;
    sub?: string;
  }

  export interface IDevfileMetaData {
    displayName: string;
    description?: string;
    globalMemoryLimit: string;
    icon: string;
    links: any;
    tags: Array<string>;
  }
}
