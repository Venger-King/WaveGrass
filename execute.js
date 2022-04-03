const throwError = require("./throwError")
const { createObject, WaveGrassObject, WaveGrassError, WaveGrassBoolean, WaveGrassNull, print, prompt, WaveGrassNumber, parseNum, _isNaN, WaveGrassFunction, WaveGrassArray, WaveGrassModule } = require("./wavegrassObjects")
const input = require('./modules/input/main').input

/**
 * @type { { [ scope: string ]: { map: Map<string, {changeable: boolean, exported?: boolean, value: WaveGrassObject}> parent?: string }}}
 */
const scopes = {
    global: {
        map: new Map(),
        parent: null
    }
}

const breakable = ['for', 'while']

scopes['global'].map.set('print', { value: print, changeable: true })
scopes['global'].map.set('prompt', { value: prompt, changeable: true })
scopes['global'].map.set('parseNum', { value: parseNum, changeable: true })
scopes['global'].map.set('isNaN', { value: _isNaN, changeable: true })


const unary = ['!', '~', '!!', '~~', '_-', '_+', '++', '_++', '--', '_--', 'property', 'typeof']

const toString = async (tokens, sep, colored) => {
    let str = []
    for (let i = 0; i < tokens.length; i++) {
        str.push(tokens[i].__string__(colored))
    }

    return str.join(sep)
}

/**
 * 
 * @param { { type: 'comparator', value: string } } cond 
 * @param { { type: string, value: any } | WaveGrassObject } lhs 
 * @param { { type: string, value: any } | WaveGrassObject } rhs 
 * @returns { WaveGrassBoolean }
 */
const conditional_check = (cond, lhs, rhs) => {
    let value = null;
    if (cond.value == '===') {
        value = lhs.__strict_equals__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__strict_equals__(lhs)
    } else if (cond.value == '==') {
        value = lhs.__equals__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
    } else if (cond.value == '!=') {
        value = lhs.__equals__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)

        if (!WaveGrassError.isError(value)) {
            value = value.__not__()
        }
    } else if (cond.value == '!==') {
        value = lhs.__strict_equals__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__strict_equals__(lhs)

        if (!WaveGrassError.isError(value)) {
            value = value.__not__()
        }
    } else if (cond.value == '>') {
        value = lhs.__greater_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)
    } else if (cond.value == '<') {
        value = lhs.__less_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)
    } else if (cond.value == '>=') {
        value = lhs.__greater_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__greater_than__(lhs)

        if (value.__value_of__() == false) {
            value = lhs.__equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
        }
    } else if (cond.value == '<=') {
        value = lhs.__less_than__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__less_than__(lhs)

        if (value.__value_of__() == false) {
            value = lhs.__equals__(rhs)
            if (WaveGrassError.isError(value)) value = rhs.__equals__(lhs)
        }
    } else if (cond.value == 'in') {
        value = lhs.__in__(rhs)
    } else if (cond.value == 'of') {
        value = lhs.__of__(rhs)
    } else if (cond.value == 'as') {
        value = {
            type: 'as',
            lhs: lhs,
            rhs: rhs
        }
    } else {
        value = new WaveGrassBoolean(false)
    }

    if (WaveGrassError.isError(value)) {
        value.__col = opp.col
        value.__line = opp.line
        throwError(value)
    }

    return value
}

/*
TODO
    Implement all operations
*/

/**
 * 
 * @param { { type: 'operator', value: string } } opp 
 * @param { WaveGrassObject } lhs 
 * @param { WaveGrassObject } rhs 
 * @returns { WaveGrassObject }
 */
