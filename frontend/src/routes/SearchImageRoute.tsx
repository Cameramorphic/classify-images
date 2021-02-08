import React, { useState } from 'react';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Form, FormGroup, ControlLabel, Uploader, Button, Progress, Panel, FlexboxGrid, Placeholder } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import styles from './ClassifyRoute.module.css';

export const API_BASE_URL = 'http://localhost:8080';
export const dndPlaceholderStyle = {
    lineHeight: '62px',
};

function ImagePanel({imageMap, imageList}: {imageMap: {[key: string]: string}, imageList : FileType[]}) {
    var panels = [];
    var imageNames = imageList.map(img => img.name);

    for (var key in imageMap){
        var image_index = imageNames.findIndex(x => x===imageMap[key]);
        var image = imageList[image_index];
        var image_url = URL.createObjectURL(image.blobFile);
        panels.push((
            <FlexboxGrid.Item colspan={100}>
                <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240}}>
                <img src={image_url} height="240" />
                    <Panel header={key + '\n('+ image.name +')'}></Panel>
                </Panel>
                </FlexboxGrid.Item>));
    }

    return (<FlexboxGrid justify="space-around">{
        imageMap && panels
    }</FlexboxGrid>)
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
            <ImagePanel imageMap={result?.data} imageList={imageList}/>
        </div>
    );
}