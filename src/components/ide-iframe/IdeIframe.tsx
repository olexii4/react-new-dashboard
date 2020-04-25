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
    </React.Fragment>)
};

export default connect()(IdeIframe);
