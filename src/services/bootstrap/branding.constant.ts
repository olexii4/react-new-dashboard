/*
 * Copyright (c) 2018-2020 Red Hat, Inc.
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 * Contributors:
 *   Red Hat, Inc. - initial API and implementation
 */

export type BrandingData = {
  title: string;
  name: string;
  productVersion?: string;
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
  docs: BrandingDocs;
  workspace: BrandingWorkspace;
  footer: BrandingFooter;
  configuration: BrandingConfiguration;
}

export type BrandingDocs = {
  devfile: string;
  workspace: string;
  factory: string;
  organization: string;
  general: string;
  converting: string;
  certificate: string;
  faq?: string;
  storageTypes: string;
  webSocketTroubleshooting: string;
}

export type BrandingWorkspace = {
  priorityStacks: Array<string>;
  defaultStack: string
}

export type BrandingFooter = {
  content: string;
  links: Array<{ title: string; location: string }>;
  email: { title: string, address: string, subject: string } | '' | null
}

export type CheCliTool = 'chectl' | 'crwctl';

export type BrandingConfiguration = {
  menu: {
    disabled: che.ConfigurableMenuItem[];
    enabled?: che.ConfigurableMenuItem[];
  },
  prefetch: {
    cheCDN?: string;
    resources: string[];
  },
  features: {
    disabled: TogglableFeature[];
  },
  cheCliTool: CheCliTool;
}

export enum TogglableFeature {
  WORKSPACE_SHARING = 'workspaceSharing',
  KUBERNETES_NAMESPACE_SELECTOR = 'kubernetesNamespaceSelector',
}

export const BRANDING_DEFAULT: BrandingData = {
  title: 'Eclipse Che',
  name: 'Eclipse Che',
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
    defaultStack: 'java-mysql'
  },
  cli: {
    configName: 'che.env',
    name: 'CHE'
  },
  docs: {
    devfile: 'https://www.eclipse.org/che/docs/che-7/making-a-workspace-portable-using-a-devfile/',
    workspace: 'https://www.eclipse.org/che/docs/che-7/workspaces-overview/',
    factory: 'https://www.eclipse.org/che/docs/che-7',
    organization: 'https://www.eclipse.org/che/docs/che-7',
    converting: 'https://www.eclipse.org/che/docs/che-7',
    certificate: 'https://www.eclipse.org/che/docs/che-7/importing-certificates-to-browsers/',
    general: 'https://www.eclipse.org/che/docs/che-7',
    storageTypes: 'https://www.eclipse.org/che/docs/che-7/configuring-storage-types/',
    webSocketTroubleshooting: 'https://www.eclipse.org/che/docs/che-7/troubleshooting-network-problems/#troubleshooting-websocket-secure-connections_troubleshooting-network-problems'
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
    },
    cheCliTool: 'chectl'
  },
  footer: {
    content: '',
    links: [],
    email: ''
  }
};
