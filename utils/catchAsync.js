// returns a func that accepts and executes another func 
module.exports = func => {
    return(req, res, next) => {
        // catch any errors returned by executed function and pass them to next
        func(req, res, next).catch(next)
    }
}