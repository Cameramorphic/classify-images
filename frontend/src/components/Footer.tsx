import React from 'react';

import clx from 'classnames';

import { containerClass } from 'App';

import styles from './Footer.module.css';

export default function Footer() {
    return (
        <div className={clx(styles.footer, containerClass)}>
            <div className={styles.copyright}>
                Copyright &copy; {new Date().getFullYear()} ClassifyImages GmbH
            </div>
        </div>
    );
}
