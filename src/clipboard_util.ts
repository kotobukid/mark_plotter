const getClipboardImage = async (): Promise<Blob | null> => {
    try {
        const clipboardItems = await navigator.clipboard.read();
        for (const clipboardItem of clipboardItems) {
            if (clipboardItem.types.includes('image/png')) {
                return await clipboardItem.getType('image/png');
            }
        }
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
    return null;
};

const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!blob) {
            reject();
        } else {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        }
    });
}

const getDataUrlDimensions = (dataUrl: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({width: img.width, height: img.height});
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
};

const getDataUrlAndDimensions = (dataUrl: string, gen_id: () => number): Promise<{
    dataUrl: string,
    width: number,
    height: number,
    id: number
}> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({
                dataUrl: dataUrl,
                width: img.width,
                height: img.height,
                id: gen_id()
            });
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
};

export {
    getClipboardImage,
    blobToDataURL,
    getDataUrlAndDimensions
}

