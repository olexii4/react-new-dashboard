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

import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

const IdeIframe = (props: RouteComponentProps<{ namespace: string; workspaceName: string }>): React.ReactElement => {
  const randVal = Math.floor((Math.random() * 1000000) + 1);
  const { namespace, workspaceName } = props.match.params;

  return (
    <React.Fragment>
      <iframe className='ide-page-frame'
        src={`/workspace-loader/${namespace}/${workspaceName}?uid=${randVal}`} />
    </React.Fragment>);
};

export default connect()(IdeIframe);
