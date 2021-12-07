///////////////////////////// constants //////////////////////////////
const STEPS_ON_SLIDER = 100

///////////////////////////// data ///////////////////////////////////
let data = null // After initialization, this will not change
// Active factor can be changed by the dropdown
let active_factor = null
// Filter values can be changed by the sliders
let filterValues = {}

const initUI = () => {
    // use function(event){} syntax so that this has the correct binding
    $('.dropdown-content>a').click(function(event){
        event.preventDefault()
        active_factor = this.id
        colorMap()
    })

    // create sliders
    Object.keys(filterValues).forEach(factor => {
        $('#slider-container').append('<p>' + textMap[factor] + '</p>')
        const id = factor + '-slider'
        const input = document.createElement('input')
        input.id = id
        $('#slider-container').append(input)
        createSlider(factor, 
            Math.floor((filterValues[factor].min + Number.EPSILON) * 100) / 100,
            Math.ceil((filterValues[factor].max + Number.EPSILON) * 100) / 100
        )
    })
}

const createSlider = (factor, min, max) => {
    new rSlider({
        target: factor + '-slider',
        values: {min, max},
        step: (max - min) / STEPS_ON_SLIDER,
        range: true,
        tooltip: false,
        scale: false,
        labels: false,
        set: [min, max],
        onChange: (values) => {
            const split = values.split(',')
            filterValues[factor].min = split[0]
            filterValues[factor].max = split[1]
            console.log(split[0])
            console.log(split[1])
            colorMap()
        }
    })
}

const filterData = () => data.filter(entry => {
    return Object.keys(filterValues).every(key => {
        const min = filterValues[key].min
        const max = filterValues[key].max
        return !(isNaN(min) || isNaN(min)) ? min <= entry[key] && entry[key] <= max : true
    })
})

const colorMap = () => {
    // Compute color scale for current factor
    const colorScale = d3.scaleSequential()
        .domain([filterValues[active_factor].min, filterValues[active_factor].max])
        .interpolator(d3.interpolateBlues)
    
    $('#legend').empty()
    // legend is defined in ./static/legend.js
    // textMap is defined in ./static/maps.js
    legend({color: colorScale, title: textMap[active_factor]})

    const filteredData = filterData()
    $('path').css('fill', '#ececec')

    filteredData.forEach(entry => {
        $(`path[name="${entry.country}"]`).css('fill', colorScale(entry[active_factor]))
    })
}

const init = d3.json('./api/data').then((d) => {
    // initialize globals based on loaded data
    data = d
    active_factor = "happiness"
    const factors = Object.keys(data[0])
    factors.forEach(factor => {
        if (factor !== "country"){
            vals = data.map(entry => entry[factor])

            filterValues[factor] = {
                min: Math.min(...vals),
                max: Math.max(...vals)
            }
        }
    })

    colorMap()
    initUI()
})

$(init)