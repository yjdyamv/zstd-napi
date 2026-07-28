import { CompressParameters } from './compress';
import { DecompressParameters } from './decompress';
/**
 * Compress `data` with Zstandard.
 *
 * Under the hood, this uses a shared, lazily-initialized {@link Compressor},
 * which minimizes overhead. If you need dictionary support, create your own
 * instance of that class.
 *
 * @param data - Buffer containing data to compress
 * @param parameters - Optional compression parameters
 * @returns Compressed data
 */
export declare function compress(data: Uint8Array, parameters?: CompressParameters): Buffer;
/**
 * Decompress Zstandard-compressed `data`.
 *
 * Under the hood, this uses a shared, lazily-initialized {@link Decompressor},
 * which minimizes overhead. If you need dictionary support, create your own
 * instance of that class.
 *
 * @param data - Buffer containing compressed data
 * @param parameters - Optional decompression parameters
 * @returns Decompressed data
 */
export declare function decompress(data: Uint8Array, parameters?: DecompressParameters): Buffer;
