const iterator = require("./iterator")
const throwError = require("./throwError")
const { WaveGrassError } = require("./wavegrassObjects")

/**
 * @typedef { { type: string, value: string | number, depth?: number, line: number, col: number } } Token
 */

const precedence = (token) => {
    if (!token) return -1

    let value = token.value

    switch (value) {
        case ':':
        case '=':
            return 11
        case '.':
        case 'property':
            return 10
        case 'typeof':
            return 9
        case '**':
        case '++':
        case '_++':
        case '_--':
        case '--':
            return 8
        case '!':
        case '!!':
        case '~~':
        case '~':
        case '_+':
        case '_-':
            return 7
        case '*':
        case '/':
        case '%':
            return 6
        case '+':
        case '-':
            return 5
        case '<<':
        case '>>':
        case '>>>':
            return 4
        case '&':
        case '^':
        case '|':
            return 3
        case '===':
        case '==':
        case '!=':
        case '!==':
        case '<':
        case '>':
        case '>=':
        case '<=':
        case 'in':
            return 2
        case '&&':
        case '||':
            return 1
    }

    return -1
}
const non_operator_types = ['number', 'string', 'array', 'boolean', 'variable', 'call', 'null']

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { Token } endat 
 * 
 * @returns { Token[] }
 */
const accumulate_tokens = (iterable, endat) => {
    let tokens = []
    let prev

    if (endat.depth !== undefined) {
        while (iterable.next()) {
            let curr = iterable.next()
            if (curr.type == endat.type && curr.value == endat.value && curr.depth == endat.depth) break

            tokens.push(curr)
            iterable.move()
        }
    } else {
        let stack = []
        while (iterable.next()) {
            let curr = iterable.next()
            if (curr.type == endat.type && curr.value == endat.value && !stack.length) {
                if (prev.value != '{') break
            }

            if(curr.value == '[' || curr.value == '{' || curr.value == '(') {
                stack.push(curr.value)
            }

            if(curr.value == '}' || curr.value == ']' || curr.value == ')') {
                stack.pop()
            }

            tokens.push(curr)
            iterable.move()
            prev = curr
        }
    }

    if (!iterable.next()) {
        throwError(new WaveGrassError('Syntax Error', `Expected a '${endat.value}'`, iterable.curr().col, iterable.curr().line))
    }
    return tokens
}

/**
 * 
 * @param { Token[] } array 
 */

