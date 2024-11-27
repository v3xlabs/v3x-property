import { OrbitControls, Stage } from '@react-three/drei';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { Text } from 'troika-three-text';

const measurementOffset = 3;

function Measurements({ geometry }: { geometry: THREE.BufferGeometry }) {
    const { camera } = useThree();
    const [lines, setLines] = useState<THREE.Line[]>([]);
    const [labels, setLabels] = useState<THREE.Object3D[]>([]);

    useEffect(() => {
        if (geometry.boundingBox) {
            const size = geometry.boundingBox.getSize(new THREE.Vector3());
            const { min } = geometry.boundingBox;

            const adjustedCorner = new THREE.Vector3(min.x, min.z + 10, -min.y);

            // Create lines and labels for each dimension with different colors and thickness
            const lineMaterials = [
                new THREE.LineBasicMaterial({
                    color: 0xFF_00_00,
                    linewidth: 2,
                }), // Red for width
                new THREE.LineBasicMaterial({
                    color: 0x00_FF_00,
                    linewidth: 2,
                }), // Green for height
                new THREE.LineBasicMaterial({
                    color: 0x00_00_FF,
                    linewidth: 2,
                }), // Blue for depth
            ];
            const labelMaterial = new THREE.SpriteMaterial({
                color: 0x00_00_00, // Black text for better contrast
                opacity: 0.8, // Slight transparency for better visibility
            });

            const createLine = (
                start: THREE.Vector3,
                end: THREE.Vector3,
                material: THREE.LineBasicMaterial
            ) => {
                const points = [start, end];
                const lineGeometry = new THREE.BufferGeometry().setFromPoints(
                    points
                );

                return new THREE.Line(lineGeometry, material);
            };

            const createLabel = (position: THREE.Vector3, text: string) => {
                const textMesh = new Text();

                textMesh.text = text;
                textMesh.fontSize = 2;
                textMesh.color = 0x33_33_33;
                textMesh.position.set(0, 0, 0.1);
                textMesh.anchorX = 'center';
                textMesh.anchorY = 'middle';

                // Ensure the text is updated
                textMesh.sync();

                // Create a background plane
                const backgroundGeometry = new THREE.PlaneGeometry(12, 6);
                const backgroundMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFF_FF_FF,
                    opacity: 0.5,
                    transparent: true,
                    depthTest: false,
                });
                const backgroundMesh = new THREE.Mesh(
                    backgroundGeometry,
                    backgroundMaterial
                );

                backgroundMesh.position.set(0, 0, 0);

                // Group text and background together
                const labelGroup = new THREE.Group();

                labelGroup.add(backgroundMesh);
                labelGroup.add(textMesh);

                // Add an offset to the z position to ensure it's above the floor
                const labelOffset = new THREE.Vector3(0, 0, 0.5); // Adjust the offset as needed

                labelGroup.position.copy(position).add(labelOffset);

                // Set render order to ensure labels are rendered on top
                labelGroup.renderOrder = 999;

                return labelGroup;
            };

            const newLines = [
                // Width line
                createLine(
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y,
                        adjustedCorner.z
                    ),
                    new THREE.Vector3(
                        adjustedCorner.x + size.x,
                        adjustedCorner.y,
                        adjustedCorner.z
                    ),
                    lineMaterials[0]
                ),
                // Height line
                createLine(
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y,
                        adjustedCorner.z
                    ),
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y + size.z,
                        adjustedCorner.z
                    ),
                    lineMaterials[1]
                ),
                // Depth line
                createLine(
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y,
                        adjustedCorner.z
                    ),
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y,
                        adjustedCorner.z - size.y
                    ),
                    lineMaterials[2]
                ),
            ];

            const newLabels = [
                // Center label for Width
                createLabel(
                    new THREE.Vector3(
                        adjustedCorner.x + size.x / 2,
                        adjustedCorner.y,
                        adjustedCorner.z
                    ),
                    `${size.x.toFixed(2)} mm`
                ),
                // Center label for Height
                createLabel(
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y + size.z / 2,
                        adjustedCorner.z
                    ),
                    `${size.z.toFixed(2)} mm`
                ),
                // Center label for Depth
                createLabel(
                    new THREE.Vector3(
                        adjustedCorner.x,
                        adjustedCorner.y,
                        adjustedCorner.z - size.y / 2
                    ),
                    `${size.y.toFixed(2)} mm`
                ),
            ];

            setLines(newLines);
            setLabels(newLabels);
        }
    }, [geometry]);

    useFrame(() => {
        for (const label of labels) {
            label.lookAt(camera.position);
        }
    });

    return (
        <>
            {lines.map((line, index) => (
                <primitive key={index} object={line} />
            ))}
            {labels.map((label, index) => (
                <primitive key={index} object={label} />
            ))}
        </>
    );
}

