const roundDown = value => {
    return Math.floor((value + Number.EPSILON) * 100) / 100
}

const roundUp = value => {
    return Math.ceil((value + Number.EPSILON) * 100) / 100
}