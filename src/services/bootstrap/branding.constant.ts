export type IBranding = {
  title: string;
  name: string;
  logoFile: string;
  logoTextFile: string;
  favicon: string;
  loader: string;
  websocketContext: string;
  helpPath: string;
  helpTitle: string;
  supportEmail: string;
  oauthDocs: string;
  cli: {
    configName: string;
    name: string;
  };
  docs: IBrandingDocs;
  workspace: IBrandingWorkspace;
  footer: IBrandingFooter;
  configuration: IBrandingConfiguration;
}

export type IBrandingDocs = {
  devfile: string;
  workspace: string;
  factory: string;
  organization: string;
  general: string;
  converting: string;
  certificate: string;
  faq?: string;
}

export type IBrandingWorkspace = {
  priorityStacks: Array<string>;
  defaultStack: string;
  creationLink: string;
}

export type IBrandingFooter = {
  content: string;
  links: Array<{ title: string; location: string }>;
  email: { title: string; address: string; subject: string } | null;
}

export type IBrandingConfiguration = {
  menu: {
    disabled: string[];
  };
  prefetch: {
    cheCDN?: string;
    resources: string[];
  };
  features: {
    disabled: string[];
  };
}

export const BRANDING_DEFAULT: IBranding = {
  title: 'new Eclipse Che',
  name: 'new Eclipse Che',
  logoFile: 'che-logo.svg',
  logoTextFile: 'che-logo-text.svg',
  favicon: 'favicon.ico',
  loader: 'loader.svg',
  websocketContext: '/api/websocket',
  helpPath: 'https://www.eclipse.org/che/',
  helpTitle: 'Community',
  supportEmail: 'che-dev@eclipse.org',
  oauthDocs: 'Configure OAuth in the che.properties file.',
  workspace: {
    priorityStacks: [
      'Java',
      'Java-MySQL',
      'Blank'
    ],
    defaultStack: 'java-mysql',
    creationLink: '/'
  },
  cli: {
    configName: 'che.env',
    name: 'CHE'
  },
  docs: {
    devfile: 'https://www.eclipse.org/che/docs/che-7/using-developer-environments-workspaces.html#making-a-workspace-portable-using-a-devfile_using-developer-environments-workspaces',
    workspace: 'https://www.eclipse.org/che/docs/che-7/workspaces-overview/',
    factory: 'https://www.eclipse.org/che/docs/factories-getting-started.html',
    organization: 'https://www.eclipse.org/che/docs/organizations.html',
    converting: 'https://www.eclipse.org/che/docs/che-7/converting-a-che-6-workspace-to-a-che-7-devfile/',
    certificate: 'https://www.eclipse.org/che/docs/che-7/setup-che-in-tls-mode-with-self-signed-certificate/',
    general: 'https://www.eclipse.org/che/docs/che-7'
  },
  configuration: {
    menu: {
      disabled: []
    },
    features: {
      disabled: []
    },
    prefetch: {
      resources: []
    }
  },
  footer: {
    content: '',
    links: [],
    email: null
  }
};
