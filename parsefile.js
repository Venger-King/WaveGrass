const execute = require("./execute");
const lex = require("./lexer");
const parse = require('./parser')
const { readFileSync } = require('fs')

module.exports = async (path) => {
    let tokens = lex(readFileSync(path, 'utf-8'), path)
    let asts = parse(tokens)
    await execute(asts, path)
}