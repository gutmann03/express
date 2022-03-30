module.exports = function(req, res, next){
    res.status(200).render('404', {
        title: "Page doesn't found"
    })
}