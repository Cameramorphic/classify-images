import React from 'react';

import { Alert, ControlLabel, FormGroup, Uploader, UploaderProps } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

export const validateOnChange = (list: FileType[], accept?: string[], onChange?: (list: FileType[]) => void): void => {
    if (accept && accept.length > 0) {
        const regex = new RegExp(`(${accept.join('|')})$`);
        if (list.some(file => !regex.test(file.name ?? ''))) {
            Alert.error(`You selected an unsupported file. You can only select ${accept.join(', ')} files.`, 8000);
            return;
        }
    }
    onChange?.(list);
};

export type GenericUploaderProps = {
    label?: string;
    accept?: string[];
    multiple?: boolean;
} & Pick<UploaderProps, 'fileList' | 'onChange'>;

type IProps = GenericUploaderProps

export default function GenericUploader({ label, accept, multiple, fileList, onChange }: IProps): JSX.Element {
    const uploader =
        <Uploader
            fileList={fileList}
            onChange={list => {
                const filteredList = (multiple || list.length < 2) ? list : [list[list.length - 1]];
                validateOnChange?.(filteredList, accept, onChange);
            }}
            accept={accept?.join()}
            draggable
            multiple={multiple}
            autoUpload={false}>
            <div style={{ lineHeight: '60px' }}>Click here, or drag a {accept?.join(' or ')} file into this area.</div>
        </Uploader>;

    return label
        ? <FormGroup>
            <ControlLabel>{label}</ControlLabel>
            {uploader}
        </FormGroup>
        : uploader;
}
