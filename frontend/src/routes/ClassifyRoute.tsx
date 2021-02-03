import React, { useState } from 'react';

import { Form, FormGroup, ControlLabel, Uploader, Button } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import styles from './ClassifyRoute.module.css';

export const dndPlaceholderStyle = {
    lineHeight: '60px'
};

export default function ClassifyRoute() {
    const [imageList, setImageList] = useState<FileType[]>([]);
    return (
        <div>
            <Form className={styles.form}>
                <FormGroup>
                    <ControlLabel>Image Files</ControlLabel>
                    <Uploader
                        name='files'
                        fileList={imageList}
                        onChange={setImageList}
                        accept='.png'
                        multiple
                        draggable
                        autoUpload={false}
                    >
                        <div style={dndPlaceholderStyle}>Click here, or drag files into this area.</div>
                    </Uploader>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Categories</ControlLabel>
                    <Uploader name='files' draggable autoUpload={false}>
                        <div style={dndPlaceholderStyle}> Click here, or drag files into this area.</div>
                    </Uploader>
                </FormGroup>
                <Button>Upload</Button>
            </Form>
        </div>
    );
}
