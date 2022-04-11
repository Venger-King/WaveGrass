const { WaveGrassFunction, createObject, WaveGrassArray, WaveGrassObject } = require("./wavegrassObjects")

/**
 * 
 * @param { { [object: string]: any } } obj 
 */
const wrap = (obj) => {
    let wrapped = {}
    for (const i in obj) {
        let type = typeof obj[i]
        if (type == 'function') {
            wrapped[i] = new WaveGrassFunction(obj[i].name, ['*n'], '<native_code>', null, false, null, true, obj[i])
        } else {
            if (type == 'object') {
                if (Array.isArray(obj[i])) {
                    wrapped[i] = new WaveGrassArray({}, obj[i].length)
                    for (let j = 0; j < obj[i].length; j++) {
                        wrapped[i].__set_property__(`${j}`, wrap({ 'obj': obj[i][j] })['obj'])
                    }
                } else {
                    wrapped[i] = new WaveGrassObject(i)
                    for (let j in obj[i]) {
                        wrapped[i].__set_property__(j, wrap({ 'obj': obj[i][j] })['obj'])
                    }
                }
            } else wrapped[i] = createObject(typeof obj[i], obj[i])
        }
    }
    return wrapped
}

/**
 * 
 * @param { { [object: string]: WaveGrassObject } } obj 
 */
const unwrap = (obj) => {
    let unwrapped = {}
    for (const i in obj) {
        let type = obj[i].__type__()
        if (type == 'array') {
            unwrapped[i] = []
            let iter = obj[i].__iterator__()

            let val = iter.next()
            do {
                if (val.value) unwrapped[i].push(unwrap({ 'obj': val.value })['obj'])
                val = iter.next()
            } while (!val.finished.__value_of__())
        } else if (type == 'object') {
            unwrapped[i] = {}
            for (let j in obj[i].__properties) {
                unwrapped[i][j] = unwrap({ 'obj': obj[i].__properties[j] })['obj']
            }
        } else {
            unwrapped[i] = obj[i].__value_of__()
        }
    }
    return unwrapped
}

module.exports = {
    wrap, unwrap
}