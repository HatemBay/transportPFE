const access = (permissions) => {
    return (req, res, next) => {
        const role = req.body.role;
        if (permissions.includes(role)) {
            next();
        } else {
            console.log("you don't have permission!");
            return res.status(401).json("you don't have permission!");
        }        
    }
}

module.exports = { access };