function Model({
    url,
    onLoad,
}: {
    url: string;
    onLoad?: (size: number, center: THREE.Vector3) => void;
}) {
    const geometry = useLoader(STLLoader, url);
    const meshReference = useRef<THREE.Mesh>(null);

    useEffect(() => {
        if (meshReference.current) {
            geometry.computeBoundingBox();
            const { boundingBox } = geometry;

            if (boundingBox) {
                const center = new THREE.Vector3();

                boundingBox.getCenter(center);

                // Swap the Y and Z axes to account for the axis swap
                const adjustedCenter = new THREE.Vector3(
                    center.x,
                    center.z,
                    -center.y
                );

                // Center the geometry based on the adjusted center
                geometry.center();

                if (onLoad) {
                    const size = boundingBox.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);

                    onLoad(maxDim, adjustedCenter);
                }
            }
        }
    }, [geometry, onLoad]);

    const size =
        geometry.boundingBox?.getSize(new THREE.Vector3()) ??
        new THREE.Vector3();

    return (
        <>
            <mesh
                ref={meshReference}
                geometry={geometry}
                // Adjust the position to center the model based on the adjusted center
                position={[
                    size.x / 2, // Centered on the X-axis
                    size.y / 2 + 0.1, // Slightly above the grid
                    -size.z/2, // Centered on the Z-axis
                ]}
                rotation={[(Math.PI / 2) * 3, 0, 0]}
            >
                <meshStandardMaterial
                    color="yellow"
                    roughness={0.8}
                    metalness={0.1}
                    flatShading
                />
            </mesh>
            <Measurements geometry={geometry} />
        </>
    );
}

export const StlPreviewWindow = ({ stlUrl }: { stlUrl?: string }) => {
    const [cameraDistance, setCameraDistance] = useState(80);
    const [modelCenter, setModelCenter] = useState<THREE.Vector3>(
        new THREE.Vector3(0, 0, 0)
    );
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    if (!stlUrl) return;

    const handleModelLoad = (size: number, center: THREE.Vector3) => {
        const distance = Math.max(size * 3, 100);

        setCameraDistance(distance);
        setModelCenter(center);
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <Canvas
                shadows
                camera={{
                    position: [
                        cameraDistance,
                        cameraDistance * 0.6,
                        cameraDistance / 2,
                    ],
                    fov: 70,
                    near: 0.1,
                    far: 1000,
                }}
            >
                <Suspense fallback={undefined}>
                    <Stage
                        environment="city"
                        intensity={0.5}
                        adjustCamera={false}
                        preset="rembrandt"
                    >
                        <Model url={stlUrl} onLoad={handleModelLoad} />
                    </Stage>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                        <planeGeometry args={[500, 500]} />
                        <meshStandardMaterial transparent opacity={0.4} />
                    </mesh>
                    <group position={[0, 1, 0]}>
                        <gridHelper args={[500, 50]} rotation={[0, 0, 0]} />
                    </group>
                    <OrbitControls
                        enableDamping
                        dampingFactor={0.05}
                        minDistance={1}
                        maxDistance={200}
                        target={modelCenter.toArray()}
                        autoRotate={isAutoRotating}
                        autoRotateSpeed={0.5}
                        onStart={() => {
                            setIsAutoRotating(false);
                        }}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};
