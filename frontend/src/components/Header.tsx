import React from 'react';

import logo from 'assets/icons/logo.svg';
import githubLogo from 'assets/icons/GitHub_Logo.png';

import styles from './Header.module.css';

export default function Header() {
    return (
        <div className={styles.header}>
            <div className={styles.branding}>
                <img src={logo} alt='Logo' className={styles.icon} />
                <div className={styles.brandName}>
                    ClassifyImages
                </div>
            </div>
            <div className={styles.navigation}>
                <a href='/'>About</a>
                <a href='https://github.com/Cameramorphic/classify-images' target='_blank' rel='noreferrer'><img src={githubLogo} alt='GitHub' /></a>
            </div>
        </div>
    );
}