const to_post_fix_notation = (array) => {
    let stack = []
    let result = []
    for (let i = 0; i < array.length; i++) {
        let token = array[i]

        if (non_operator_types.includes(token.type)) {
            if (array[i + 1]) {
                if (array[i + 1].type == 'bracket' && array[i + 1].value == '(') {
                    let foundIndex = -1
                    for (let j = i + 2; j < array.length; j++) {
                        if (array[j].type == 'bracket' && array[j].value == ')' && array[j].depth == array[i + 1].depth) {
                            foundIndex = j
                            break
                        }
                    }

                    if (foundIndex < 0) {
                        throwError(new WaveGrassError('EOF Error', 'Unexpected end of input', array[i + 1].col, array[i - 1].line))
                    }

                    array.splice(i + 1, 2, {
                        type: 'call', args: parse_params(array.splice(i + 2, foundIndex - i - 2)), col: array[i].col, line: array[i].line
                    })
                } else if (array[i + 1].type == 'bracket' && array[i + 1].value == '[') {
                    let foundIndex = -1
                    for (let j = i + 2; j < array.length; j++) {
                        if (array[j].type == 'bracket' && array[j].value == ']' && array[j].depth == array[i + 1].depth) {
                            foundIndex = j
                            break
                        }
                    }

                    if (foundIndex < 0) {
                        throwError(new WaveGrassError('EOF Error', 'Unexpected end of input', array[i].col, array[i].line))
                    }

                    let args = array.splice(i + 2, foundIndex - i - 2)
                    if (args.length > 1) args = { type: 'array', values: parse_array(args) }
                    else args = args[0]

                    array.splice(i + 1, 2, {
                        type: 'property', value: 'property', ktype: '[]', property: args, col: array[i].col, line: array[i].line
                    })
                }
            }
            result.push(token)
        } else if (token.type == 'bracket') {
            if (token.value == '(') stack.push(token)
            else if (token.value == ')') {
                while (stack[stack.length - 1].value != '(' && stack[stack.length - 1] != token.depth) {
                    result.push(stack.pop())
                }
                stack.pop()
            } else if (token.value == '[') {
                let foundIndex = -1
                for (let j = i + 1; j < array.length; j++) {
                    if (array[j].type == 'bracket' && array[j].value == ']' && array[j].depth == array[i].depth) {
                        foundIndex = j
                        break
                    }
                }
                if (foundIndex < 0) {
                    throwError(new WaveGrassError('EOF Error', 'Unexpected end of input', array[i].col, array[i].line))
                }

                array.splice(i, 2, {
                    type: 'array', values: parse_array(array.splice(i + 1, foundIndex - i - 1)), col: array[i].col, line: array[i].line
                })

                result.push(array[i])
            } else if (token.value == '{') {
                for (let j = i + 1; j < array.length; j++) {
                    if (array[j].type == 'bracket' && array[j].value == '}' && array[j].depth == array[i].depth) {
                        foundIndex = j
                        break
                    }
                }
                if (foundIndex < 0) {
                    throwError(new WaveGrassError('EOF Error', 'Unexpected end of input', array[i].col, array[i].line))
                }

                array.splice(i, 2, {
                    type: 'object', values: parse_array(array.splice(i + 1, foundIndex - i - 1)), col: array[i].col, line: array[i].line
                })

                result.push(array[i])
            }
        } else if (token.value == '=' || token.value == ':') {
            array.splice(i, 1, {
                type: 'symbol',
                value: token.value,
                to_operate: parse_operators(array.splice(i + 1, array.length)),
                line: token.line,
                col: token.col
            })

            let find = array[i].to_operate.type == 'operation' ? array[i].to_operate.value.find(i => i.value == token.value) : array[i].to_operate

            if (find && find.value == token.value) {
                throwError(new WaveGrassError('Syntax Error', `Unexpected token '${find.value}'`, find.col, find.line))
            }
            result.push(array[i])
        } else if(token.type !=  'delim') {
            if (['-', '+'].includes(token.value) && array[i + 1]) {
                if (!array[i - 1]) {
                    token.value = '_' + token.value
                } else if (['operator', 'keyword', 'comparator'].includes(array[i - 1].type)) {
                    token.value = '_' + token.value
                } else if (array[i - 1].value == '(') {
                    token.value = '_' + token.value
                }

            } else if (['++', '--'].includes(token.value)) {
                if (!array[i + 1] || ['operator', 'keyword', 'comparator', 'bracket'].includes(array[i + 1].type)) {
                    token.value = '_' + token.value
                }
            }

            while (stack.length && precedence(token) <= precedence(stack[stack.length - 1])) {
                result.push(stack.pop())
            }
            stack.push(token)
        }
    }

    while (stack.length) {
        result.push(stack.pop())
    }

    for (let i = 0; i < result.length; i++) {
        if (result[i].value == '.') {
            if (result[i - 1] && result[i - 1].type == 'call') {
                let temp = result[i]
                result[i] = result[i - 1]
                result[i - 1] = temp
            }
        }
    }

    return result
}
const parse_operators = (array) => {
    if(!Array.isArray(array)) return array 
    if (array.length < 1) return { token: 'missing' }
    if (array.length == 1) return array[0]
    return { type: 'operation', value: to_post_fix_notation(array) }
}

/**
 * 
 * @param { Token[]} tokens
 * @param { number } depth 
 * @returns  { Token[] }
 */
const parse_params = (tokens) => {
    let params = []
    let i = 0;
    let depths = {
        '(': 0,
        '[': 0,
        '{': 0
    }

    while (tokens.length) {
        if (tokens[i].value == ',' && !(depths['('] || depths['['] || depths['{'])) {
            let value = parse_operators(tokens.splice(0, i))
            params.push(value)

            tokens.shift()
            i = 0
        }

        if (!tokens.length) break

        if (tokens[i].value == '(') depths['(']++
        else if (tokens[i].value == ')') depths['(']--
        else if (tokens[i].value == '[') depths['[']++
        else if (tokens[i].value == ']') depths['[']--
        else if (tokens[i].value == '{') depths['{']++
        else if (tokens[i].value == '}') depths['{']--


        i++
        if (tokens.length == i) {
            params.push(parse_operators(tokens.splice(0, tokens.length)))
        }
    }
    return params
}

const parse_object = (tokens) => {
    let obj = []
    let groups = parse_array(tokens)
        let index = 0;

        console.log(groups)
        for(const i in groups) {
            let elem = groups[i].value

            if(elem.length < 2) {
                throwError()
            }

            let [key, value] = [elem[0], elem[1]]
            if(value.type != 'symbol' || value.value != ':') {
                throwError()
            }
        }
}

