import React from 'react';

import Slogan from 'components/Slogan';

import styles from './ErrorRoute.module.css';

export default function ErrorRoute() {
    return (
        <div>
            <Slogan text='404 Error!' />
            <div className={styles.description}>Page not found.</div>
        </div>
    );
}
