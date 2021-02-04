import React, { useState } from 'react';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Form, FormGroup, ControlLabel, Uploader, Button, Progress } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import styles from './ClassifyRoute.module.css';

export const API_BASE_URL = 'http://localhost:8080';
export const dndPlaceholderStyle = {
    lineHeight: '62px',
};

export default function ClassifyRoute() {
    const [imageList, setImageList] = useState<FileType[]>([]);
    const [categoryList, setCategoryList] = useState<FileType[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>();
    const [result, setResult] = useState<AxiosResponse>();

    const isInputInvalid = imageList.length === 0 || categoryList.length !== 1;

    const upload = async () => {
        if (isInputInvalid) return;
        const formData = new FormData();
        imageList.forEach(file => file.blobFile && formData.append('files', file.blobFile))
        const categoryFile = categoryList[0].blobFile;
        if (categoryFile) formData.append('categories', categoryFile);

        const config: AxiosRequestConfig = {
            onUploadProgress: progress => setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
        }
        const response = await axios.post(`${API_BASE_URL}/categorize`, formData, config);
        setResult(response);
        setUploadProgress(undefined);
    };

    return (
        <div>
            <Form className={styles.form}>
                <FormGroup>
                    <ControlLabel>Image Files</ControlLabel>
                    <Uploader
                        name='files'
                        fileList={imageList}
                        onChange={setImageList}
                        accept='.png,.jpg'
                        multiple
                        draggable
                        autoUpload={false}
                        listType='picture'
                    >
                        <div style={{ ...dndPlaceholderStyle, fontSize: '25px' }}>+</div>
                    </Uploader>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Categories</ControlLabel>
                    <Uploader
                        name='categories'
                        fileList={categoryList}
                        onChange={list => setCategoryList(list.length > 0 ? [list[list.length - 1]] : [])}
                        accept='.csv,.json'
                        draggable
                        autoUpload={false}>
                        <div style={dndPlaceholderStyle}>Click here, or drag a csv or json file into this area.</div>
                    </Uploader>
                </FormGroup>
                <div className={styles.uploadControls}>
                    <Button onClick={upload} disabled={isInputInvalid} loading={(uploadProgress ?? 100) < 100}>Upload</Button>
                    {typeof uploadProgress !== 'undefined' &&
                        <Progress.Line className={styles.progressBar} percent={uploadProgress} status={uploadProgress === 100 ? 'success' : undefined} />
                    }
                </div>
            </Form>
            <div style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result?.data, undefined, 2)}</div>
        </div>
    );
}
