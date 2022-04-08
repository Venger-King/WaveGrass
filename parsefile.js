const execute = require("./execute");
const lex = require("./lexer");
const parse = require('./parser')
const { readFileSync, realpath } = require('fs');
const throwError = require("./throwError");
const { WaveGrassError } = require("./wavegrassObjects");

const resolvePath = async (p) => {
    let path = await new Promise((resolve) => {
        realpath(p, (error, pa) => {
            resolve(error ? undefined : pa)
        })
    })

    if(!path) {
        p = p.split('\\')
        p.splice(p.length - 1, 0, 'modules')
        path = await new Promise((resolve) => {
            realpath(p.join('/'), (error, pa) => {
                resolve(error ? undefined : pa)
            })
        })

        p = p.join('\\')
    }

    if(!path) {
        throwError(new WaveGrassError('ValueError', `No such module named at '${p}' found`, 0, 0))
    }

    return path
}

module.exports = async (path) => {

    path = await resolvePath(path)
    let tokens = lex(readFileSync(path, 'utf-8'), path)
    let asts = parse(tokens)
    await execute(asts, path)

    return path
}