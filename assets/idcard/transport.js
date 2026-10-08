// No image re-encoding: gzip restores the exact original field bytes.
async function appendToolTransport(formData, actionType, extra) {
    const compressible = new Set(['analyze_pvc_crop_ai', 'analyze_document_crop_ai', 'save_document_crop_learning_ai', 'save_pvc_auto_crop_template', 'save_pvc_mode_correction_ai']);
    const entries = Object.entries(extra).map(([key, value]) => [key, value == null ? '' : value]);
    const estimatedSize = entries.reduce((size, [, value]) => size + (typeof value === 'string' ? value.length : 0), 0);
    if (compressible.has(actionType) && window.siteConfig.gzipUploadSupported
        && typeof CompressionStream === 'function' && estimatedSize >= 32768 && estimatedSize <= 8 * 1024 * 1024
        && entries.every(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))) {
        try {
            const original = new Blob([JSON.stringify(Object.fromEntries(entries))], { type: 'application/json' });
            if (original.size <= 8 * 1024 * 1024) {
                const packed = await new Response(original.stream().pipeThrough(new CompressionStream('gzip'))).blob();
                if (packed.size <= (window.siteConfig.gzipUploadMaxBytes ?? 8 * 1024 * 1024)
                    && packed.size + 256 < original.size * 0.95) {
                    formData.append('tool_payload_gzip', packed, 'payload.json.gz');
                    return;
                }
            }
        } catch (_) {
            // Older/restricted browsers send the original fields on the first request.
        }
    }
    entries.forEach(([key, value]) => formData.append(key, value));
}

const akToolLibraryLoads = new Map();
function loadToolLibrary(name, url, ready) {
    if (ready()) return Promise.resolve();
    if (akToolLibraryLoads.has(name)) return akToolLibraryLoads.get(name);
    const promise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        const timer = setTimeout(() => fail(), 30000);
        const fail = () => {
            clearTimeout(timer);
            script.remove();
            reject(new Error(name + ' library could not be loaded. Please retry.'));
        };
        script.onload = () => {
            clearTimeout(timer);
            if (ready()) resolve();
            else fail();
        };
        script.onerror = fail;
        document.head.appendChild(script);
    });
    akToolLibraryLoads.set(name, promise);
    promise.catch(() => akToolLibraryLoads.delete(name));
    return promise;
}
