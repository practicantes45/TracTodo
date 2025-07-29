function mensajes(status, mensajeUsuario, mensajeOriginal = "", token = "") {
    return {
        status,
        mensajeUsuario,
        mensajeOriginal,
        token
    };
}

module.exports = {
    mensajes
};
