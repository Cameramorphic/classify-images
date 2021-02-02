import React from 'react';
import Header from 'components/Header';
import Footer from 'components/Footer';

import styles from './App.module.css';
import RootRoute from 'routes/RootRoute';

function App() {
  return (<>
    <Header />
    <div className={styles.content}>
      <RootRoute />
    </div>
    <Footer />
  </>);
}

export default App;
