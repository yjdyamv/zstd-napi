"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompressStream = exports.Compressor = void 0;
const assert_1 = require("assert");
const stream_1 = require("stream");
const binding = require("../binding");
const util_1 = require("./util");
const PARAM_MAPPERS = {
    compressionLevel: util_1.mapNumber,
    // Advanced compression options
    windowLog: util_1.mapNumber,
    hashLog: util_1.mapNumber,
    chainLog: util_1.mapNumber,
    searchLog: util_1.mapNumber,
    minMatch: util_1.mapNumber,
    targetLength: util_1.mapNumber,
    strategy: (0, util_1.mapEnum)(binding.Strategy),
    targetCBlockSize: util_1.mapNumber,
    // Long-distance matching options
    enableLongDistanceMatching: util_1.mapBoolean,
    ldmHashLog: util_1.mapNumber,
    ldmMinMatch: util_1.mapNumber,
    ldmBucketSizeLog: util_1.mapNumber,
    ldmHashRateLog: util_1.mapNumber,
    // Frame parameters
    contentSizeFlag: util_1.mapBoolean,
    checksumFlag: util_1.mapBoolean,
    dictIDFlag: util_1.mapBoolean,
    // Multi-threading parameters
    nbWorkers: util_1.mapNumber,
    jobSize: util_1.mapNumber,
    overlapLog: util_1.mapNumber,
};
function updateCCtxParameters(cctx, parameters) {
    const mapped = (0, util_1.mapParameters)(binding.CParameter, PARAM_MAPPERS, parameters);
    for (const [param, value] of mapped) {
        cctx.setParameter(param, value);
    }
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
class Compressor {
    cctx = new binding.CCtx();
    scratchBuf = null;
    scratchLen = -1;
    /**
     * Compress the data in `buffer` with the configured dictionary/parameters.
     *
     * @param buffer - Data to compress
     * @returns A new Buffer containing the compressed data
     */
    compress(buffer) {
        let dest;
        if (this.scratchBuf && buffer.length <= this.scratchLen) {
            dest = this.scratchBuf;
        }
        else {
            dest = Buffer.allocUnsafe(binding.compressBound(buffer.length));
        }
        const length = this.cctx.compress2(dest, buffer);
        let result;
        if (length < 0.75 * dest.length) {
            // Destination buffer is too wasteful, trim by copying
            result = Buffer.from(dest.subarray(0, length));
            // Save the old buffer for scratch if it's small enough
            if (dest.length <= 128 * 1024 && buffer.length > this.scratchLen) {
                this.scratchBuf = dest;
                this.scratchLen = buffer.length;
            }
        }
        else {
            // Destination buffer is about the right size, return it directly
            result = dest.subarray(0, length);
            // Make sure we don't re-use the scratch buffer if we're returning it
            if (Object.is(dest, this.scratchBuf)) {
                this.scratchBuf = null;
                this.scratchLen = -1;
            }
        }
        return result;
    }
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
    loadDictionary(data) {
        // TODO: Compression parameters get locked in on next compress operation,
        // and are cleared by setParameters. There should be some checks to ensure
        // users have a safe usage pattern.
        this.cctx.loadDictionary(data);
    }
    /**
     * Reset the compressor state to only the provided parameters.
     *
     * Any loaded dictionary will be cleared, and any parameters not specified
     * will be reset to their default values.
     */
    setParameters(parameters) {
        this.cctx.reset(binding.ResetDirective.parameters);
        this.updateParameters(parameters);
    }
    /**
     * Modify compression parameters.
     *
     * Parameters not specified will be left at their current values. Changing
     * parameters is not possible while a dictionary is loaded.
     */
    updateParameters(parameters) {
        updateCCtxParameters(this.cctx, parameters);
    }
}
exports.Compressor = Compressor;
const BUF_SIZE = binding.cStreamOutSize();
const dummyFlushBuffer = Buffer.alloc(0);
const dummyEndBuffer = Buffer.alloc(0);
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
class CompressStream extends stream_1.Transform {
    cctx = new binding.CCtx();
    buffer = Buffer.allocUnsafe(BUF_SIZE);
    // TODO: Allow user to specify a dictionary
    /**
     * Create a new streaming compressor with the specified parameters.
     *
     * @param parameters - Compression parameters
     */
    constructor(parameters = {}) {
        // TODO: autoDestroy doesn't really work on Transform, we should consider
        // calling .destroy ourselves when necessary.
        super({ autoDestroy: true });
        updateCCtxParameters(this.cctx, parameters);
    }
    // TODO: Provide API to allow changing parameters mid-frame in MT mode
    // TODO: Provide API to allow changing parameters between frames
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
    endFrame(callback) {
        this.write(dummyEndBuffer, callback);
    }
    /**
     * Flush internal compression buffers to the stream.
     *
     * Ensures that a receiver can decompress all bytes written so far without
     * as much negative impact to compression as {@link endFrame}.
     *
     * The optional `callback` is invoked with the same semantics as it is for a
     * a stream write.
     */
    flush(callback) {
        this.write(dummyFlushBuffer, callback);
    }
    doCompress(chunk, endType) {
        const flushing = endType !== binding.EndDirective.continue;
        for (;;) {
            const [ret, produced, consumed] = this.cctx.compressStream2(this.buffer, chunk, endType);
            if (produced > 0) {
                this.push(this.buffer.subarray(0, produced));
                this.buffer = Buffer.allocUnsafe(Math.max(BUF_SIZE, ret));
            }
            chunk = chunk.subarray(consumed);
            if (chunk.length == 0 && (!flushing || ret == 0))
                return;
        }
    }
    /** @internal */
    _transform(chunk, _encoding, done) {
        try {
            // The Writable machinery is responsible for converting to a Buffer
            (0, assert_1.strict)(chunk instanceof Buffer);
            // Handle flushes indicated by special dummy buffers
            let endType = binding.EndDirective.continue;
            if (Object.is(chunk, dummyFlushBuffer))
                endType = binding.EndDirective.flush;
            else if (Object.is(chunk, dummyEndBuffer))
                endType = binding.EndDirective.end;
            this.doCompress(chunk, endType);
        }
        catch (err) {
            done(err);
            return;
        }
        done();
        return;
    }
    /** @internal */
    _flush(done) {
        try {
            this.doCompress(dummyEndBuffer, binding.EndDirective.end);
        }
        catch (err) {
            done(err);
            return;
        }
        done();
        return;
    }
}
exports.CompressStream = CompressStream;
