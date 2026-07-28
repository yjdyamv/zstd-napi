"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapBoolean = exports.mapNumber = void 0;
exports.mapEnum = mapEnum;
exports.mapParameters = mapParameters;
exports.mapNumber = {
    validateInput: (value) => typeof value === 'number',
    mapValue: (value) => value,
};
function mapEnum(enumObj) {
    return {
        validateInput: (value) => typeof value === 'string' && value in enumObj,
        mapValue: (value) => enumObj[value],
    };
}
exports.mapBoolean = {
    validateInput: (value) => typeof value === 'boolean',
    mapValue: (value) => Number(value),
};
function mapParameter(name, mapper, value) {
    if (!mapper.validateInput(value)) {
        throw new TypeError(`Invalid type for parameter: ${name}`);
    }
    return mapper.mapValue(value);
}
function mapParameters(paramEnum, mapper, params) {
    const result = new Map();
    for (const [rawKey, value] of Object.entries(params)) {
        if (value !== undefined) {
            if (!(rawKey in mapper)) {
                throw new RangeError(`Invalid parameter name: ${rawKey}`);
            }
            const key = rawKey;
            result.set(paramEnum[key], mapParameter(key, mapper[key], value));
        }
    }
    return result;
}
