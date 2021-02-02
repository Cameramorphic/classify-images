import React from 'react';

import { Link, NavLink } from 'react-router-dom';

import logo from 'assets/icons/logo.svg';
import githubLogo from 'assets/icons/GitHub_Logo.png';
import { ABOUT } from 'routes/urlPaths';

import styles from './Header.module.css';

export default function Header() {
    return (
        <div className={styles.header}>
            <Link to='/' className={styles.branding}>
                <img src={logo} alt='Logo' className={styles.icon} />
                <div className={styles.brandName}>ClassifyImages</div>
            </Link>
            <div className={styles.navigation}>
                <NavLink to={ABOUT} activeClassName={styles.active}>About</NavLink>
                <a href='https://github.com/Cameramorphic/classify-images' target='_blank' rel='noreferrer'>
                    <img src={githubLogo} alt='GitHub' />
                </a>
            </div>
        </div>
    );
}