const operate_by_operation = (opp, lhs, rhs) => {
    if (!unary.includes(opp.value) && !(lhs && rhs)) {
        throwError(new WaveGrassError('Syntax Error', 'Invalid operation', opp.col, opp.line))
    }
    let value = null
    if (opp.value == '+') {
        value = lhs.__add__(rhs);
        if (WaveGrassError.isError(value)) value = rhs.__r_add__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_add__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__add__(rhs)
    } else if (opp.value == '-') {
        value = lhs.__sub__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_sub__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_sub__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__sub__(lhs)
    } else if (opp.value == '_-') {
        value = new WaveGrassNumber(0).__sub__(lhs)
    } else if (opp.value == '_+') {
        value = new WaveGrassNumber(0).__add__(lhs)
    } else if (opp.value == '*') {
        value = lhs.__mul__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_mul__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_mul__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__mul__(lhs)

    } else if (opp.value == '/') {
        value = lhs.__div__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_div__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_div__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__div__(lhs)

    } else if (opp.value == '%') {
        value = lhs.__mod__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_mod__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_mod__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__mod__(lhs)
    } else if (opp.value == '!') {
        if (lhs.type == 'nf') {
            value = new WaveGrassBoolean(false)
        } else value = lhs.__not__()
    } else if (opp.value == '!!') {
        if (lhs.type == 'nf') {
            value = new WaveGrassBoolean(true)
        } else value = lhs.__bool__()
    } else if (opp.value == '~') {
        value = lhs.__b_not__()
    } else if (opp.value == '~~') {
        value = lhs.__b_not__().__b_not__()
    } else if (opp.value == '++') {
        lhs.__value = lhs.__add__(new WaveGrassNumber(1)).__value_of__()
        value = lhs
    } else if (opp.value == '_++') {
        let old_value = createObject(lhs.__type__(), lhs.__value_of__())
        lhs.__value = lhs.__add__(new WaveGrassNumber(1)).__value_of__()
        value = old_value
    } else if (opp.value == '--') {
        lhs.__value = lhs.__sub__(new WaveGrassNumber(1)).__value_of__()
        value = lhs
    } else if (opp.value == '_--') {
        let old_value = createObject(lhs.__type__(), lhs.__value_of__())
        lhs.__value = lhs.__sub__(new WaveGrassNumber(1)).__value_of__()
        value = old_value
    } else if (opp.value == '&') {
        value = lhs.__b_and__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_and__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_and__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_and__(lhs)
    } else if (opp.value == '^') {
        value = lhs.__b_xor__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_xor__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_xor__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_xor__(lhs)
    } else if (opp.value == '|') {
        value = lhs.__b_or__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_or__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_or__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_or__(lhs)
    } else if (opp.value == '<<') {
        value = lhs.__b_l_shift__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_l_shift__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_l_shift__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_l_shift__(lhs)
    } else if (opp.value == '>>') {
        value = lhs.__b_r_us_shift__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_r_us_shift__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_r_us_shift__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_r_us_shift__(lhs)
    } else if (opp.value == '>>>') {
        value = lhs.__b_r_s_shift__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_b_r_s_shift__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_b_r_s_shift__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__b_r_s_shift__(lhs)
    } else if (opp.value == '&&') {
        value = lhs.__and__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_and__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_and__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__and__(lhs)
    } else if (opp.value == '||') {
        value = lhs.__or__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__r_or__(lhs)
        if (WaveGrassError.isError(value)) value = lhs.__r_or__(rhs)
        if (WaveGrassError.isError(value)) value = rhs.__or__(lhs)
    } else if (opp.value == '.') {
        value = lhs.__get_property__(rhs.value)
        if (typeof value == 'function') {
            value = new WaveGrassFunction(rhs.value, ['*n'], `<internal_${rhs.value}>`, true, lhs)
        }

        if (value.changeable !== null) value = value.value
        else if (!(value instanceof WaveGrassObject)) value = createObject(typeof value, value)
    } else if (opp.value == 'typeof') {
        value = createObject('string', lhs.__type__())
    } else {
        value = new WaveGrassNull()
    }

    if (WaveGrassError.isError(value)) {
        value.__col = opp.col
        value.__line = opp.line
        throwError(value)
    }

    return value
}

/*
TODO
    Implement and clear this
*/

/**
 * 
 * @param { { type: string, value: any }[] | { type: string, value: any} } ast 
 * @param { string } scope 
 * @param { number } depth 
 * @param { { lines: string[], file: string } } filedata 
 * @returns { Promise<WaveGrassObject> }
 */
