let globalDepth = 3

class WaveGrassObject {

    constructor(value) {
        this.__value = value
        this.__type = 'object'
        this.__mutable = false
        this.__properties = {}
    }

    __mutable__ = () => this.__mutable

    __string__ = (colored) => {
        return colored ? '\x1b[36m[object]\x1b[0m' : '[object]'
    }

    __value_of__ = () => {
        return this.__value
    }

    __class__ = () => {
        return { type: 'class', value: this.constructor.name }
    }

    __name__ = () => {
        return { type: 'string', value: this.constructor.name }
    }

    __type__ = () => {
        return this.__type
    }

    /**
     * 
     * @param { WaveGrassObject } lval 
     * @param { WaveGrassObject } rval 
     * 
     * @returns { WaveGrassObject }
     */

    __add__ = rval => { return new WaveGrassError(`TypeError`, `Can't add two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`) }

    __r_add__ = rval => {
        return this.__add__(rval)
    }

    __sub__ = rval => {
        return new WaveGrassError('TypeError', `Can't subtract two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_sub__ = rval => {
        return this.__sub__(rval)
    }

    __mul__ = rval => {
        return new WaveGrassError('TypeError', `Can't multiply two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }

    __div__ = rval => {
        return new WaveGrassError('TypeError', `Can't divide two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_div__ = rval => {
        return this.__div__(rval)
    }

    __expo__ = rval => {
        return new WaveGrassError('TypeError', `Can't raise <class ${this.__type__()}> to the power of <class ${rval.__type__()}>`)
    }

    __r_expo__ = rval => {
        return this.__expo__(rval)
    }

    __mod__ = rval => {
        return new WaveGrassError('TypeError', `Can't find the remainder between <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_mod__ = rval => {
        return this.__mod__(rval)
    }

    __negate__ = () => {
        return new WaveGrassError('TypeError', `Can't negate object of type <class ${this.__type__()}>`)
    }

    __normal__ = () => {
        return new WaveGrassError('TypeError', `Can't normalize object of type <class ${this.__type__()}>`)
    }

    __not__ = () => {
        if (this.__bool__().__value_of__()) return new WaveGrassBoolean(false)
        return new WaveGrassBoolean(true)
    }

    __bool__ = () => {
        if (this.__value) return new WaveGrassBoolean(true)
        return new WaveGrassBoolean(false)
    }

    __equals__ = rval => {
        if (this.__type__() == rval.__type__()) {
            if (this.__mutable) {
                if (this == rval) return new WaveGrassBoolean(true)
            } else if (this.__value_of__() == rval.__value_of__()) return new WaveGrassBoolean(true)
        } else if (this.__value_of__() == rval.__value_of__()) return new WaveGrassBoolean(true)

        return new WaveGrassBoolean(false)
    }

    __strict_equals__ = rval => {
        if (this.__type__() == rval.__type__() && rval.__value_of__() == this.__value_of__()) {
            if (this.__mutable) {
                if (this == rval) return new WaveGrassBoolean(true)
            } else return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __greater_than__ = rval => {
        return new WaveGrassError('TypeError', `Can't compare <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __less_than__ = rval => {
        return new WaveGrassError('TypeError', `Can't compare <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __constructor__ = rval => this.constructor

    __and__ = rval => {
        if (this.__bool__().__value_of__()) return rval
        else return this
    }

    __r_and__ = rval => {
        return this.__and__(rval)
    }

    __or__ = rval => {
        if (this.__bool__().__value_of__()) return this
        else return rval
    }

    __r_or__ = rval => {
        return this.__or__(rval)
    }

    __b_and__ = rval => {
        return new WaveGrassError('TypeError', `Can't perform binary and between two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_b_and__ = rval => {
        return this.__b_and__(rval)
    }

    __b_or__ = rval => {
        return new WaveGrassError('TypeError', `Can't perform binary or between two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_b_or__ = rval => {
        return this.__b_or__(rval)
    }

    __b_xor__ = rval => {
        return new WaveGrassError('TypeError', `Can't perform binary xor between two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_b_xor__ = rval => {
        return this.__b_xor__(rval)
    }

    __b_not__ = () => {
        return new WaveGrassError('TypeError', `Can't perform binary not on item of <class${this.__type__()}>`)
    }

    __b_l_shift__ = rval => {
        return new WaveGrassError('TypeError', `Can't perform binary left shift between two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_b_l_shift__ = rval => {
        return this.__b_l_shift__(rval)
    }

    __b_r_s_shift__ = rval => {
        return new WaveGrassError('TypeError', `Can't perform binary right signed shift between two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_b_r_s_shift__ = rval => {
        return this.__b_r_s_shift__(rval)
    }

    __b_r_us_shift = rval => {
        return new WaveGrassError('TypeError', `Can't perform binary right unsigned shift between two items of type <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_b_r_us_shift__ = rval => {
        return this.__b_r_us_shift(rval)
    }

    /**
     * 
     * @returns { WaveGrassNull | { next: () => { value: WaveGrassObject, index: WaveGrassNumber, finished: WaveGrassBoolean } } }
     */
    __iterator__ = () => {
        return new WaveGrassNull()
    }

    __get_property__ = name => {
        if (name instanceof WaveGrassObject) name = name.__value_of__()

        if (['constructor', 'prototype'].includes(name)) return new WaveGrassNull()

        if (this.__properties[name]) return this.__properties[name]

        if (this[name]) return this[name]

        return new WaveGrassNull()
    }

    __set_property__ = (name, value) => {
        if (name instanceof WaveGrassObject) name = name.__value_of__()
        this.__properties[name] = value
    }

    __in__ = rval => {
        let iter = rval.__iterator__()
        if (iter.__type__ && iter.__type__() == 'null') {
            return new WaveGrassError('TypeError', `<class ${this.__type__()}> is not iterable`)
        } else {
            if (this.__value_of__() == '') return new WaveGrassBoolean(true)
            if (rval.__value_of__() == '') return new WaveGrassBoolean(false)

            let value = iter.next()
            do {
                if (value.index.__equals__(this).__value_of__()) return new WaveGrassBoolean(true)
                value = iter.next()
            } while (!value.finished.__value_of__())
        }
        return new WaveGrassBoolean(false)
    }

    __of__ = rval => {
        let iter = rval.__iterator__()
        if (iter.__type__ && iter.__type__() == 'null') {
            return new WaveGrassError('TypeError', `<class ${this.__type__()}> is not iterable`)
        } else {
            let value = iter.next()
            do {
                if (value.value.__equals__(this).__value_of__()) return new WaveGrassBoolean(true)
                value = iter.next()
            } while (!value.finished.__value_of__())
        }
        return new WaveGrassBoolean(false)
    }
}

class WaveGrassNumber extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.__type = 'number'
        this.__mutable = false
    }

    __string__ = (colored) => {
        return colored ? `\x1b[33m${this.__value_of__()}\x1b[0m` : `${this.__value_of__()}`
    }

    __add__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() + rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __sub__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() - rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __r_sub__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(rval.__value_of__() - this.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __mul__ = rval => {
        let old_type = rval.__type__(), old_value = rval.__value_of__()
        if (old_type == 'array') {
            return rval.__mul__(this)
        }
        rval = WaveGrassNumber.parseInt(rval, 10)

        if (old_type == 'string' && isNaN(rval.__value_of__())) {
            if (this.__value_of__() != 'NaN') return new WaveGrassString(old_value.repeat(this.__value_of__()))
        }
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() * rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __div__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(this.__value_of__() / rval.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __r_div__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' || this.__value_of__() != 'NaN') {
            return new WaveGrassNumber(rval.__value_of__() / this.__value_of__())
        } else new WaveGrassNumber('NaN')
    }

    __equals__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() == this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __greater_than__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() == 'NaN' && this.__value_of__() != 'NaN') {
            return new WaveGrassBoolean(true)
        } else if (rval.__value_of__() != 'NaN' && this.__value_of__() == 'NaN') {
            return new WaveGrassBoolean(false)
        }
        else if (rval.__value_of__() < this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __less_than__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() == 'NaN' && this.__value_of__() != 'NaN') {
            return new WaveGrassBoolean(true)
        } else if (rval.__value_of__() != 'NaN' && this.__value_of__() == 'NaN') {
            return new WaveGrassBoolean(false)
        }
        else if (rval.__value_of__() > this.__value_of__()) {
            return new WaveGrassBoolean(true)
        } else return new WaveGrassBoolean(false)
    }

    __bool__ = () => {
        if (this.__value_of__() == 0 || this.__value_of__() == 'NaN') return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    __mod__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() % rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __r_mod__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(rval.__value_of__() % this.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __expo__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() ** rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __r_expo__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(rval.__value_of__() ** this.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __b_not__ = () => {
        if (this.__value_of__() == 'NaN') return new WaveGrassNumber('NaN')
        else return new WaveGrassNumber(~this.__value_of__())
    }

    __b_and__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() & rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __b_or__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() | rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __b_xor__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() ^ rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __b_l_shift__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() << rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __b_r_s_shift__ = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() >> rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    __b_r_us_shift = rval => {
        rval = WaveGrassNumber.parseInt(rval, 10)
        if (rval.__value_of__() != 'NaN' && this.__value_of__() != 'NaN') return new WaveGrassNumber(this.__value_of__() >>> rval.__value_of__())
        else return new WaveGrassNumber('NaN')
    }

    static parseInt = (n, radix = 10) => {
        if (!n.__type__()) return new WaveGrassNumber(0)

        if (n.__type__() == 'number') return n

        if (n.__type__() == 'boolean') return new WaveGrassNumber(n.__value_of__() ? 1 : 0)

        let v = parseInt(n.__value_of__(), radix)
        return new WaveGrassNumber(v)
    }
}

class WaveGrassString extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.__type = 'string'
        this.__mutable = false
        this.length = new WaveGrassNumber(this.__value_of__().length)
    }

    __string__ = () => {
        return `${this.__value_of__().toString()}`
    }

    __add__ = rval => {
        if (rval.__type__() == 'array') {
            return new WaveGrassError()
        }
        return new WaveGrassString(this.__string__() + rval.__string__())
    }

    __r_add__ = rval => {
        return new WaveGrassString(rval.__string__() + this.__string__())
    }

    __mul__ = rval => {
        return new WaveGrassString(this.__string__().repeat(WaveGrassNumber.parseInt(rval, 10).__value_of__()))
    }

    __r_mul__ = rval => {
        return this.__mul__(rval)
    }

    __bool__ = () => {
        if (this.__value == '') return new WaveGrassBoolean(false)
        else return new WaveGrassBoolean(true)
    }

    __not__ = () => {
        if (this.__bool__().__value_of__()) return new WaveGrassBoolean(false)
        return new WaveGrassBoolean(true)
    }

    __iterator__ = () => {
        let index = 0
        return {
            next: () => {
                return { value: new WaveGrassString(this.__value[index] ?? ''), index: new WaveGrassNumber(index++), finished: new WaveGrassBoolean(index > this.__value.length) }
            }
        }
    }
}

class WaveGrassArray extends WaveGrassObject {
    constructor(values, length) {
        super(values)

        this.__type = 'array'
        this.__mutable = true
        this.length = new WaveGrassNumber(length)
    }

    __bool__ = () => {
        if (this.length.__value_of__() == 0) return new WaveGrassBoolean(false)
        return new WaveGrassBoolean(true)
    }

    __string__ = (colored, depth = 1) => {
        let str = []
        let len = this.length.__value_of__()
        for (let i = 0; i < len; i++) {
            let v = this.__value[i]
            if (!v) v = new WaveGrassNull()
            if (v.__type__() == 'string') {
                str.push(colored ? `\x1b[32m'${v.__string__().replace(/'/, '\\\'')}'\x1b[0m` : `'${v.__string__().replace(/'/, '\\\'')}'`)
            } else {
                if (v.__type__() == 'array') {
                    if (globalDepth == depth) {
                        str.push(colored ? `\x1b[36m[Array]\x1b[0m` : '[Array]')
                    } else {
                        str.push(v.__string__(colored, depth + 1))
                    }
                } else {
                    str.push(v.__string__(colored))
                }
            }
        }
        return `[ ${str.join(', ')} ]`
    }

    __add__ = rval => {
        let iter = rval.__iterator__()

        if (iter.__value_of__ && iter.__type__() == 'null') {
            return new WaveGrassError('TypeError', `<class ${this.__type__()}> is not iterable`)
        }

        let arr = new WaveGrassArray({}, 0)

        let len = this.length.__value_of__()
        for (let i = 0; i < len; i++) {
            if (this.__value[i].__type__() == 'array') {
                arr.push(this.__value[i])
            } else if (this.__value[i].__type__() == 'method') {
                arr.push(createObject('method', this.__value[i].__name__(), this.__value[i].__get_args__(), this.__value[i].__get_statements__(), this.__value[i].__internal__()))
            } else arr.push(createObject(this.__value[i].__type__(), this.__value[i].__value_of__()))
        }

        if (rval.__value_of__() == '') {
            arr.push(rval)
            return
        }
        let value = iter.next()
        do {
            arr.push(value.value)
            value = iter.next()
        } while (!value.finished.__value_of__())
        return arr
    }

    __r_add__ = rval => {
        let iter = rval.__iterator__()

        if (iter.__type__ && iter.__type__() == 'null') {
            return new WaveGrassError('TypeError', `<class ${this.__type__()}> is not iterable`)
        }

        let arr = new WaveGrassArray({}, 0)
        if (rval.__value_of__() == '') {
            arr.push(rval)
            return
        }

        let value = iter.next()
        do {
            arr.push(value.value)
            value = iter.next()
        } while (!value.finished.__value_of__())

        let len = this.length.__value_of__()
        for (let i = 0; i < len; i++) {
            arr.__value.push(this[i])
        }

        return arr
    }

    __mul__ = rval => {
        let val = parseInt(rval.__value_of__(), 10)

        if (isNaN(val)) {
            return new WaveGrassError(`Cannot multiply <class ${rval.__type__()}> and <class array>`)
        } else {
            let arr = new WaveGrassArray({}, 0)
            let len = this.length.__value_of__()
            let arr_len = len * val
            for (let i = 0; i < arr_len; i++) {
                arr.push(this.__value[i % len])
            }
            return arr
        }
    }

    __set_property__ = (name, value) => {
        if (name instanceof WaveGrassObject) name = name.__value_of__()

        if (isNaN(parseInt(name))) {
            this.__properties[name] = value ?? new WaveGrassNull()
        } else {
            for (let i in this.__value) {
                if (i > name) {
                    this.__value[name] = value ?? new WaveGrassNull()
                    return
                }
            }

            this.length.__value = name + 1
            this.__value[`${name}`] = value ?? new WaveGrassNull()
        }
    }

    __get_property__ = (name) => {
        if (name instanceof WaveGrassObject) name = name.__value_of__()

        if (isNaN(parseInt(name))) {
            if (['constructor', 'prototype'].includes(name)) return new WaveGrassNull()

            if (this.__properties[name]) return this.__properties[name]

            if (this[name]) {
                return this[name]
            }

            return new WaveGrassNull()
        } else {
            return this.__value[name]
        }
    }

    __iterator__ = () => {
        let index = 0
        let len = this.length.__value_of__()
        return {
            next: () => {
                return { value: this.__value[index] ?? new WaveGrassNull(), index: new WaveGrassNumber(index++), finished: new WaveGrassBoolean(index > len) }
            }
        }
    }

    pop = () => {
        if (this.length.__value_of__() > 0) {
            this.length.__value--

            let value = this.__value[this.length.__value_of__()]
            delete this.__value[this.length.__value_of__()]

            return value
        }
        return new WaveGrassNull()
    }

    push = (...items) => {
        for (let i = 0; i < items.length; i++) {
            this.__value[this.length.__value_of__()] = items[i]
            this.length.__value++
        }
        return this.length
    }
}

class WaveGrassFunction extends WaveGrassObject {
    constructor(name, args, statements, scope, internal = false, belongs_to = null, native = false, native_code = null) {
        super(`[Function ${name}]`)
        this.__type = 'method'

        this.__name = name
        this.__args = args
        this.__statements = statements
        this.__scope = scope
        this.__is_internal = internal
        this.__belongs_to = belongs_to
        this.__native = native
        this.__native_function = native_code
    }

    __string__ = (colored) => colored ? `\x1b[36m[Function ${this.__name__().__value_of__()}]\x1b[0m` : `[Function ${this.__name__().__value_of__()}]`

    __name__ = () => new WaveGrassString(this.__name)

    __get_args__ = () => {
        return this.__args
    }

    __get_statements__ = () => this.__statements

    __internal__ = () => this.__is_internal

    __native__ = () => this.__native

    __native_function__ = () => this.__native_function

    __belongs_to__ = () => this.__belongs_to

    __get_property__ = name => {
        if (name instanceof WaveGrassObject) name = name.__value_of__()

        if (['constructor', 'prototype', '__get_args__', '__get_statements__', '__internal__', '__belongs_to__', '__native__', '__native_function__'].includes(name)) return new WaveGrassNull()

        if (this.__properties[name]) return this.__properties[name]

        if (this[name]) return this[name]

        return new WaveGrassNull()
    }
}

class WaveGrassBoolean extends WaveGrassObject {
    constructor(value) {
        super(value)
        this.__type = 'boolean'
        this.__mutable = false
    }

    __string__ = (colored) => colored ? `\x1b[34m${this.__value_of__().toString()}\x1b[0m` : this.__value_of__().toString()

    __bool__ = () => {
        return this
    }

    __add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(this.__value ? 1 : 0).__add__(rval)
        if (rval.__type__() == 'string') return new WaveGrassString(this.__value_of__().toString()).__add__(rval)
        new WaveGrassError('TypeError', `Cannot add <class ${this.__type__()}> and <class ${rval.__type__()}>`)
    }

    __r_add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(this.__value ? 1 : 0).__add__(rval)
        if (rval.__type__() == 'string') return rval.__add__(new WaveGrassString(this.__value_of__().toString()))
        new WaveGrassError('TypeError', `Cannot add <class ${rval.__type__()}> and <class ${this.__type__()}>`)
    }
}

class WaveGrassError extends WaveGrassObject {
    static trace = []
    static file = ''
    static lines = []

    constructor(title, message, col, line) {
        super(message)
        this.__title = title
        this.__type = 'error'

        this.__col = col
        this.__line = line
    }

    static isError(value) {
        return value.constructor == WaveGrassError
    }

    __title__ = () => this.__title
}

class WaveGrassNull extends WaveGrassObject {
    constructor() {
        super(null)
        this.__type = 'null'
    }

    __bool__ = () => new WaveGrassBoolean(false)

    __add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        if (rval.__type__() == 'string') return new WaveGrassString('null').__add__(rval)
        new WaveGrassError('TypeError', `Cannot add <class ${this.__type__()}> and <class ${rval.__type__()}>`)

    }

    __r_add__ = (rval) => {
        if (rval.__type__() == 'number') return new WaveGrassNumber(0).__add__(rval)
        if (rval.__type__() == 'string') return rval.__add__(new WaveGrassString('null'))
        new WaveGrassError('TypeError', `Cannot add <class ${rval.__type__()}> and <class ${this.__type__()}>`)
    }

    __string__ = (colored) => colored ? `\x1b[34mnull\x1b[0m` : 'null'

    __get_property__ = () => new WaveGrassError('TypeError', 'Cannot get property of null')

    __set_property__ = () => new WaveGrassError('TypeError', 'Cannot set property of null')
}

class WaveGrassModule extends WaveGrassObject {
    constructor(name, variables) {
        super(name)
        this.__name = name
        /**
         * @type { Map<string, WaveGrassObject> }
         */
        this.__variables = new Map(variables)
        this.__type = 'module'
    }

    __string__ = (colored) => colored ? `\x1b[36m[Module ${this.__name}]\x1b[0m` : `[Module ${this.__name}]`

    set = (key, value) => this.__variables.set(key, value)

    __get_property__ = (name) => {
        if (name instanceof WaveGrassObject) name = name.__value_of__()

        if (this.__variables.has(name)) return this.__variables.get(name)

        if (this[name]) {
            return this[name]
        }

        return new WaveGrassNull()
    }

    __set_property__ = () => {
        return new WaveGrassError('TypeError', `Cannot set property of ${this.__type__()}`)
    }
}
const print = new WaveGrassFunction('print', ['*nargs', 'sep', 'end'], '<internal_print>', 'global', true)
const prompt = new WaveGrassFunction('prompt', ['prompt'], '<internal_prompt>', 'global', true)
const parseNum = new WaveGrassFunction('parseNum', ['value', 'base'], '<internal_to_num>', 'global', true)
const _isNaN = new WaveGrassFunction('isNaN', ['value'], '<internal_isNaN>', 'global', true)
const _import = new WaveGrassFunction('isNaN', ['value'], '<internal_import>', 'global', true)
const _importJS = new WaveGrassFunction('isNaN', ['value'], '<internal_importJS>', 'global', true)
const _JSON = new WaveGrassObject()

_JSON.__set_property__('toStr', new WaveGrassFunction('toStr', ['obj', 'indent', 'replace'], '<internal_JSON_str>', 'global', true))


const getClassFromType = (obj) => {
    if (obj == 'number') return WaveGrassNumber
    else if (obj == 'string') return WaveGrassString
    else if (obj == 'array') return WaveGrassArray
    else if (obj == 'method') return WaveGrassFunction
    else if (obj == 'boolean') return WaveGrassBoolean
    return WaveGrassNull
}
const createObject = (type, ...extra) => {
    if (['number', 'string', 'method', 'array', 'boolean', 'null'].includes(type)) {
        let obj = new (getClassFromType(type))(...extra)
        return obj
    } 
}

module.exports = {
    WaveGrassObject, WaveGrassNumber, WaveGrassString,
    WaveGrassArray, WaveGrassBoolean, WaveGrassError,
    WaveGrassFunction, WaveGrassNull, WaveGrassModule,
    createObject,
    print, prompt, parseNum, _isNaN, _import, _importJS, _JSON
}