const parse_array = (tokens) => {
    let params = {}
    let i = 0;
    let indexing = 0
    let depths = {
        '(': 0,
        '[': 0,
        '{': 0
    }

    while (tokens.length) {

        if (tokens[i].value == ',' && !(depths['('] || depths['['] || depths['{'])) {
            let value = parse_operators(tokens.splice(0, i))

            params[indexing++] = value
            tokens.shift()
            i = 0
        }

        if (!tokens.length) break

        if (tokens[i].value == '(') depths['(']++
        else if (tokens[i].value == ')') depths['(']--
        else if (tokens[i].value == '[') depths['[']++
        else if (tokens[i].value == ']') depths['[']--
        else if (tokens[i].value == '{') depths['{']++
        else if (tokens[i].value == '}') depths['{']--

        i++
        if (tokens.length == i) {
            params[indexing] = parse_operators(tokens.splice(0, tokens.length))
        }
    }

    return params
}

/**
 * 
 * @param { import("./iterator").IterableReturn } iterable 
 * @param { ?Token } prev 
 * @param { Token } endat
 */
const to_ast = (iterable, prev = null, endat, depth = 0) => {
    let curr = iterable.next()
    if (!curr || (curr.type == endat.type && curr.value == endat.value)) return prev
    iterable.move()

    if (['variable', 'number', 'string', 'boolean', 'null'].includes(curr.type)) {
        if (!prev) {
            return to_ast(iterable, { type: curr.type, value: curr.value, line: curr.line, col: curr.col }, endat, depth)
        } else if (prev.changeable !== null) {
            return to_ast(iterable, { type: curr.type, value: curr.value, line: curr.line, col: curr.col, changeable: prev.changeable }, endat, depth)
        }
    } else if (curr.type == 'assignment') {
        if (!prev) throwError(new WaveGrassError('Syntax Error', 'Unexpected token \'=\'', curr.col, curr.line))

        if (prev.type != 'variable' && prev.type != 'array' && prev.type != 'property') {
            prev.value ? throwError(new WaveGrassError('TypeError', 'Can only assign values to a variable', prev.value?.col ?? prev.col, prev.value?.line ?? prev.line)) : throwError(new WaveGrassError('TypeError', 'Can only assign values to a variable', prev.col, prev.line))
        }

        if (prev.changeable == null) prev.changeable = true

        if (curr.value == '=') {
            let next = parse_operators(accumulate_tokens(iterable, endat))
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: next }, endat, depth)
        } else if (curr.value == '->') {
            let next = parse_operators(accumulate_tokens(iterable, endat))
            return to_ast(iterable, { type: 'assignment2', lhs: prev, rhs: next }, endat, depth)
        } else {
            let next = parse_operators(accumulate_tokens(iterable, endat))
            if (next.type != 'operation') next = { type: 'operation', value: [next] }
            return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { type: 'operation', value: [...next.value, prev, { type: 'operator', value: curr.value.substring(0, curr.value.length - 1), col: curr.col, line: curr.line }] } }, endat, depth)
        }
    } else if (curr.type == 'bracket') {
        if (curr.value == '(') {
            let args = accumulate_tokens(iterable, { type: 'bracket', value: ')', depth: curr.depth })
            iterable.move()

            if (prev) {
                return to_ast(iterable, { type: 'call', value: prev, args: parse_params(args, curr.depth), col: curr.col, line: curr.line + 1 }, endat, depth)
            }
        } else if (curr.value == '[') {
            if (!prev || prev.changeable) {
                let args = accumulate_tokens(iterable, { type: 'bracket', value: ']', depth: curr.depth })
                iterable.move()

                return to_ast(iterable, { type: 'array', values: parse_params(args), col: curr.col, line: curr.line }, endat, depth)
            } else {
                let args = accumulate_tokens(iterable, { type: 'bracket', value: ']', depth: curr.depth })
                iterable.move()

                if (args.length > 1) args = { type: 'array', values: parse_array(args) }
                else args = args[0]
                return to_ast(iterable, { type: 'property', ktype: '[]', lhs: prev, values: args, col: curr.col, line: curr.line }, endat, depth)
            }
        }
    } else if (curr.type == 'keyword') {
        if (curr.value == 'hoist') {
            return to_ast(iterable, { type: 'hoist', value: to_ast(iterable, null, endat, depth) }, endat, depth)
        } else if (curr.value == 'return') {
            return to_ast(iterable, { type: 'return', value: parse_operators(accumulate_tokens(iterable, endat)), line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'export') {
            return to_ast(iterable, { type: 'export', value: parse_params(accumulate_tokens(iterable, endat)), line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'import') {
            return to_ast(iterable, { type: 'import', value: parse_params(accumulate_tokens(iterable, endat)), line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'let') {
            return to_ast(iterable, { changeable: true }, endat, depth)
        } else if (curr.value == 'const') {
            return to_ast(iterable, { changeable: false }, endat, depth)
        } else if (curr.value == 'if') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))

            if (condition.token == 'missing' || (condition.type == 'operation' && !condition.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Expected a condition after the \`if\` token', curr.col + 2, curr.line))
            }

            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'if', condition: condition, positive: block }, endat, depth)
        } else if (curr.value == 'else') {
            if (!prev) {
                throwError(new WaveGrassError('Syntax Error', 'Unexpected else token', curr.line, curr.col))
            } else if (prev.type != 'if') {
                throwError(new WaveGrassError('Syntax Error', 'Unexpected else token', curr.line, curr.col))
            }

            if (!['{', 'if'].includes(iterable.next().value)) {
                throwError(new WaveGrassError('Syntax Error', 'Unexpected else token', iter.next().line, iter.next().col))
            }

            let condition = false
            if (iterable.next().value == 'if') {
                iterable.move()
                condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))
            }

            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })

            iterable.move()

            let iter = iterator(tokens)
            let block = []

            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            if (prev.negative) {
                let p = prev.negative
                while (true) {
                    if (p.negative) p = p.negative
                    else break
                }

                p.negative = condition ? { condition: condition, positive: block } : block
                return to_ast(iterable, prev, endat, depth)
            } else {
                return to_ast(iterable, { ...prev, negative: condition ? { type: 'if', condition: condition, positive: block } : block }, endat, depth)
            }
        } else if (curr.value == 'while') {
            let condition = parse_operators(accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth }))
            iterable.move()

            if (condition.token == 'missing' || (condition.type == 'operation' && !condition.value.length)) {
                throwError(new WaveGrassError('Syntax Error', 'Expected a condition \`while\` token', curr.col + 5, curr.line))
            }

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }
            return to_ast(iterable, { type: 'while', condition: condition, block: block }, endat, depth)
        } else if (curr.value == 'for') {
            let cond_data = accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth })

            if (!cond_data.length) {
                throwError(new WaveGrassError('Syntax Error', 'Expected tokens before the \'{\'', curr.col + 3, curr.line))
            }

            if (cond_data[0].type == 'bracket' && cond_data[0].value == '(') {
                let token = cond_data[cond_data.length - 1]
                if (token.type != 'bracket' || token.value != ')' || token.depth != cond_data[0].depth) {
                    throwError(new WaveGrassError('EOF Error', 'Unexpected End of Input', cond[0].col, cond[0].line))
                }
                cond_data = cond_data.splice(1, cond_data.length - 2)
            }

            let loopvar, cond, step;

            if (cond_data.find(i => i.value == ',')) {
                cond_data = parse_params(cond_data)
                iterable.move()

                loopvar = cond_data[0]
                cond = cond_data[1]
                step = cond_data[2]

                if (!loopvar || loopvar.token == 'missing' || (loopvar.type == 'operation' && !loopvar.value.length)) {
                    throwError(new WaveGrassError('Syntax Error', 'Missing variable for the loop', curr.col + 3, curr.line))
                }

                if (!cond || cond.token == 'missing' || (cond.type == 'operation' && !cond.value.length)) {
                    throwError(new WaveGrassError('Syntax Error', 'Missing condition for the loop', curr.col + 3, curr.line))
                }

                if (!step || step.token == 'missing' || (step.type == 'operation' && !step.value.length)) {
                    throwError(new WaveGrassError('Syntax Error', 'Missing change argument for the loop', curr.col + 3, curr.line))
                }

                if (loopvar.type == 'operation') {
                    if (loopvar.value.find(i => i.value == '=')) {
                        loopvar.value.splice(1, 2, loopvar.value[2], loopvar.value[1])
                        loopvar.value.push({ type: 'delim', value: ';' })

                        let iter = iterator(loopvar.value)
                        while (iter.next()) {
                            loopvar = to_ast(iter, null, endat, depth + 1)
                            iter.move()
                        }
                    }
                }

            } else {
                let index = cond_data.findIndex(i => i.value == 'in' || i.value == 'of')

                if (index < 0) {
                    throwError(new WaveGrassError('Syntax Error', 'Wrong arguments for the loop', curr.col + 3, curr.line))
                }

                loopvar = cond_data[0]
                if (loopvar.type != 'variable') {
                    throwError(new WaveGrassError('Syntax Error', 'Expected a variable', loopvar.col, loopvar.line))
                }

                if (index != 1) {
                    throwError(new WaveGrassError('Syntax Error', 'Invalid token in the condition', cond_data[i].col, cond_data[i].line))
                }

                cond = {
                    iterative: true,
                    type: cond_data[1]
                }

                if (!cond_data[2]) {
                    throwError(new WaveGrassError('Syntax Error', 'Missing iterable object', cond_data[1].col + 2, cond_data[2].line))
                }

                step = parse_operators(cond_data.splice(2, cond_data.length))
            }

            iterable.move()

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'for', loopvar: loopvar, condition: cond, change: step, block: block }, endat, depth)
        } else if (curr.value == 'define') {
            let name = iterable.next()

            if (!name || name.type != 'variable') {
                throwError(new WaveGrassError('Syntax Error', 'Expected a variable after define', curr.col + 6, curr.line))
            }
            iterable.move()

            let arg_tokens = accumulate_tokens(iterable, { type: 'bracket', value: '{', depth: depth })
            iterable.move()

            let args = []

            if (arg_tokens.length) {
                if (arg_tokens[0].value != '(') {
                    throwError(new WaveGrassError('Syntax Error', `Expected a '(' but instead got '${arg_tokens[0].value}'`, arg_tokens[0].col, arg_tokens[0].line))
                }

                if (arg_tokens[arg_tokens.length - 1].value != ')') {
                    throwError(new WaveGrassError('Syntax Error', `Expected a '(' but instead got '${arg_tokens[arg_tokens.length - 1].value}'`, arg_tokens[arg_tokens.length - 1].col, arg_tokens[arg_tokens.length - 1].line))
                }

                if (arg_tokens.pop().depth != arg_tokens.shift().depth) {
                    throwError(new WaveGrassError('Syntax Error', `Unmatched Parathesis`, curr.col, curr.line))
                }

                args = parse_params(arg_tokens).map(i => {
                    if (i.type != 'variable') throwError(new WaveGrassError(('TypeError', `Expected a variable but got <class ${i.type}>`, i.col, i.line)))
                    return i.value
                })
            }

            let tokens = accumulate_tokens(iterable, { type: 'bracket', value: '}', depth: depth })
            iterable.move()

            let iter = iterator(tokens)
            let block = []
            while (iter.next()) {
                let ast = to_ast(iter, null, endat, depth + 1)
                if (ast) block.push(ast)
                iter.move()
            }

            return to_ast(iterable, { type: 'assignment', lhs: name, rhs: { type: 'method', args: args, statements: block } }, endat, depth)
        } else if (curr.value == 'break') {
            return to_ast(iterable, { type: 'break', line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'continue') {
            return to_ast(iterable, { type: 'continue', line: curr.line, col: curr.col }, endat, depth)
        } else if (curr.value == 'throw') {
            return to_ast(iterable, { type: 'throw', line: curr.line, col: curr.col }, endat, depth)
        }
    } else if (curr.type == 'operator') {
        if (curr.value == '++') {
            if (prev) {
                return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { type: 'operation', value: [prev, { type: 'operator', value: '++', line: prev.line, col: prev.col }] } }, endat, depth)
            }
        } else if (curr.value == '--') {
            if (prev) {
                return to_ast(iterable, { type: 'assignment', lhs: prev, rhs: { type: 'operation', value: [prev, { type: 'operatior', value: '--', line: prev.line, col: prev.col }] } }, endat, depth)
            }
        }
    } else if (curr.type == 'symbol') {
        if (curr.value == '.') {

            if (!prev) throwError()
            if (!['property', 'string', 'variable', 'number', 'bool', 'null', 'array'].includes(prev.type)) throwError()

            let next = []

            while (iterable.next()) {
                let n = iterable.next()
                if (n.value == '=') break
                if (n.value == endat.value) break

                next.push(n)
                iterable.move()
            }

            if (!next.length) {

            }

            if (next.length == 1) next = next[0]
            else next = parse_operators(next)

            return to_ast(iterable, { type: 'property', ktype: '.', lhs: prev, values: next, col: curr.col, line: curr.line }, endat, depth)
        }
    }
}
/**
 * 
 * @param { Token[] } tokens 
 */
const parse = (tokens) => {
    let iter = iterator(tokens)
    let asts = []

    while (iter.next()) {
        let value = to_ast(iter, null, { type: 'delim', value: ';' }, 0)
        if (value) asts.push(value)
        iter.move()
    }

    return asts
}

module.exports = parse
