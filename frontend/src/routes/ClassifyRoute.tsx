import React, { useState } from 'react';

import { Form } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import { ImageGrid, ImageGridItem } from 'components/ImageGrid';
import GenericUploader from 'components/forms/GenericUploader';
import ImageUploader from 'components/forms/ImageUploader';
import { UploadControls } from 'components/forms/UploadControls';
import { useAPI } from 'hooks/useAPI';

import styles from './ClassifyRoute.module.css';

/**
 * Creates all the image panels to show the results.
 * @param param0 
 */
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
            <ImagePanel categoryMap={data} imageList={imageList} />
        </div>
    );
}
