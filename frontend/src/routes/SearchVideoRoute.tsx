import React, {useState} from 'react';

import {Form, FormGroup, ControlLabel, Uploader, Button, FormControl, Progress, Panel, FlexboxGrid} from 'rsuite';

import {API_BASE_URL, dndPlaceholderStyle} from './ClassifyRoute';

import styles from './SearchVideoRoute.module.css';
import {FileType} from "rsuite/lib/Uploader";
import axios, {AxiosRequestConfig, AxiosResponse} from "axios";

function ImagePanel({imageMap}: {imageMap: {[key: string]: string}}) {
    var panels = [];

    for (var key in imageMap ){
        var image_content = imageMap[key].substring(2, imageMap[key].length-1);
        var image_url = 'data:image/jpeg;base64,' + image_content;
        panels.push((
            <FlexboxGrid.Item colspan={100}>
                <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240}}>
                <img src={image_url} height="240" />
                    <Panel header={key}></Panel>
                </Panel>
                </FlexboxGrid.Item>));
    }

    return (<FlexboxGrid justify="space-around">{
        imageMap && panels
    }</FlexboxGrid>)
}

export default function SearchVideoRoute() {
    const [videoList, setVideoList] = useState<FileType[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>();
    const [category, setCategory] = useState<string>();

    const [result, setResult] = useState<AxiosResponse>();

    const isInputInvalid = videoList.length === 0 || category == undefined;


    const upload = async () => {
        const formData = new FormData();

        if (videoList[0]) {
            const video = videoList[0].blobFile;
            if (video) formData.append('video', video);
            const config: AxiosRequestConfig = {
                onUploadProgress: progress => setUploadProgress(Math.round((progress.loaded / progress.total) * 100))
            }

            //only appends json categories file if at least one category is defined
            const json = categoriesToJson(category)
            if (json) {
                const blob = new Blob([json], {
                    type: 'application/json'
                });
                const file = new File([blob], 'categories.json')
                formData.append('categories', file, 'categories.json');
            }

            const response = await axios.post(`${API_BASE_URL}/video`, formData, config);
            setResult(response)
            setUploadProgress(undefined);
        }
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
                        onChange={list => {
                            if (list.length > 1) setVideoList([list[list.length - 1]])
                            else setVideoList(list)
                        }}
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
                    <Button onClick={upload} disabled={isInputInvalid} loading={(uploadProgress ?? 100) < 100}>Upload</Button>
                    {typeof uploadProgress !== 'undefined' &&
                        <Progress.Line className={styles.progressBar} percent={uploadProgress} status={uploadProgress === 100 ? 'success' : undefined} />
                    }
                </div>

            </Form>
            <ImagePanel imageMap={result?.data}/>
        </div>
    );
}


function categoriesToJson(s: string | undefined) {

    if (s) {
        //replaces multiple whitespaces with only one and replaces semicolons with ','
        const categoriesWithoutMultipleWhitespaces = s?.replace(/\s\s+/g, ' ')
            .replaceAll(';', ',');
        //trims leading and ending whitespaces
        var categories = categoriesWithoutMultipleWhitespaces.split(',')
        for (let i = 0; i < categories.length; i++) {
            categories[i] = categories[i].trim()
        }
    var data = {"categories": categories}
    console.log(JSON.stringify(data))
    return JSON.stringify(data);
    }
    return undefined;

}




