const getClipboardImage = async (): Promise<Blob | null> => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            if (clipboardItem.types.includes('image/png')) {
                const blob = await clipboardItem.getType('image/png');
                return blob;
            }
        }
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
    return null;
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

const prepareImage = (dataUrl: string) => {
    const svg = document.querySelector('svg');
    if (svg) {
        getDataUrlDimensions(dataUrl).then(dimensions => {
            console.log(dimensions);
            const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            console.log({
                width: img.width,
                height: img.height,
            })
            img.setAttributeNS(null, 'href', dataUrl);
            img.setAttributeNS(null, 'x', '0');
            img.setAttributeNS(null, 'y', '0');
            img.setAttributeNS(null, 'height', dimensions.height); // 必要に応じて調整
            img.setAttributeNS(null, 'width', dimensions.width);  // 必要に応じて調整
            svg.appendChild(img);
        }).catch(error => {
            console.error('Error while getting dimensions from Data URL:', error);
        });
    } else {
        console.error('SVG element not found');
    }
}

const getDataUrlDimensions = (dataUrl: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
};

const getDataUrlAndDimensions = (dataUrl: string): Promise<{ dataUrl: string, width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = dataUrl;

        resolve({
            dataUrl: dataUrl,
            width: img.width,
            height: img.height
        });
    });
};

export {
    getClipboardImage,
    blobToDataURL,
    addImageToSvg,
    getDataUrlAndDimensions
}