const operate = async (ast, scope, depth = 0) => {
    if (!ast.length) {
        if (ast.type == 'variable') {
            ast = getValueOfVariable(ast, scope)
            if (ast.type == 'nf') return ast
            return ast.value
        } else if (ast.type == 'array') {
            let len = 0
            for (let j in ast.values) {
                if (ast.values[j].type == 'variable') {
                    ast.values[j] = getValueOfVariable(ast.values[j], scope)
                    let v = getValueOfVariable(ast.values[j], scope)
                    if (v == 'nf') throwError(new WaveGrassError('ReferenceError', `'${ast.values[j].value}' is not defined`, ast.values[j].col, ast.values[j].line))
                    ast.values[j] = v.value
                } else if (ast.values[j].type == 'operation') {
                    ast.values[j] = await operate(ast.values[j].value, scope, depth)
                } else ast.values[j] = createObject(ast.values[j].type, ast.values[j].value)
                len++
            }
            return new WaveGrassArray(ast.values, len)
        }

        if (!(ast instanceof WaveGrassObject)) ast = createObject(ast.type, ast.value)
        return ast
    }

    ast = structuredClone(ast)
    let values = []

    for (let i = 0; i < ast.length; i++) {
        if (ast[i].type == 'property') {
            values.push(await get_property(values.pop(), ast[i].ktype, ast[i].property, scope, depth))
        } else if (ast[i].type == 'operator') {
            if (unary.includes(ast[i].value)) {
                values.push(operate_by_operation(ast[i], values.pop()))
            } else {
                if (ast[i].value == '+' || ast[i].value == '-') {
                    if ((!ast[i - 2] || (ast[i - 2] && ['keyword', 'operator', 'comparator', 'symbol'].includes(ast[i - 2]))) && !ast[i + 1]) {
                        values.push(operate_by_operation(ast[i], createObject('number', 0), values.pop()))
                    } else {
                        let rhs = values.pop(), lhs = values.pop()
                        values.push(operate_by_operation(ast[i], lhs, rhs))
                    }
                } else {
                    let rhs = values.pop(), lhs = values.pop()
                    values.push(operate_by_operation(ast[i], lhs, rhs))
                }
            }
        } else if (ast[i].type == 'keyword') {
            if (ast[i].value != 'typeof') {
                if (unary.includes(ast[i].value)) {
                    values.push(conditional_check(ast[i], values.pop()))
                } else {
                    let rhs = values.pop(), lhs = values.pop()
                    values.push(conditional_check(ast[i], lhs, rhs))
                }
            } else {
                values.push(operate_by_operation(ast[i], values.pop()))
            }
        } else if (ast[i].type == 'comparator') {
            if (unary.includes(ast[i].value)) {
                values.push(conditional_check(ast[i], values.pop()))
            } else {
                let rhs = values.pop(), lhs = values.pop()
                values.push(conditional_check(ast[i], lhs, rhs))
            }
        } else if (ast[i].type == 'symbol') {
            if (ast[i].value == ':') {
                let lhs = values.pop(), rhs = await operate(ast[i].to_operate.type == 'operation' ? ast[i].to_operate.value : ast[i].to_operate)

                values.push({ type: 'property', lhs: lhs, rhs: rhs })
                let v = ast.slice(i + 1, ast.length).find(i => i.value == ':')
                if (v) {
                    throwError(new WaveGrassError('Syntax Error', 'Unexpected token \':\'', v.col, v.line))
                }
            } else if (ast[i].value == '=') {
                let lhs = values.pop(), rhs = ast[i].to_operate

                await run({
                    type: 'assignment',
                    lhs: lhs,
                    rhs: rhs
                }, scope, depth)

                values.push(getValueOfVariable(lhs, scope).value)
            }
            if (ast[i].value == '.') {
                let rhs = values.pop(), lhs = values.pop()
                values.push(operate_by_operation(ast[i], lhs, rhs))
            }
        } else {
            let vl = ast[i]
            if (vl.type == 'call') {
                let variable = values.pop()
                if (variable.__type__() == 'method') {
                    vl.value = variable
                    vl = await run(vl, scope, depth)
                } else {
                    throwError(new WaveGrassError('TypeError', `'${variable.__value_of__()}' of <class ${variable.__type__()}> is not callabe`, vl.col, vl.line))
                }
            } else if (vl.type == 'variable') {
                if (ast[i + 1] && ast[i + 1].value == '.') {
                } else {
                    let v = getValueOfVariable(vl, scope)
                    if (v.type == 'nf') {
                        if (!ast[i + 1] || !['!', '!!', ':', '=', 'as'].includes(ast[i + 1].value)) throwError(new WaveGrassError('ReferenceError', `'${vl.value}' is not defined`, vl.col, vl.line))
                        vl = { ...vl, type: 'nf' }
                    } else {
                        if (!ast[i + 1] || !['!', '!!', ':', '='].includes(ast[i + 1].value)) vl = v.value
                    }
                }
            } else {
                if (vl.type == 'array') {
                    let len = 0
                    for (let j in vl.values) {
                        if (vl.values[j].type == 'variable') {
                            let v = getValueOfVariable(vl.values[j], scope)
                            if (v.type == 'nf') throwError(new WaveGrassError('ReferenceError', `'${vl.values[j].value}' is not defined`, vl.values[j].col, vl.values[j].line))
                            vl.values[j] = v.value
                        } else if (vl.values[j].type == 'operation') {
                            vl.values[j] = await operate(vl.values[j].value, scope, depth)
                        } else vl.values[j] = createObject(vl.values[j].type, vl.values[j].value)
                        len++
                    }
                    vl = new WaveGrassArray(vl.values, len)
                }
                else if (!(vl instanceof WaveGrassObject)) vl = createObject(vl.type, vl.value)
            }
            values.push(vl)
        }
    }

    if (values.length > 1) {
        let token = ast.findIndex(i => unary.includes(i.value))
        if (token == -1) token = ast.findIndex(i => !['string', 'number', 'varialbe', 'null', 'array', 'call'].includes(i.type))
        throwError(new WaveGrassError('Syntax Error', `Unexpected token`, ast[token - 1].col, ast[token - 1].line))
    }
    return values[0]
}

/**
 * 
 * @param { { type: 'variable', value: string } } v 
 * @param { string } scope 
 * @returns { { changeable: boolean, value: WaveGrassObject } }
 */
