import React from 'react';

import { Link } from 'react-router-dom';

import Slogan from 'components/Slogan';
import { CATEGORISE, SEARCH_IMAGES, SEARCH_VIDEO } from './urlPaths';

import styles from './RootRoute.module.css';

interface IProps {
    link: string;
    title: string;
    children: React.ReactNode;
}

const GridItem = ({ link, title, children }: IProps) => (
    <Link to={link} className={styles.gridItem}>
        <div className={styles.title}>{title}</div>
        <div className={styles.content}>{children}</div>
    </Link>
);

export default function RootRoute() {
    return (
        <div>
            <Slogan />
            <div className={styles.gridContainer}>
                <GridItem link={CATEGORISE} title='Categorise Images'>
                    Tag your images with your own categories, powered by AI.
                </GridItem>
                <GridItem link={SEARCH_VIDEO} title='Search Video'>
                    Use text to find occurances of sonething in a video file and get the respective timestamps.
                </GridItem>
                <GridItem link={SEARCH_IMAGES} title='Search Images'>
                    Use text to find matching images from a given list.
                </GridItem>
            </div>
        </div>
    );
}
