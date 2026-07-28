import { Transform, TransformCallback } from 'stream';
import binding = require('../binding');
/**
 * Zstandard compression parameters.
 *
 * Most applications will only need the {@link compressionLevel} parameter. See
 * the {@link https://facebook.github.io/zstd/zstd_manual.html | Zstandard manual}
 * for a full description.
 */
export interface CompressParameters {
    /**
     * Compression level, where higher numbers compress better but are slower.
     *
     * Typical values range from 1 to 9, with a default of 3, but values up to 22
     * are allowed, as are negative values (see {@link binding.minCLevel}). Zero
     * is interpreted as "use the default".
     *
     * @category Basic parameters
     */
    compressionLevel?: number | undefined;
    /** @category Advanced compression options */
    windowLog?: number | undefined;
    /** @category Advanced compression options */
    hashLog?: number | undefined;
    /** @category Advanced compression options */
    chainLog?: number | undefined;
    /** @category Advanced compression options */
    searchLog?: number | undefined;
    /** @category Advanced compression options */
    minMatch?: number | undefined;
    /** @category Advanced compression options */
    targetLength?: number | undefined;
    /** @category Advanced compression options */
    strategy?: keyof typeof binding.Strategy | undefined;
    /** @category Advanced compression options */
    targetCBlockSize?: number | undefined;
    /** @category Long-distance matching */
    enableLongDistanceMatching?: boolean | undefined;
    /** @category Long-distance matching */
    ldmHashLog?: number | undefined;
    /** @category Long-distance matching */
    ldmMinMatch?: number | undefined;
    /** @category Long-distance matching */
    ldmBucketSizeLog?: number | undefined;
    /** @category Long-distance matching */
    ldmHashRateLog?: number | undefined;
    /** @category Frame parameters */
    contentSizeFlag?: boolean | undefined;
    /** @category Frame parameters */
    checksumFlag?: boolean | undefined;
    /** @category Frame parameters */
    dictIDFlag?: boolean | undefined;
    /** @category Multi-threading parameters */
    nbWorkers?: number | undefined;
    /** @category Multi-threading parameters */
    jobSize?: number | undefined;
    /** @category Multi-threading parameters */
    overlapLog?: number | undefined;
}
/**
 * High-level interface for customized single-pass Zstandard compression.
 *
 * @example Basic usage
 * ```
 * const cmp = new Compressor();
 * const result = cmp.compress(Buffer.from('your data here'));
 * ```
 *
 * @example Advanced usage
 * ```
 * const cmp = new Compressor();
 * cmp.setParameters({compressionLevel: 9});
 * cmp.loadDictionary(fs.readFileSync('path/to/dictionary.dct'));
 * const result = cmp.compress(Buffer.from('your data here'));
 * ```
 */
export declare class Compressor {
    private cctx;
    private scratchBuf;
    private scratchLen;
    /**
     * Compress the data in `buffer` with the configured dictionary/parameters.
     *
     * @param buffer - Data to compress
     * @returns A new Buffer containing the compressed data
     */
    compress(buffer: Uint8Array): Buffer;
    /**
     * Load a compression dictionary from the provided buffer.
     *
     * The loaded dictionary will be used for all future {@link compress} calls
     * until removed or replaced. Passing an empty buffer to this function will
     * remove a previously loaded dictionary.
     *
     * Set any parameters you want to set before loading a dictionary, since
     * parameters can't be changed while a dictionary is loaded.
     */
    loadDictionary(data: Uint8Array): void;
    /**
     * Reset the compressor state to only the provided parameters.
     *
     * Any loaded dictionary will be cleared, and any parameters not specified
     * will be reset to their default values.
     */
    setParameters(parameters: CompressParameters): void;
    /**
     * Modify compression parameters.
     *
     * Parameters not specified will be left at their current values. Changing
     * parameters is not possible while a dictionary is loaded.
     */
    updateParameters(parameters: CompressParameters): void;
}
/**
 * High-level interface for streaming Zstandard compression.
 *
 * Implements the standard Node stream transformer interface, so can be used
 * with `.pipe` or any other streaming interface.
 *
 * @example Basic usage
 * ```
 * import { pipeline } from 'stream/promises';
 * const cmp = new CompressStream();
 * await pipeline(
 *   fs.createReadStream('data.txt'),
 *   new CompressStream(),
 *   fs.createWriteStream('data.txt.zst'),
 * );
 * ```
 */
export declare class CompressStream extends Transform {
    private cctx;
    private buffer;
    /**
     * Create a new streaming compressor with the specified parameters.
     *
     * @param parameters - Compression parameters
     */
    constructor(parameters?: CompressParameters);
    /**
     * End the current Zstandard frame without ending the stream.
     *
     * Frames are compressed independently, so this can be used to create a
     * "seekable" archive, or to provide more resilience to data corruption by
     * isolating parts of the file from each other.
     *
     * The optional `callback` is invoked with the same semantics as it is for a
     * a stream write.
     */
    endFrame(callback?: (error?: Error | null) => void): void;
    /**
     * Flush internal compression buffers to the stream.
     *
     * Ensures that a receiver can decompress all bytes written so far without
     * as much negative impact to compression as {@link endFrame}.
     *
     * The optional `callback` is invoked with the same semantics as it is for a
     * a stream write.
     */
    flush(callback?: (error?: Error | null) => void): void;
    private doCompress;
    /** @internal */
    _transform(chunk: unknown, _encoding: string, done: TransformCallback): void;
    /** @internal */
    _flush(done: TransformCallback): void;
}
