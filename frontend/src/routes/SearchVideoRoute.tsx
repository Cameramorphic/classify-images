import React from 'react';

import { Form, FormGroup, ControlLabel, Uploader, Button, FormControl } from 'rsuite';

import { dndPlaceholderStyle } from './ClassifyRoute';

import styles from './SearchVideoRoute.module.css';

export default function SearchVideoRoute() {
    return (
        <div>
            <Form className={styles.form}>
                <FormGroup>
                    <ControlLabel>Video File</ControlLabel>
                    <Uploader
                        name='video'
                        accept='.mp4'
                        draggable
                        autoUpload={false}
                    >
                        <div style={dndPlaceholderStyle}>Click here, or drag files into this area.</div>
                    </Uploader>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Categories</ControlLabel>
                    <FormControl name='categories' />
                </FormGroup>
                <Button>Upload</Button>
            </Form>
        </div>
    );
}
