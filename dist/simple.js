"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compress = compress;
exports.decompress = decompress;
const compress_1 = require("./compress");
const decompress_1 = require("./decompress");
let defaultCompressor;
let defaultDecompressor;
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
function compress(data, parameters = {}) {
    defaultCompressor ??= new compress_1.Compressor();
    defaultCompressor.setParameters(parameters);
    return defaultCompressor.compress(data);
}
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
function decompress(data, parameters = {}) {
    defaultDecompressor ??= new decompress_1.Decompressor();
    defaultDecompressor.setParameters(parameters);
    return defaultDecompressor.decompress(data);
}