const getValueOfVariable = (v, scope, parse_rerference = true) => {
    let s = scope
    let value = null
    while (s) {
        value = scopes[s].map.get(v.value)
        if (!value) s = scopes[s].parent
        else break
    }

    if (value) {
        if (value.refereces && parse_rerference) {
            value = getValueOfVariable(value.refereces, s)
        }
        return value
    }

    return { type: 'nf' }
}

/**
 * 
 * @param { { type: 'variable', value: string } } v 
 * @param { string } scope 
 * @returns { string }
 */
const find_variable_scope = (v, scope) => {
    let s = scope
    while (s) {
        if (!scopes[s].map.get(v.value)) s = scopes[s].parent
        else break
    }
    return s
}

/**
 * 
 * @param { string } start 
 * @param  { string[] } values 
 */
const find_scope_that_matches = (start, ...values) => {
    let s = start

    while (s) {
        if (values.find(i => s.startsWith(i))) {
            return s
        }

        s = scopes[s].parent
    }
    return
}

const assign_property = async (variable, ktype, property, value, scope, depth) => {
    let val;
    if (variable.type == 'property') {
        val = await get_property(variable.lhs, ktype, variable.values, scope, depth)
    } else if (!variable.__type__) {
        if (variable.type == 'variable') {
            val = getValueOfVariable(variable, scope)
        } else {
            val = createObject(variable.type, variable.value)
        }
        if (val.type == 'nf') {
            throwError(new WaveGrassError('Reference Error', `'${variable.value}' is not defined`, variable.col, variable.line))
        }
        val = val.value
    } else {
        val = variable
    }

    value = await operate(value.type == 'operation' ? value.value : value)

    if (!property) throwError(new WaveGrassError('SyntaxError', 'No property or index was given', 0, 0))

    if (ktype == '[]') {
        if (!val.__mutable__()) {
            throwError(new WaveGrassError('TypeError', 'Cannot change value of an immutable', val.col, val.line))
        }

        property = await operate(property.type == 'operation' ? property.value : property, scope, depth)
    }

    if (property.type) {
        return val.__set_property__(property.value, value)
    } else {
        if (property.__type__() == 'array') {
            let iterator = value.__iterator__()
            if (iterator.next) {
                for (let i in property.__value) {
                    val.__set_property__(property.__value[i].__value_of__(), iterator.next().value)
                }
            } else {
                val.__set_property__(property.__value['0'].__value_of__(), value)
                for (let i in property.__value) {
                    if (i != '0') {
                        val.__set_property__(property.__value[i].__value_of__(), new WaveGrassNull())
                    }
                }
            }
        } else {
            val.__set_property__(property.__value_of__(), value)
        }
    }
}

const get_property = async (variable, ktype, property, scope, depth) => {
    let val;
    if (!variable.__type__) {
        if (variable.type == 'variable') {
            val = getValueOfVariable(variable, scope)

        } else {
            val = createObject(variable.type, variable.value)
        }
        if (val.type == 'nf') {
            throwError(new WaveGrassError('Reference Error', `'${variable.value}' is not defined`, variable.col, variable.line))
        }
        val = val.value
    } else {
        val = variable
    }

    if (!property) throwError(new WaveGrassError('SyntaxError', 'No property or index was given', 0, 0))

    if (ktype == '[]') {
        property = await operate(property.type == 'operation' ? property.value : property, scope, depth)
    }

    if (property.type) {
        return val.__get_property__(property.value)
    } else if (property.__type__() == 'array') {
        let value = new WaveGrassArray({}, 0)
        let iter = property.__iterator__()

        for (let i in property.__value) {
            value.__set_property__(iter.next().index.__value_of__(), val.__get_property__(property.__value[i].__value_of__()) ?? new WaveGrassNull())
        }
        return value
    } else {
        return val.__get_property__(property.__value_of__()) ?? new WaveGrassNull()
    }
}

const parse_params = async (tokens, scope, depth = 0) => {
    let args = []
    for (const i of tokens) {
        if (i.type == 'operation') {
            let operated = await operate(i.value, scope, depth)
            if (operated.type) {
                if (operated.type == 'property') {
                    if (operated.rhs.type == 'variable') {
                        let value = getValueOfVariable(i, scope)
                        if (value.type == 'nf') {
                            throwError(`Reference Error`, `'${i.value}' is not defined`, i.line, i.col)
                        }
                        value = value.value
                        args[operated.lhs.value] = value
                    } else {
                        if (!(operated.rhs instanceof WaveGrassObject)) {
                            operated.rhs = createObject(operated.rhs.type, operated.rhs.value)
                        }
                        args[operated.lhs.value] = operated.rhs
                    }
                }
            } else args.push(operated)
        } else {
            if (i.type == 'variable') {
                let value = getValueOfVariable(i, scope)
                if (value.type == 'nf') {
                    throwError(new WaveGrassError(`Reference Error`, `'${i.value}' is not defined`, i.col, i.line))
                }
                value = value.value
                args.push(value)
            } else {
                if (i.type == 'array') {
                    for (let j = 0; j < i.values.length; j++) {
                        i[j] = await parse_params(i[j], scope, depth)
                    }
                } else if (i.token == 'missing') {
                    args.push(new WaveGrassNull())
                } else {
                    if (!(i instanceof WaveGrassObject)) args.push(createObject(i.type, i.value))
                    else args.push(i)
                }
            }
        }
    }
    return args
}

