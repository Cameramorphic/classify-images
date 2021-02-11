import React from 'react';

import clx from 'classnames';
import { Link, NavLink } from 'react-router-dom';

import logo from 'assets/icons/ClassifyImages_Logo.svg';
import githubLogo from 'assets/icons/GitHub_Logo.png';
import { PATHS } from 'routes/routeConfig';
import { containerClass } from 'App';

import styles from './Header.module.css';

export default function Header(): JSX.Element {
    return (
        <div className={styles.header}>
            <div className={clx(styles.headerContent, containerClass)}>
                <Link to={PATHS.ROOT} className={styles.branding}>
                    <img src={logo} alt='Logo' className={styles.icon} />
                    <div className={styles.brandName}>ClassifyImages</div>
                </Link>
                <div className={styles.navigation}>
                    <NavLink to={PATHS.ABOUT} activeClassName={styles.active}>About</NavLink>
                    <a href='https://github.com/Cameramorphic/classify-images' target='_blank' rel='noreferrer'>
                        <img src={githubLogo} alt='GitHub' />
                    </a>
                </div>
            </div>
        </div>
    );
}
