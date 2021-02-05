import React, { useState } from 'react';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Form, FormGroup, ControlLabel, Uploader, Button, Progress, Panel , Row, Col, Grid, FlexboxGrid, PanelGroup, Placeholder, PanelProps} from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';


import styles from './ClassifyRoute.module.css';

export const API_BASE_URL = 'http://localhost:8080';
export const dndPlaceholderStyle = {
    lineHeight: '62px',
};
const { Paragraph } = Placeholder;

// function ImagePanel({categoryMap, imageList}: {categoryMap: {[key: string]: string}, imageList : FileType[]}) {
//     return <FlexboxGrid justify="space-around">{categoryMap &&
//         imageList.map(img => {
//             const category = img.name ? categoryMap[img.name] : undefined;
//             const image_url = URL.createObjectURL(img.blobFile);
//             return (
//                 <FlexboxGrid.Item colspan={100}>
//                     <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }} key={image_url}>
//                         <img src={image_url} height="240" />
//                         <Panel header={category}></Panel>
//                     </Panel>
//                     </FlexboxGrid.Item>)
//         })
//         }</FlexboxGrid>
// }

const Card = (props: JSX.IntrinsicAttributes & PanelProps<any>) => (
    <Panel {...props} bordered header="Card title">
      <Paragraph />
    </Panel>
  );
  
  function ImagePanel({categoryMap, imageList}: {categoryMap: {[key: string]: string}, imageList : FileType[]}) {
return (
    <Row>
      <Col md={6} sm={12}>
        <Card />
      </Col>
      <Col md={6} sm={12}>
        <Card />
      </Col>
      <Col md={6} sm={12}>
        <Card />
      </Col>
      <Col md={6} sm={12}>
        <Card />
      </Col>
    </Row>)
}

// function ImagePanel({categoryMap, imageList}: {categoryMap: {[key: string]: string}, imageList : FileType[]}) {
    
//     return <FlexboxGrid justify="space-around">
//         <FlexboxGrid.Item colspan={100}> <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }}>
//         <img src="https://via.placeholder.com/240x240" height="240" />
//                         <Panel header={'hi'}></Panel>
//         </Panel> </FlexboxGrid.Item>
//         <FlexboxGrid.Item colspan={100}> <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }}>
//         <img src="https://via.placeholder.com/240x240" height="240" />
//                         <Panel header={'hi'}></Panel>
//         </Panel> </FlexboxGrid.Item>
//         <FlexboxGrid.Item colspan={100}> <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }}>
//         <img src="https://via.placeholder.com/240x240" height="240" />
//                         <Panel header={'hi'}></Panel>
//         </Panel> </FlexboxGrid.Item>
//         <FlexboxGrid.Item colspan={100}> <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }}>
//         <img src="https://via.placeholder.com/240x240" height="240" />
//                         <Panel header={'hi'}></Panel>
//         </Panel> </FlexboxGrid.Item>
//         <FlexboxGrid.Item colspan={100}> <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }}>
//         <img src="https://via.placeholder.com/240x240" height="240" />
//                         <Panel header={'hi'}></Panel>
//         </Panel> </FlexboxGrid.Item>
//         <FlexboxGrid.Item colspan={100}> <Panel shaded bordered bodyFill style={{ display: 'inline-block', width: 240 }}>
//         <img src="https://via.placeholder.com/240x240" height="240" />
//                         <Panel header={'hi'}></Panel>
//         </Panel> </FlexboxGrid.Item>
//   </FlexboxGrid>
// }

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
            <ImagePanel categoryMap={result?.data} imageList={imageList}/>
        </div>
    );
}
