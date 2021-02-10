import React, { useState } from 'react';

import { Form } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import GenericUploader from 'components/forms/GenericUploader';
import ImageUploader from 'components/forms/ImageUploader';
import { UploadControls } from 'components/forms/UploadControls';
import { useAPI } from 'hooks/useAPI';

import styles from './ClassifyRoute.module.css';

export default function ClassifyRoute(): JSX.Element {
    const [imageList, setImageList] = useState<FileType[]>([]);
    const [categoryList, setCategoryList] = useState<FileType[]>([]);

    const { loading, progress, data, executePost } = useAPI({ path: 'categorize' });

    const isInputInvalid = imageList.length === 0 || categoryList.length > 1;

    const upload = () => {
        if (isInputInvalid) return;
        const formData = new FormData();
        imageList.forEach(file => file.blobFile && formData.append('files', file.blobFile));
        if (categoryList.length !== 0) {
            const categoryFile = categoryList[0].blobFile;
            if (categoryFile) formData.append('categories', categoryFile);
        }
        executePost(formData);
    };

    return (
        <div>
            <Form className={styles.form}>
                <ImageUploader
                    label='Image Files'
                    fileList={imageList}
                    onChange={setImageList}
                />
                <GenericUploader
                    label='Categories'
                    fileList={categoryList}
                    onChange={setCategoryList}
                    accept={['.csv', '.json']}
                />
                <UploadControls
                    onUpload={upload}
                    disabled={isInputInvalid}
                    loading={loading}
                    progress={progress}
                />
            </Form>
            <ImageGrid>
                {data && imageList.map(img => {
                    const category = img.name ? data[img.name] : undefined;
                    const image_url = URL.createObjectURL(img.blobFile);
                    return <ImageGridItem key={image_url} imageUrl={image_url} title={category} subtitle={img.name} />;
                })}
            </ImageGrid>
        </div>
    );
}
