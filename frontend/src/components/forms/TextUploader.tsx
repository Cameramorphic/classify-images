import React from 'react';

import { ControlLabel, FormGroup, Input } from 'rsuite';
import { FileType } from 'rsuite/lib/Uploader';

import GenericUploader, { GenericUploaderProps } from './GenericUploader';

export type TextInputType = {
    /** Selected file. Undefined if no file selected. */
    fileValue?: FileType;
    /** Input text. Undefined if a file is selected. */
    textValue?: string;
    /** Shorthand for checking if either the text or a file exists. */
    hasContent?: boolean;
};

interface IProps extends Pick<GenericUploaderProps, 'label' | 'accept'> {
    data: TextInputType;
    onChange(data: TextInputType): void;
    textPlaceholder?: string;
}

export default function TextUploader({ label, accept, data, onChange, textPlaceholder }: IProps): JSX.Element {
    const fileValue = data.fileValue ? [data.fileValue] : [];
    const textValue = data.textValue ?? '';

    const uploader = <>
        <GenericUploader
            fileList={fileValue}
            onChange={list => {
                const file = list[0];
                const hasContent = typeof file !== 'undefined';
                onChange({ fileValue: file, hasContent });
            }}
            accept={accept}
        />
        {fileValue.length === 0 &&
            <Input
                value={textValue}
                onChange={text => onChange({ textValue: text, hasContent: text !== '' })}
                placeholder={textPlaceholder ?? '...or type a comma separated list'}
                style={{ boxSizing: 'border-box' }}
            />
        }
    </>;

    return label
        ? <FormGroup>
            <ControlLabel>{label}</ControlLabel>
            {uploader}
        </FormGroup>
        : uploader;
}
