import { useDropzone } from 'react-dropzone';

export const MediaDropzone = () => {
    const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
        useDropzone({
            onDrop: (acceptedFiles) => {
                console.log(acceptedFiles);
            },
        });

    // Figure out the filetypes of the accepted files
    const coolData = acceptedFiles.map((file) => file.type);

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
            {/* {JSON.stringify(acceptedFiles)} */}
            {/* {JSON.stringify(coolData)} */}
            {acceptedFiles.map((file) => {
                return (
                    <div key={file.name}>
                        {file.name}
                        <img src={URL.createObjectURL(file)} alt={file.name} />
                    </div>
                );
            })}
        </div>
    );
};
