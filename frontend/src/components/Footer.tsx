import React from 'react';

import { containerClass } from 'App';

import styles from './Footer.module.css';

export default function Footer(): JSX.Element {
    return (
        <div className={containerClass}>
            <div className={styles.footer}>
                <div className={styles.copyright}>
                    Copyright &copy; {new Date().getFullYear()} Nils Höhing, Johann Rittenschober, Ricarda Schuschnig, Tobias Schwarzer
                </div>
            </div>
        </div>
    );
}
