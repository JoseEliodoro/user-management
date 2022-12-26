module.exports = {
    user: (app, req, res)=>{
        req.assert('name', 'O nome é obrigatório.').notEmpty();
        req.assert('email', 'O nome está inválido.').notEmpty().isEmail();
        
        let erros = req.validationErrors();

        if (erros) {
            app.utils.error.send(erros, req, res);
            return false;
        } 

        return true;
    }
};