
/**
 * 
 * @param { { [object: string]: any } } obj 
 */
const wrap = (obj) => {
    for(const i in obj) {
        console.log('here')
    }
}

module.exports = wrap