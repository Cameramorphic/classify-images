import React from 'react';

import styles from './Footer.module.css';

export default function Footer() {
    return (
        <div className={styles.footer}>
            <div className={styles.copyright}>
                Copyright &copy; {new Date().getFullYear()} ClassifyImages GmbH
            </div>
        </div>
    );
}
