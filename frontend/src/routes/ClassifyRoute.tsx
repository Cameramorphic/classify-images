import React, { useState } from 'react';

import { Form, FormGroup, ControlLabel, Uploader, Button, Progress } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import { useAPI } from 'hooks/useAPI';

import styles from './ClassifyRoute.module.css';

export const API_BASE_URL = 'http://localhost:8080';
export const dndPlaceholderStyle = {
    lineHeight: '62px',
};

function ImagePanel({ categoryMap, imageList }: { categoryMap: { [key: string]: string }, imageList: FileType[] }) {
    return <ImageGrid>
        {categoryMap &&
            imageList.map(img => {
                const category = img.name ? categoryMap[img.name] : undefined;
                const image_url = URL.createObjectURL(img.blobFile);
                return (
                    <ImageGridItem key={image_url}
                        imageUrl={image_url}
                        title={category}
                        subtitle={img.name}
                    />
                );
            })
        }
    </ImageGrid>
}

export default function ClassifyRoute() {
    const [imageList, setImageList] = useState<FileType[]>([]);
    const [categoryList, setCategoryList] = useState<FileType[]>([]);

    const { loading, progress, data, executePost } = useAPI({ path: 'categorize' });

    const isInputInvalid = imageList.length === 0 || categoryList.length > 1;

    const upload = async () => {
        if (isInputInvalid) return;
        const formData = new FormData();
        imageList.forEach(file => file.blobFile && formData.append('files', file.blobFile))
        if (categoryList.length !== 0) {
            const categoryFile = categoryList[0].blobFile;
            if (categoryFile) formData.append('categories', categoryFile);
        }
        await executePost(formData);
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
                        accept='.png,.jpg,.jpeg'
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
                    <Button onClick={upload} disabled={isInputInvalid} loading={loading}>Upload</Button>
                    {typeof progress !== 'undefined' &&
                        <Progress.Line className={styles.progressBar} percent={progress} status={progress === 100 ? 'success' : undefined} />
                    }
                </div>
            </Form>
            <ImagePanel categoryMap={data} imageList={imageList} />
        </div>
    );
}
