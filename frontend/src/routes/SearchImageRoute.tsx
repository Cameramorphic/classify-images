import React, { useState } from 'react';

import { Form } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import TextUploader, { TextInputType } from 'components/forms/TextUploader';
import ImageUploader from 'components/forms/ImageUploader';
import { UploadControls } from 'components/forms/UploadControls';
import { getTextFile } from 'helpers/fileHelper';
import { useAPI } from 'hooks/useAPI';

import styles from './SearchImageRoute.module.css';

export default function SearchImageRoute(): JSX.Element {
    const [imageList, setImageList] = useState<FileType[]>([]);
    const [category, setCategory] = useState<TextInputType>({});
    const { loading, progress, data, executePost } = useAPI({ path: 'image' });

    const isInputInvalid = imageList.length === 0 || !category.hasContent;

    const upload = () => {
        if (isInputInvalid) return;
        const formData = new FormData();
        imageList.forEach(file => file.blobFile && formData.append('files', file.blobFile));

        const file = getTextFile(category, 'categories');
        if (file) formData.append('categories', file);

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
                <TextUploader
                    label='Categories'
                    data={category}
                    onChange={setCategory}
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
                {data && Object.keys(data).map(key => {
                    const image = imageList.find(x => x.name === data[key]);
                    if (!image) return null;
                    const image_url = URL.createObjectURL(image.blobFile);
                    return (
                        <ImageGridItem key={key} imageUrl={image_url} title={key} subtitle={image.name} />
                    );
                })}
            </ImageGrid>
        </div>
    );
}
