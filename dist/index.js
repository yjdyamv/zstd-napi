"use strict";
/**
 * This module (imported as `zstd-napi`) provides a high-level interface for
 * Zstandard compression and decompression. If you aren't sure what you need,
 * this is the right place to start!
 *
 * - The {@link compress} and {@link decompress} functions are the simplest,
 *   single-pass (in-memory) interface.
 * - The {@link Compressor} and {@link Decompressor} classes provide a
 *   single-pass interface with dictionary support.
 * - The {@link CompressStream} and {@link DecompressStream} classes provide
 *   a streaming interface.
 *
 * If you're looking for low-level bindings to the native Zstandard library,
 * see the {@link "binding" | binding module}.
 *
 * @module index
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.decompress = exports.compress = exports.Decompressor = exports.DecompressStream = exports.Compressor = exports.CompressStream = void 0;
var compress_1 = require("./compress");
Object.defineProperty(exports, "CompressStream", { enumerable: true, get: function () { return compress_1.CompressStream; } });
Object.defineProperty(exports, "Compressor", { enumerable: true, get: function () { return compress_1.Compressor; } });
var decompress_1 = require("./decompress");
Object.defineProperty(exports, "DecompressStream", { enumerable: true, get: function () { return decompress_1.DecompressStream; } });
Object.defineProperty(exports, "Decompressor", { enumerable: true, get: function () { return decompress_1.Decompressor; } });
var simple_1 = require("./simple");
Object.defineProperty(exports, "compress", { enumerable: true, get: function () { return simple_1.compress; } });
Object.defineProperty(exports, "decompress", { enumerable: true, get: function () { return simple_1.decompress; } });
