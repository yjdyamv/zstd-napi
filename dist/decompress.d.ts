import { Transform, TransformCallback } from 'stream';
/**
 * Zstandard decompression parameters.
 *
 * Most applications will not need to adjust these. See the
 * {@link https://facebook.github.io/zstd/zstd_manual.html | Zstandard manual}
 * for a full description.
 */
export interface DecompressParameters {
    windowLogMax?: number | undefined;
}
/**
 * High-level interface for customized single-pass Zstandard decompression.
 *
 * @example Basic usage
 * ```
 * const dec = new Decompressor();
 * const result = dec.decompress(compressedBuffer);
 * ```
 *
 * @example Advanced usage
 * ```
 * const dec = new Decompressor();
 * dec.setParameters({windowLogMax: 24});
 * dec.loadDictionary(fs.readFileSync('path/to/dictionary.dct'));
 * const result = dec.decompress(compressedBuffer);
 * ```
 */
export declare class Decompressor {
    private dctx;
    /**
     * Decompress the data in `buffer` with the configured dictionary/parameters.
     *
     * @param buffer - Compressed data
     * @returns A new buffer with the uncompressed data
     */
    decompress(buffer: Uint8Array): Buffer;
    /**
     * Load a compression dictionary from the provided buffer.
     *
     * The loaded dictionary will be used for all future {@link decompress} calls
     * until removed or replaced. Passing an empty buffer to this function will
     * remove a previously loaded dictionary.
     */
    loadDictionary(data: Uint8Array): void;
    /**
     * Reset the decompressor state to only the provided parameters.
     *
     * Any loaded dictionary will be cleared, and any parameters not specified
     * will be reset to their default values.
     */
    setParameters(parameters: DecompressParameters): void;
    /**
     * Modify decompression parameters.
     *
     * Parameters not specified will be left at their current values.
     */
    updateParameters(parameters: DecompressParameters): void;
}
/**
 * High-level interface for streaming Zstandard decompression.
 *
 * Implements the standard Node stream transformer interface, so can be used
 * with `.pipe` or any other streaming interface.
 *
 * @example Basic usage
 * ```
 * import { pipeline } from 'stream/promises';
 * await pipeline(
 *   fs.createReadStream('data.txt.zst'),
 *   new DecompressStream(),
 *   fs.createWriteStream('data.txt'),
 * );
 * ```
 */
export declare class DecompressStream extends Transform {
    private dctx;
    private inFrame;
    /**
     * Create a new streaming decompressor with the specified parameters.
     *
     * @param parameters - Decompression parameters
     */
    constructor(parameters?: DecompressParameters);
    /** @internal */
    _transform(chunk: unknown, _encoding: string, done: TransformCallback): void;
    /** @internal */
    _flush(done: TransformCallback): void;
}
