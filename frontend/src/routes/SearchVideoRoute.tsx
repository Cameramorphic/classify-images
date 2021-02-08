import React, { useState } from 'react';

import { Form, FormGroup, ControlLabel, Uploader, Button, FormControl, Progress } from 'rsuite';
import { FileType } from "rsuite/lib/Uploader";

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import { useAPI } from 'hooks/useAPI';

import { dndPlaceholderStyle } from './ClassifyRoute';

import styles from './SearchVideoRoute.module.css';

function ImagePanel({ imageMap }: { imageMap: { [key: string]: string[]  } }) {
    var panels = [];
    for (const key in imageMap) {
        var image_content = imageMap[key][0].substring(2, imageMap[key][0].length - 1);
        var image_url = 'data:image/jpeg;base64,' + image_content;
        panels.push(
            <ImageGridItem key={key}
                imageUrl={image_url}
                title={key}
            />
        );
    }

    return <ImageGrid>{panels}</ImageGrid>;
}

export default function SearchVideoRoute() {
    const [videoList, setVideoList] = useState<FileType[]>([]);
    const [category, setCategory] = useState<string>();
    const { loading, progress, data, executePost } = useAPI({ path: 'video' });

    const isInputInvalid = videoList.length === 0 || category === undefined;


    const upload = async () => {
        const formData = new FormData();

        if (videoList[0]) {
            const video = videoList[0].blobFile;
            if (video) formData.append('video', video);

            //only appends json categories file if at least one category is defined
            const json = categoriesToJson(category)
            if (json) {
                const blob = new Blob([json], {
                    type: 'application/json'
                });
                const file = new File([blob], 'categories.json')
                formData.append('categories', file, 'categories.json');
            }

            await executePost(formData);
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
                    <Button onClick={upload} disabled={isInputInvalid} loading={loading}>Upload</Button>
                    {typeof progress !== 'undefined' &&
                        <Progress.Line className={styles.progressBar} percent={progress} status={progress === 100 ? 'success' : undefined} />
                    }
                </div>

            </Form>
            <ImagePanel imageMap={data} />
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
        var data = { "categories": categories }
        return JSON.stringify(data);
    }
    return undefined;

}




