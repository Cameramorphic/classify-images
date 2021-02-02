import React from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import Header from 'components/Header';
import Footer from 'components/Footer';
import ClassifyRoute from 'routes/ClassifyRoute';
import ErrorRoute from 'routes/ErrorRoute';
import RootRoute from 'routes/RootRoute';
import { CATEGORISE } from 'routes/urlPaths';

import styles from './App.module.css';

function App() {
  return (<>
    <Router>
      <Header />
      <div className={styles.content}>
        <Switch>
          <Route path={CATEGORISE} component={ClassifyRoute} />
          <Route exact path='/' component={RootRoute} />
          <Route component={ErrorRoute} />
        </Switch>
      </div>
      <Footer />
    </Router>
  </>);
}

export default App;
