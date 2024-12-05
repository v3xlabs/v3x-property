import { FC } from 'react';
import { useDropzone } from 'react-dropzone';

export const MediaDropzone: FC<{
    onDrop: (_acceptedFiles: File[]) => void;
}> = ({ onDrop }) => {
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop: (acceptedFiles) => {
                onDrop(acceptedFiles);
            },
        });

    return (
        <div
            className="border min-h-32 border-dashed border-gray-300 rounded-lg p-4 grow flex items-center justify-center"
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
