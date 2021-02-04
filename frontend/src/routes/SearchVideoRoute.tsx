import React, {useState} from 'react';

import {Form, FormGroup, ControlLabel, Uploader, Button, FormControl, Progress} from 'rsuite';

import {API_BASE_URL, dndPlaceholderStyle} from './ClassifyRoute';

import styles from './SearchVideoRoute.module.css';
import {FileType} from "rsuite/lib/Uploader";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

export default function SearchVideoRoute() {
    const [videoList, setVideoList] = useState<FileType[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>();
    const [category, setCategory] = useState<string>();

    const [result, setResult] = useState<AxiosResponse>();

    const upload = async () => {
        const formData = new FormData();
        const video = videoList[0].blobFile;
        console.log(category)

        if (video) formData.append('video', video);
        console.log(formData.entries())
        const config: AxiosRequestConfig = {
            onUploadProgress: progress => setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
        }


        const blob = new Blob([categoriesToJson(category)], {
        type: 'application/json'
        });
        const file = new File([blob], 'categories.json')
        formData.append('categories', file, 'categories.json');


        const response = await axios.post(`${API_BASE_URL}/video`, formData, config);
        setResult(response)
        console.log(result)

        setUploadProgress(undefined);
    };
    return (
        <div>
            <Form className={styles.form}>
                <FormGroup>
                    <ControlLabel>Video File</ControlLabel>
                    <Uploader
                        name='video'
                        accept='.mp4'
                        fileList={videoList}
                        onChange={list => setVideoList([list[list.length - 1]])}
                        draggable
                        autoUpload={false}
                    >
                        <div style={dndPlaceholderStyle}>Click here, or drag files into this area.</div>
                    </Uploader>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Categories</ControlLabel>
                    <FormControl
                        name='categories'
                        value={category}
                        onChange={setCategory}
                    />
                </FormGroup>
                <div className={styles.uploadControls}>
                    <Button onClick={upload} loading={(uploadProgress ?? 100) < 100}>Upload</Button>
                    {typeof uploadProgress !== 'undefined' &&
                        <Progress.Line className={styles.progressBar} percent={uploadProgress} status={uploadProgress === 100 ? 'success' : undefined} />
                    }
                </div>
            </Form>
        </div>
    );
}

function categoriesToJson(s: string | undefined) {

    var data = {"categories": [s]}
    console.log(JSON.stringify(data))
    return JSON.stringify(data);
}
