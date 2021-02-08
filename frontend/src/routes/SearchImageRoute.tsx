import React, { useState } from 'react';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Form, FormGroup, ControlLabel, Uploader, Button, Progress } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';

import { API_BASE_URL, dndPlaceholderStyle } from './ClassifyRoute';

import styles from './SearchImageRoute.module.css';

function ImagePanel({ imageMap, imageList }: { imageMap: { [key: string]: string }, imageList: FileType[] }) {
    var panels = [];

    for (const key in imageMap) {
        var image = imageList.find(x => x.name === imageMap[key]);
        if (!image) continue;
        var image_url = URL.createObjectURL(image.blobFile);
        panels.push(
            <ImageGridItem key={key}
                imageUrl={image_url}
                title={key}
                subtitle={image?.name}
            />
        );
    }

    return <ImageGrid>{panels}</ImageGrid>;
}

export default function SearchImageRoute() {
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
        const response = await axios.post(`${API_BASE_URL}/image`, formData, config);
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
            <ImagePanel imageMap={result?.data} imageList={imageList} />
        </div>
    );
}
