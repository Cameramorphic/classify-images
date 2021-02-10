import React from 'react';

import { Button, Progress } from 'rsuite';

import styles from './UploadControls.module.css';

interface IProps {
    /** Disables the upload button. */
    disabled?: boolean;
    /** Shows a loading indicator on the upload button. */
    loading?: boolean;
    /** Upload progress in percent. Progress bar hidden if undefined. */
    progress?: number;
    onUpload?(): void;
}

export const UploadControls = ({ disabled, loading, progress, onUpload }: IProps): JSX.Element => (
    <div className={styles.uploadControls}>
        <Button onClick={onUpload} disabled={disabled} loading={loading}>Upload</Button>
        {typeof progress !== 'undefined' &&
            <Progress.Line
                className={styles.progressBar}
                percent={progress}
                status={progress === 100 ? 'success' : undefined}
            />
        }
    </div>
);