/**
 * 
 * @param { { type: string, [x:string]: {} } } ast 
 * @param { string } scope 
 * @param { number } depth_value 
 * @returns 
 */
const run = async (ast, scope, depth_value = 0) => {
    if (ast.type != 'call') ast = structuredClone(ast)

    if (ast.type == 'assignment') {
        if (ast.lhs.type == 'array') {
            if (!ast.lhs.values[0]) {
                throwError(new WaveGrassError('Syntax Error', 'Found array assignment of 0 length', ast.lhs.col, ast.lhs.line))
            }

            let value = {
                changeable: ast.lhs.changeable,
                value: await operate(ast.rhs.type == 'operation' ? ast.rhs.value : ast.rhs, scope, depth_value)
            }

            let iterator = value.value.__iterator__()
            if (iterator.next) {
                for (let i in ast.lhs.values) {
                    let place = scopes[find_variable_scope(ast.lhs.values[i], scope) ?? scope].map

                    if (place.has(ast.lhs.values[i].value)) {
                        if (!place.get(ast.lhs.values[i].value).changeable) {
                            throwError(new WaveGrassError('TypeError', `Assignment to a constant variable '${ast.lhs.values[i]}'`, ast.lhs.col, ast.lhs.line))
                        }
                    }

                    place.set(ast.lhs.values[i].value, {
                        value: iterator.next().value,
                        changeable: ast.lhs.changeable
                    })
                }
            } else {
                let place = scopes[find_variable_scope(ast.lhs.values['0'], scope) ?? scope].map

                if (place.has(ast.lhs.values['0'].value)) {
                    if (!place.get(ast.lhs.value['0'].value).changeable) {
                        throwError(new WaveGrassError('TypeError', `Assignment to a constant variable '${ast.lhs.values[i]}'`, ast.lhs.col, ast.lhs.line))
                    }
                }

                place.set(ast.lhs.values['0'].value, {
                    value: value.value,
                    changeable: ast.lhs.changeable
                })

                for (let i in ast.lhs.values) {
                    if (i != '0') {
                        place = scopes[find_variable_scope(ast.lhs.values[i], scope) ?? scope].map

                        if (place.has(ast.lhs.values[i].value)) {
                            if (!place.get(ast.lhs.value).changeable) {
                                throwError(new WaveGrassError('TypeError', `Assignment to a constant variable '${ast.lhs.values[i]}'`, ast.lhs.col, ast.lhs.line))
                            }
                        }

                        place.set(ast.lhs.values[i].value, {
                            value: new WaveGrassNull(),
                            changeable: ast.lhs.changeable
                        })
                    }
                }
            }
        } else if (ast.lhs.type == 'property') {
            await assign_property(ast.lhs.lhs, ast.lhs.ktype, ast.lhs.values, ast.rhs, scope)
        } else {
            let place = scopes[find_variable_scope(ast.lhs, scope) ?? scope].map
            if (place.has(ast.lhs.value)) {
                if (!place.get(ast.lhs.value).changeable) {
                    throwError(new WaveGrassError('TypeError', `Assignment to a constant variable '${ast.lhs.value}'`, ast.lhs.col, ast.lhs.line))
                }
            }
            if (ast.rhs.type == 'operation') {
                let value = {
                    changeable: ast.lhs.changeable ?? true,
                    value: await operate(ast.rhs.value, scope, depth_value)
                }
                place.set(ast.lhs.value, value)
            } else {
                if (ast.rhs.type == 'variable') {
                    let value = getValueOfVariable(ast.rhs, scope)
                    if (value.type == 'nf') {
                        throwError(new WaveGrassError(`Reference Error`, `'${ast.lhs.value}' is not defined`, ast.lhs.line, ast.lhs.col))
                    }
                    value = value.value
                    if (value.__type__() == 'method') {
                        let obj = {
                            changeable: ast.lhs.changeable,
                            value: createObject(value.__type__(), ast.lhs.value, value.__get_args__(), value.__get_statements__(), value.__internal__())
                        }
                        place.set(ast.lhs.value, obj)
                    } else if (value.__type__() == 'array') {
                        let obj = {
                            changeable: ast.lhs.changeable,
                            value: new WaveGrassArray(value.__value, value.length.__value_of__())
                        }
                        place.set(ast.lhs.value, obj)
                    } else {
                        let obj = {
                            changeable: ast.lhs.changeable,
                            value: createObject(value.__type__(), value.__value_of__())
                        }
                        place.set(ast.lhs.value, obj)
                    }
                } else if (ast.rhs.type == 'call') {
                    let val = await run(ast.rhs, scope, depth_value)
                    val = createObject(val.type, val.value)
                    place.set(ast.lhs.value, val)
                } else {
                    if (ast.rhs.type == 'method') {
                        let obj = {
                            changeable: ast.lhs.changeable,
                            value: createObject(ast.rhs.type, ast.lhs.value, ast.rhs.args, ast.rhs.statements, scope)
                        }
                        place.set(ast.lhs.value, obj)
                    } else {
                        let obj = {
                            changeable: ast.lhs.changeable,
                            value: createObject(ast.rhs.type, ast.rhs.value)
                        }
                        place.set(ast.lhs.value, obj)
                    }
                }
            }
            return ast.lhs
        }
    } else if (ast.type == 'assignment2') {
        let place = scopes[find_variable_scope(ast.lhs, scope) ?? scope].map
        if (ast.rhs.type == 'variable') {
            let value = getValueOfVariable(ast.rhs, scope)

            if (value.type == 'nf') {
                throwError(new WaveGrassError(`Reference Error`, `'${ast.lhs.value}' is not defined`, ast.lhs.line, ast.lhs.col))
            }

            place.set(ast.lhs.value, {
                refereces: {
                    type: 'variable',
                    value: ast.rhs.value
                },
                changeable: ast.lhs.changeable
            })
        } else {
            ast.type = 'assignment'
            return await run(ast, scope, depth_value)
        }
        return ast.lhs
    } else if (ast.type == 'call') {
        let func;
        if (ast.value.__type__) {
            if (ast.value.__type__() == 'method') {
                func = ast.value
            } else {
                throwError(new WaveGrassError('TypeError', `${ast.value.__type__()} is not callabe`, ast.col, ast.line))
            }
        } else {
            func = getValueOfVariable(ast.value, scope)

            if (func.type == 'nf') {
                throwError(new WaveGrassError(`Reference Error`, `'${ast.value.value}' is not defined`, ast.value.line, ast.value.col))
            }

            func = func.value
        }
        if (func.__type != 'method') {
            throwError(new WaveGrassError(`Reference Error`, `'${ast.value.value}' is not a method`, ast.value.line, ast.value.col))
        }

        WaveGrassError.trace.push(`${func.__name__().__value_of__()} (${WaveGrassError.file}:${ast.value.line}:${ast.value.col})`)
        let args = await parse_params(ast.args, scope, depth_value)

        if (func.__internal__()) {
            let ret = new WaveGrassNull()

            let internal_type = func.__get_statements__()
            if (internal_type == '<internal_print>') {
                let sep = args.sep?.__value_of__() ?? ' '
                let end = args.end?.__value_of__() ?? '\n'
                let colored = args.colored?.__bool__().__value_of__() ?? false

                process.stdout.write(`${await toString(args, sep, colored)}${end}`)
            } else if (internal_type == '<internal_prompt>') {
                ret = createObject('string', await input(await toString(args, '', scope)))
            } else if (internal_type == '<internal_to_num>') {
                if (!args[0]) return new WaveGrassNull()
                if (args[0].__type__() == 'number') {
                    ret = args[0]
                } else if (args[0].__value_of__().includes('.')) {
                    ret = createObject('number', parseFloat(args[0].__value_of__()))
                } else
                    ret = createObject('number', parseInt(args[0].__value_of__(), 10))
            } else if (internal_type == '<internal_isNaN>') {
                if (isNaN(args[0].__value_of__())) ret = new WaveGrassBoolean(true)
                else ret = new WaveGrassBoolean(false)
            } else {
                if (func.__belongs_to__()) {
                    ret = func.__belongs_to__()[func.__name__().__string__()](...args)
                    if (!(ret instanceof WaveGrassObject)) ret = createObject(typeof ret, ret)
                }
            }
            WaveGrassError.trace.pop()
            return ret
        } else {
            let lscope = `${func.__name__().__value_of__()}${scope}${depth_value}`
            scopes[lscope] = {
                parent: func.__scope,
                map: new Map()
            }
            let params = func.__get_args__()
            for (const i in args) {
                if (isNaN(i)) {
                    let index = params.indexOf(i)
                    if (index !== null) {
                        scopes[lscope].map.set(i, { changeable: true, value: args[i] })
                        params.splice(index, 1)
                    }
                }
            }
            for (let i = 0; i < params.length; i++) {
                scopes[lscope].map.set(params[i], args[i] ?? new WaveGrassNull())
            }

            let ret_val = new WaveGrassNull();
            for (const i of func.__get_statements__()) {
                ret_val = await run(i, lscope, depth_value + 1)

                if (ret_val) {
                    if (ret_val.type == 'return') {
                        ret_val = ret_val.value
                        break
                    }
                }
            }

            scopes[lscope] = undefined
            WaveGrassError.trace.pop()
            return ret_val
        }
    } else if (ast.type == 'if') {
        let lscope = `if${scope}${depth_value}`
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }
        if (ast.condition.type != 'operation') {
            ast.condition = { type: 'operation', value: [ast.condition] }
        }
        let br = false, cont = false, ret = false
        if ((await operate(ast.condition.value, scope)).__bool__().__value_of__()) {
            for (const i of ast.positive) {
                let v = await run(i, lscope, depth_value + 1)
                if (v) {
                    if (v.type == 'break') {
                        br = true
                        break
                    } else if (v.type == 'continue') {
                        cont = true
                        break
                    } else if (v.type == 'return') {
                        ret = v
                        break
                    }
                }
            }
        } else {
            if (ast.negative) {
                if (Array.isArray(ast.negative)) {
                    for (const i of ast.negative) {
                        let v = await run(i, lscope, depth_value + 1)
                        if (v) {
                            if (v.type == 'break') {
                                br = true
                                break
                            } else if (v.type == 'continue') {
                                cont = true
                                break
                            } else if (v.type == 'return') {
                                ret = v
                                break
                            }
                        }
                    }
                } else {
                    let v = await run(ast.negative, lscope, depth_value + 1)
                    if (v) {
                        if (v.type == 'break') {
                            br = true
                        } else if (v.type == 'continue') {
                            cont = true
                        } else if (v.type == 'return') {
                            ret = v
                        }
                    }
                }
            }
        }

        scopes[lscope] = undefined
        if (br) return { type: 'break' }
        if (cont) return { type: 'continue' }
        if (ret) return ret
    } else if (ast.type == 'for') {
        let lscope = `for${scope}${depth_value}`
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }

        if (ast.loopvar.type == 'assignment') {
            ast.loopvar = await run(ast.loopvar, lscope, depth_value)
        }

        if (!ast.loopvar.changeable) {
            ast.loopvar.changeable = true
        }

        let out = false, ret = false

        if (ast.condition.iterative) {
            let iteratable = (await (operate(ast.change, scope, depth_value)))
            let iterator = iteratable.__iterator__()

            if (iterator.__type__ && iterator.__type__() == 'null') {
                throwError(new WaveGrassError('TypeError', `<class ${iteratable.__type__()}> object is not an iterable`, ast.change.col, ast.change.line))
            }

            let value = iterator.next()
            while (!value.finished.__value_of__()) {
                if (ast.condition.type.value == 'of') await run({
                    type: 'assignment',
                    lhs: ast.loopvar,
                    rhs: { type: value.value.__type__(), value: value.value.__value_of__() }
                }, lscope, depth_value)
                else await run({
                    type: 'assignment',
                    lhs: ast.loopvar,
                    rhs: { type: 'number', value: value.index.__value_of__() }
                }, lscope, depth_value)

                for (const i of ast.block) {
                    let v = await run(i, lscope, depth_value + 1)
                    if (v) {
                        if (v.type == 'break') {
                            out = true
                            break
                        } else if (v.type == 'continue') {
                            break
                        } else if (v.type == 'return') {
                            ret = v
                            break
                        }
                    }
                }
                if (out) break
                value = iterator.next()
            }
        } else {
            if (ast.condition.type != 'operation') {
                ast.condition = { type: 'operation', value: [ast.condition] }
            }

            while ((await operate(ast.condition.value, lscope)).__bool__().__value_of__()) {
                for (const i of ast.block) {
                    let v = await run(i, lscope, depth_value + 1)
                    if (v) {
                        if (v.type == 'break') {
                            out = true
                            break
                        } else if (v.type == 'continue') {
                            break
                        } else if (v.type == 'return') {
                            ret = v
                            break
                        }
                    }
                }
                if (out) break
                await operate(ast.change.value, lscope, depth_value)
            }
            scopes[lscope] = undefined
        }
        if (ret) return ret.value
    } else if (ast.type == 'while') {
        let lscope = `while${scope}${depth_value}`
        scopes[lscope] = {
            parent: scope,
            map: new Map()
        }
        if (ast.condition.type != 'operation') {
            ast.condition = { type: 'operation', value: [ast.condition] }
        }

        let out = false, ret = false
        while ((await operate(ast.condition.value, scope)).__bool__().__value_of__()) {
            for (const i of ast.block) {
                let v = await run(i, lscope, depth_value + 1)
                if (v) {
                    if (v.type == 'break') {
                        out = true
                        break
                    } else if (v.type == 'continue') {
                        break
                    } else if (v.type == 'return') {
                        ret = v
                        break
                    }
                }
            }
            if (out) break
        }
        scopes[lscope] = undefined
        if (ret) return ret.value
    } else if (ast.type == 'return') {
        let s = scope
        while (s) {
            if (s == WaveGrassError.file) throwError(new WaveGrassError('Syntax Error', 'Unexpcted token \'return\'', ast.col, ast.line))
            if (!['for', 'if', 'while'].some(i => s.startsWith(i))) break
            s = scopes[s].parent
        }
        return { type: 'return', value: await operate(ast.value.type == 'operation' ? ast.value.value : ast.value, scope, depth_value) }
    } else if (ast.type == 'break') {
        let br = find_scope_that_matches(scope, ...breakable)

        if (!br) {
            throwError(new WaveGrassError('Syntax Error', 'Unexpcted token \'break\'', ast.line, ast.col))
        }
        return { type: 'break' }
    } else if (ast.type == 'continue') {
        let br = find_scope_that_matches(scope, ...breakable)

        if (!br) {
            throwError(new WaveGrassError('Syntax Error', 'Unexpcted token \'continue\'', ast.line, ast.col))
        }
        return { type: 'continue' }
    } else if (ast.type == 'property') {
        let operation = [ast.lhs, ...(ast.values.type == 'operation' ? ast.values.value : [ast.values])]
        operation.splice(2, 0, { type: 'symbol', value: '.' })
        await operate(operation, scope, depth_value)
    } else if (ast.type == 'throw') {
        throwError(new WaveGrassError('Error', 'Unexpected error occured', ast.col, ast.line))
    } else if (ast.type == 'export') {
        for (let i = 0; i < ast.value.length; i++) {
            let token = ast.value[i]
            if (token.type == 'variable') {
                let v = getValueOfVariable(token, scope)
                if (!v.exported) v.exported = true
            } else if (token.type == 'operation') {
                if (token.value.length == 1) {
                    token = token.value[0]
                    i--
                } else {
                    if (token.value.find(i => i.value == 'as')) {
                        scopes[scope].map.set(token.value[1].value, {
                            changeable: true,
                            references: token.value[0]
                        })

                        let v = getValueOfVariable(token.value[1], scope, false)
                        if (!v.exported) v.exported = true
                    }
                }
            } else {
                throwError(new WaveGrassError('SyntaxError', 'Unxpected token', ast.col, ast.line),)
            }
        }

    } else if (ast.type == 'import') {
        const parsefile = require("./parsefile")
        let oldfile = WaveGrassError.file
        WaveGrassError.trace.push(`(${WaveGrassError.file}:${ast.line}:${ast.col})`)

        for (let i = 0; i < ast.value.length; i++) {
            let token = ast.value[i]
            if (token.type == 'variable' || token.type == 'string') {
                let file = `${WaveGrassError.file.slice(0, WaveGrassError.file.lastIndexOf('\\') + 1)}${token.value}${token.value.endsWith('.wg') ? '' : '.wg'}`
                await parsefile(file)

                let module = new WaveGrassModule(ast.value[i].value, [])
                for (const [key, value] of scopes[file].map.entries()) {
                    if (value.exported) {
                        if (value.references) {
                            module.set(key, getValueOfVariable(value.references, file))
                        } else module.set(key, value.value)
                    }
                }

                scopes[oldfile].map.set(ast.value[i].value, {
                    changeable: true,
                    exported: false,
                    value: module
                })
            } else if (token.type == 'operation') {
                if (token.value.length == 1) {
                    token = token.value[0]
                    i--
                } else {
                    if (token.value.find(i => i.value == 'as')) {
                        let file = `${WaveGrassError.file.slice(0, WaveGrassError.file.lastIndexOf('\\') + 1)}${token.value[0].value}${token.value[0].value.endsWith('.wg') ? '' : '.wg'}`
                        await parsefile(file)

                        let module = new WaveGrassModule(token.value[1].value, [])
                        for (const [key, value] of scopes[file].map.entries()) {
                            if (value.exported) {
                                if (value.references) {
                                    module.set(key, getValueOfVariable(value.references, file))
                                } else module.set(key, value.value)
                            }
                        }

                        scopes[oldfile].map.set(token.value[1].value, {
                            changeable: true,
                            exported: false,
                            value: module
                        })
                    } else {
                        throwError(new WaveGrassError('SyntaxError', 'Unxpected token', ast.col, ast.line),)
                    }
                }
            } else {
                throwError(new WaveGrassError('SyntaxError', 'Unxpected token', ast.col, ast.line),)
            }
        }
    }
}

/**
 * 
 * @param { import("./parser").Token[] } tokens 
 */
const execute = async (tokens, scope, depth_value = 0) => {
    scopes[scope] = {
        parent: 'global',
        map: new Map()
    }

    let hoists = []
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i]?.type == 'hoist') {
            hoists.push(tokens.splice(i, 1)[0].value)
            i--
        }
    }

    for (const i of hoists) {
        await run(i, scope, depth_value, tokens.filedata)
    }

    for (const i of tokens) {
        await run(i, scope, depth_value, tokens.filedata)
    }
}

module.exports = execute
