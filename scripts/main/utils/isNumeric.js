const isNumeric = (str) => {
    if (typeof str !== "string") return false
    return !isNaN(str) && !isNaN(parseFloat(str))
}

module.exports = isNumeric
