const execute = require("./execute");
const lex = require("./lexer");
const parse = require('./parser')
const { readFileSync, realpath } = require('fs');
const throwError = require("./throwError");
const { WaveGrassError } = require("./wavegrassObjects");
const { wrap } = require("./wrap");

const resolvePath = async (p) => {
    let path = await new Promise((resolve) => {
        realpath(p, (error, pa) => {
            resolve(error ? undefined : pa)
        })
    })

    if (!path) {
        p = p.split('\\')
        p.splice(p.length - 1, 0, 'modules')
        path = await new Promise((resolve) => {
            realpath(p.join('/'), (error, pa) => {
                resolve(error ? undefined : pa)
            })
        })

        p = p.join('\\')
    }

    if (!path) {
        throwError(new WaveGrassError('ValueError', `No such module named at '${p}' found`, 0, 0))
    }

    return path
}

module.exports = async (path, iswg) => {

    path = await resolvePath(path)
    if(iswg) {
        let tokens = lex(readFileSync(path, 'utf-8'), path)
        let asts = parse(tokens)
        return await execute(asts, path)
    } else {
        try {
            let mod = require(path)
            if({}.constructor == mod.constructor) {
                mod = wrap(mod)
            } else {
                mod = wrap({ '$$': { [mod.name]: mod } })
            }
            return mod
        } catch (er) {
            throw er
        }
    }
}