// Sketch routes
const
    express = require('express'),
    sketchRouter = new express.Router(),
    Sketch = require('../models/Sketch.js')


// Get all sketches
sketchRouter.get('/sketches', (req, res) => {
    Sketch.find({}).populate('_by').exec((err, allSketches) => {
        if(err) return console.log(err)

        res.render('sketches_views/explore', {sketches: allSketches})
    })
})

// Form to create new sketch
sketchRouter.get('/sketches/new', (req, res) => {
    if (req.user) {
        res.render('canvas', { message: req.flash('newSketchMessage')})
    } else
        res.redirect('/')  
})

// Create new sketch
sketchRouter.post('/sketches', (req, res) => {
    console.log("Incoming image YAYYY!")
    var newSketch = new Sketch(req.body)
    newSketch._by = req.user 
    newSketch.save((err,newSketch)=>{
        if(err) {
            if(err.name == "ValidationError") {
                req.flash('newSketchMessage', 'Fill out all the fields, please')
                res.redirect('/sketches/new')
            }
        } else {
            res.render('sketches_views/showsketches', {title: "New sketch!", user: req.user, sketch: newSketch})
        }
    })
})

// Get specific sketch
sketchRouter.get('/sketches/:id', (req, res) => {
    Sketch.findById(req.params.id).populate('_by').exec((err, thatSketch) => {
        if(err) return console.log(err)
        //res.json(thatSketch)
        res.render('sketches_views/showsketches', {title: "This sketch", user: req.user, sketch:thatSketch})
    })
})
// Get edit sketch view
sketchRouter.get('/sketches/:id/edit', (req, res)=>{
    Sketch.findById(req.params.id, (err, sketch)=>{
        if(err) return console.log(err)
        if((req.user.id) == (sketch._by)) {
            console.log('You own this sketch!')
            res.render('sketches_views/editsketch', { sketch:sketch, user: req.user})
        } else {
            res.redirect('/sketches/' + req.params.id)
            //add flash message here
        }
        })   
})

// update sketch
sketchRouter.patch('/sketches/:id/edit', (req, res)=>{
    console.log(req.body)
   Sketch.findById(req.params.id, (err,updatedSketch)=>{
       if(err) console.log(err)
       const updatedSketchData = {}
       for(field in req.body) {
           if(req.body[field] != "") updatedSketchData[field] = req.body[field]
       }
       Object.assign(updatedSketch, updatedSketchData)
       updatedSketch.save((err,savedSketch)=>{
           if(err) return console.log(err)
           console.log(savedSketch)
           res.redirect('/sketches/'+ req.params.id)
       })
   })
    
})

// Delete a specific sketch
sketchRouter.delete('/sketches/:id', (req, res) => {
    Sketch.findByIdAndRemove(req.params.id, (err, deletedSketch) => {
        if(err) return console.log(err)
        res.redirect('/sketches')
       
    })

    
})



module.exports = sketchRouter