const cleanRut = (rut) => {
    var replace1 = rut.split('.').join('');
    var replace2 = replace1.replace('-', '');
    return replace2;
}

const ktoK = (rut) => {
    let replace1 = rut.replace('k', 'K');
    return replace1
}

const removePoints = (amount) => {
    var replace = amount.split('.').join('');
    return replace;
}

export { ktoK, cleanRut, removePoints }