import { FC } from 'react';
import { useDropzone } from 'react-dropzone';

export const MediaDropzone: FC<{
    onDrop: (acceptedFiles: File[]) => void;
}> = ({ onDrop }) => {
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop: (acceptedFiles) => {
                onDrop(acceptedFiles);
            },
        });

    return (
        <div
            className="border border-dashed border-gray-300 rounded-lg p-4"
            {...getRootProps()}
        >
            <input {...getInputProps()} />
            {isDragActive ? (
                <p className="text-center text-sm text-gray-500">
                    And now release to upload
                </p>
            ) : (
                <p className="text-center text-sm text-gray-500">
                    Drag and drop files here
                </p>
            )}
        </div>
    );
};
