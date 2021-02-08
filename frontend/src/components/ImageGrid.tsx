import React from 'react';

import clx from 'classnames';

import styles from './ImageGrid.module.css';

type StandardProps = Pick<React.HTMLAttributes<HTMLDivElement>, 'className' | 'style'>;

interface IProps extends StandardProps {
    children?: React.ReactNode;
}

export const ImageGrid = ({ children, ...props }: IProps) => (
    <div className={clx(styles.imgGrid, props.className)} style={props.style}>
        {children}
    </div>
);

interface IItemProps extends StandardProps {
    imageUrl: string;
    title?: string;
    subtitle?: string;
    children?: React.ReactNode;
}

export const ImageGridItem = ({ imageUrl, title, subtitle, children, ...props }: IItemProps) => (
    <div className={clx(styles.imgGridItem, props.className)} style={props.style}>
        <img src={imageUrl} alt={title} />
        <div className={styles.content}>
            <div className={styles.title}>{title}</div>
            <div className={styles.subtitle}>{subtitle}</div>
            {children &&
                <div className={styles.details}>
                    {children}
                </div>
            }
        </div>
    </div>
);
