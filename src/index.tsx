import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';
import '@patternfly/react-core/dist/styles/base.css';

import configureStore from './store/configureStore';
import App from './components/App';
import { PreloadData } from './services/bootstrap/PreloadData';

import '../node_modules/@patternfly/patternfly/patternfly-addons.css';

const history = createHashHistory();
// get the application-wide store instance, with state from the server where available
const store = configureStore(history);
// preload app data
new PreloadData(store).init().then(() => {
  console.log('UD: preload data complete successfully.');
});

const ROOT = document.querySelector('.ui-container');
ReactDOM.render(<Provider store={store}><App history={history} /></Provider>, ROOT);
