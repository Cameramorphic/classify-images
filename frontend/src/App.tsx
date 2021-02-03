import React from 'react';

import clx from 'classnames';
import { Helmet } from 'react-helmet';
import { BrowserRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';

import Header from 'components/Header';
import Footer from 'components/Footer';
import Slogan from 'components/Slogan';
import { PATHS, routes } from 'routes/routeConfig';

import styles from './App.module.css';

export const containerClass = styles.widthContainer;

function Content() {
  const { pathname } = useLocation();
  const currentRoute = routes.find(route => route.path === pathname);
  return (<>
    <Helmet>
      <title>{currentRoute?.title}</title>
    </Helmet>
    <div className={clx(styles.content, containerClass)}>
      <Slogan text={currentRoute?.title} small={!currentRoute?.mainPage} />
      <Switch>
        {routes.map((route, i) => <Route key={`${route.path}_${i}`} {...route} />)}
        <Redirect to={PATHS.ERROR} />
      </Switch>
    </div>
  </>);
}

function App() {
  return (<>
    <Router>
      <Header />
      <Content />
      <Footer />
    </Router>
  </>);
}

export default App;
