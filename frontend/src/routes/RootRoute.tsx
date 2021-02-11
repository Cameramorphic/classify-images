import React from 'react';

import { Link } from 'react-router-dom';

import { PATHS } from './routeConfig';

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

export default function RootRoute(): JSX.Element {
    return (
        <div className={styles.gridContainer}>
            <GridItem link={PATHS.CATEGORISE} title='Categorise Images'>
                Tag your images with your own categories, powered by AI.
            </GridItem>
            <GridItem link={PATHS.SEARCH_VIDEO} title='Search Video'>
                Use text to find occurances of something in a video file and get the respective timestamps.
            </GridItem>
            <GridItem link={PATHS.SEARCH_IMAGES} title='Search Images'>
                Use text to find matching images from a given list.
            </GridItem>
        </div>
    );
}
