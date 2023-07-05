const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground.js');//import model


mongoose.connect('mongodb://localhost:27017/yelp-camp')
.then(()=> {
    console.log('Database Connected')
})
.catch(err => {
    console.log('Connection Error!!!')
    console.log(err);
})


const app = express();

app.set('view engine', 'ejs');
app.set('veiws', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));

app.get('/', (req, res)=> {
    res.render('home')
})

//index
app.get('/campgrounds', async(req, res)=> {
    const campgrounds = await Campground.find({}); //list everthing
    res.render('campgrounds/index', {campgrounds})
})

//add new 
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//add new campground
app.post('/campgrounds', async(req, res)=>{
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
})

//show
app.get('/campgrounds/:id', async(req, res)=> {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
})

//edit
app.get('/campgrounds/:id/edit', async(req, res)=>{
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
})
//edit
app.put('/campgrounds/:id', async(req, res)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`);
})//faking it's a put request

app.delete('/campgrounds/:id', async(req, res)=>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, ()=>{
    console.log('Serving on port 3000.')
})