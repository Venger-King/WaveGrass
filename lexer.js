const iterator = require("./iterator")
const throwError = require("./throwError")
const { WaveGrassError } = require("./wavegrassObjects")

const keyword = [
    "if", "else", "define", "break", "return", "continue", "let", "const", "hoist", 'while', 'for', 'in', 'of', 'throw', 'typeof', 'export', 'import', 'as', 'from'
]
const brackets_map = {
    '()': 0,
    '{}': 0,
    '[]': 0,
}

const char_map = {
    't': '\t',
    's': '\s',
    '\\': '\\'
}

let brackets_map_key = Object.keys(brackets_map)

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } delim
 * @param { string } [type='string']
 * @param { line } line
 * @param { line } col
 * 
 * @returns { { type: string, value: string } }
 */
const parseDelim = (iterable, delim, type = 'string', line, col) => {
    let ret = []
    let change = 0
    let prev
    while (iterable.next()) {
        change++
        let curr = iterable.next()

        if (curr == delim) {
            if (prev != '\\') break
            else ret.push(curr)
        }

        if (curr != '\\') if (prev && prev == '\\') {
            change++
            ret.push(char_map[curr])
        } else ret.push(curr)
        iterable.move()

        prev = curr
    }

    if (!iterable.next()) {
        throwError(new WaveGrassError('EOF Error', 'Unexpected end of file', line, col))
    }

    iterable.move()
    ret = ret.join('')

    return { data: { type: type, value: ret, line: line, col: col }, change: change }
}

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } current 
 * @param { boolean } [dot=false]
 * @param { number } line
 * @param { number } col
 * 
 * @returns { { type: 'number', value: number, line: number, col: number } }
 */
const parseNum = (iterable, current, dot = false, line, col) => {
    let ret = [current]
    let change = -1

    while (iterable.next()) {
        let curr = iterable.next()
        change++

        if (!/[0-9.]/.test(curr)) break

        if (dot) {
            if (curr == '.') {
                throwError(new WaveGrassError('SyntaxError', 'Unexpected property accessor', col, line))
            }
        } else {
            if (curr == '.') dot = true
        }

        ret.push(curr)
        iterable.move()
    }
    
    ret = ret.join('')
    ret = ret.includes('.') ? parseFloat(ret) : parseInt(ret)

    return { data: { type: 'number', value: ret, line: line, col: col }, change: change }
}
/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { string } current
 * @param { number } line
 * @param { number } col
 * 
 * @returns { { type: 'keyword' | 'variable' | 'boolean' , value: string, line: number, col: number } }
 */
const parseName = (iterable, current, line, col) => {
    let ret = [current]
    let change = -1

    while (iterable.next()) {
        let curr = iterable.next()
        change++

        if (!/[_a-zA-Z0-9]/.test(curr)) break

        ret.push(curr)
        iterable.move()
    }

    ret = ret.join('')

    let type;
    if (['true', 'false'].includes(ret)) {
        type = 'boolean'
    } else if (keyword.includes(ret)) {
        type = 'keyword'
    } else if (ret == 'null') {
        type = 'null'
    } else type = 'variable'

    return { data: { type: type, value: ret, line: line, col: col }, change: change }
}

/**
 * @param { string } fileContent The content of the file being lexed
 * @returns { any[] }
 */
const lex = (fileContent, file) => {
    fileContent = fileContent.replace(/\r/g, '')

    let line = 1, col = 0
    let iter = iterator(fileContent)
    let filedata = {
        lines: fileContent.split(`\n`),
        file: file
    }

    WaveGrassError.lines = filedata.lines
    WaveGrassError.file = file

    /** @type { import("./parser").Token[] } */
    let tokens = []

    while (iter.next()) {
        let curr = iter.next()
        iter.move()

        if (curr == '\n') {
            let l = line
            let c = col
            line++
            col = 0
            if (tokens.length) {
                let next;
                do {
                    next = iter.next()
                    if (next != ' ') break
                    col++
                    iter.move()
                } while (next == ' ')
                col -= 1
                let prev = tokens[tokens.length - 1]

                if (!(['assigment', 'brackets', 'operator', 'comparator'].includes(prev.type)
                    || (',.'.includes(prev.value) && prev.type == 'symbol')
                    || brackets_map['()']
                    || brackets_map['[]']
                    || prev.value == ';')) {

                    if ('({'.includes(next)) {
                    } else tokens.push({ type: 'delim', value: ';', line: l, col: c })
                }
            }
        } else if (/[0-9]/.test(curr)) {
            let value = parseNum(iter, curr, false, line, col)
            tokens.push(value.data)
            col += value.change
        } else if (/[#_a-zA-Z]/.test(curr)) {
            let value = parseName(iter, curr, line, col)
            col += value.change
            tokens.push(value.data)
        } else if ('"\'`'.includes(curr)) {
            let value = parseDelim(iter, curr, 'string', line, col)
            col += value.change
            tokens.push(value.data)
        } else if (curr == '.') {
            if (/[0-9]/.test(iter.next())) {
                let value = parseNum(iter, curr, true, line, col)
                col += value.change
                tokens.push(value.data)
            } else {
                tokens.push({ type: 'symbol', value: '.', line: line, col: col })
            }
        } else if (':?@,'.includes(curr)) {
            tokens.push({ type: 'symbol', value: curr, line: line, col: col })
        } else if ('=' == curr) {
            if (iter.next() == '=') {
                iter.move()
                if (iter.next() == '=') {
                    iter.move()
                    tokens.push({ type: 'comparator', value: '===', line: line, col: col })
                }
                else tokens.push({ type: 'comparator', value: '==', line: line, col: col })
                col++
            } else {
                tokens.push({ type: 'assignment', value: '=', line: line, col: col })
            }
        } else if ('+*%~^'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == curr) {
                tokens.push({ type: 'operator', value: curr + curr, line: line, col: col })
                iter.move()
                col++
            }
            else tokens.push({ type: 'operator', value: curr, line: line, col: col })
        } else if ('&|'.includes(curr)) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == curr) {
                iter.move()
                col++
                if (iter.next() == '=') {
                    tokens.push({ type: 'assignment', value: curr + curr + '=', line: line, col: col })
                    iter.move()
                    col++
                } else {
                    tokens.push({ type: 'operator', value: curr + curr, line: line, col: col })
                }
            } else {
                tokens.push({ type: 'operator', value: curr })
            }
        } else if ('<>'.includes(curr)) {
            if (iter.next() == curr) {
                tokens.push({ type: 'operator', value: curr + curr, line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == '=') {
                tokens.push({ type: 'comparator', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else {
                tokens.push({ type: 'comparator', value: curr, line: line, col: col })
            }
        } else if ('[{()}]'.includes(curr)) {
            let type = brackets_map_key.find(i => i.includes(curr))
            tokens.push({ type: 'bracket', value: curr, depth: curr == type[0] ? brackets_map[type]++ : --brackets_map[type], line: line, col: col })
        } else if (';' == curr) {
            tokens.push({ type: 'delim', value: curr, line: line, col: col })
        } else if ('/' == curr) {
            if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + curr + '=', line: line, col: col })
                iter.move()
                col++
            }
            else if (iter.next() == curr) {
                while (iter.next() != '\n') {
                    iter.move()
                    line++
                    col = 0
                }
                iter.move()
            } else if (iter.next() == '*') {
                while (true) {
                    col++
                    let curr = iter.next()
                    if (!curr) {
                        throwError(new WaveGrassError('EOF Error', 'Unexpected end of file', line, col))
                    }
                    iter.move()
                    if (curr == '*' && iter.next() == '/') {
                        break
                    }

                    if (curr == '\n') {
                        line++
                        col = 0
                    }
                }
                col++
                iter.move()
            } else {
                tokens.push({ type: 'operator', value: '/', line: line, col: col })
            }
        } else if (curr == '-') {
            if (iter.next() == '>') {
                iter.move()
                tokens.push({ type: 'assignment', value: '->', line: line, col: col })
                col++
            } else if (iter.next() == '=') {
                tokens.push({ type: 'assignment', value: curr + '=', line: line, col: col })
                iter.move()
                col++
            } else if (iter.next() == curr) {
                tokens.push({ type: 'operator', value: curr + curr, line: line, col: col })
                iter.move()
                col++
            } else {
                tokens.push({ type: 'operator', value: curr, line: line, col: col })
            }
        } else if (curr == '!') {
            if (iter.next() == '=') {
                iter.move()
                if (iter.next() == '=') {
                    iter.move()
                    tokens.push({ type: 'comparator', value: '!==', line: line, col: col })
                    col++
                } else {
                    tokens.push({ type: 'comparator', value: '!=', line: line, col: col })
                }
                col++
            } else if (iter.next() == '!') {
                iter.move()
                tokens.push({ type: 'operator', value: '!!', line: line, col: col })
                col++
            } else tokens.push({ type: 'operator', value: curr, line: line, col: col })

        }
        col++
    }

    if (tokens.length) {
        if (tokens[tokens.length - 1].type != 'delim') tokens.push({ type: 'delim', value: ';', line: line, col: col })
    }

    if (brackets_map['()']) {
        for (let i = 0; i < tokens.length; i++) {
            if ('()'.includes(tokens[i].value)) {
                if (tokens[i].depth == brackets_map['()']) {
                    throwError(new WaveGrassError('Syntax Error', 'Unmatched Paranthesis', tokens[i].col, tokens[i].line))
                } else if (tokens[i].depth == brackets_map['()'] + 1) {
                    throwError(new WaveGrassError('Syntax Error', 'Unmatched Paranthesis', tokens[i].col, tokens[i].line))
                }
            }
        }
    }
    if (brackets_map['[]']) {
        for (let i = 0; i < tokens.length; i++) {
            if ('[]'.includes(tokens[i].value)) {
                if (tokens[i].depth == brackets_map['[]']) {
                    throwError(new WaveGrassError('Syntax Error', 'Unmatched Square Brackets', tokens[i].col, tokens[i].line))
                } else if (tokens[i].depth == brackets_map['[]'] + 1) {
                    throwError(new WaveGrassError('Syntax Error', 'Unmatched  Square Brackets', tokens[i].col, tokens[i].line))
                }
            }
        }
    }
    if (brackets_map['{}']) {
        for (let i = 0; i < tokens.length; i++) {
            if ('[]'.includes(tokens[i].value)) {
                if (tokens[i].depth == brackets_map['{}']) {
                    throwError(new WaveGrassError('Syntax Error', 'Unmatched Curly Brackets', tokens[i].col, tokens[i].line))
                } else if (tokens[i].depth == brackets_map['{}'] + 1) {
                    throwError(new WaveGrassError('Syntax Error', 'Unmatched Curly Brackets', tokens[i].col, tokens[i].line))
                }
            }
        }
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].value == 'else') {
            if (tokens[i - 1].value == ';' && tokens[i - 2].value == '}') {
                tokens.splice(i - 1, 1)
                i--
            }
        }

        if (tokens[i].type == 'variable') {
            if (tokens[i + 1] && tokens[i + 1].type == 'variable') {
                throwError(new WaveGrassError('Syntax Error', 'Unxpected variable after another variable', tokens[i + 1].col, tokens[i + 1].line))
            }
        }
    }

    // await parse(tokens)
    return tokens
}

module.exports = lex
