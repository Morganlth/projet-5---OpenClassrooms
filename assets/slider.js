/*
? slider.js permet d'eviter les "mauvaises dimensions des images du slider grace aux tailles prédéfinit"
*/

//IMPORTS

import { windowEvent } from './window.js'
import { map } from './map.js'

//EXPORT

export const slider = {
    set: () =>
    {
        map.add(NAME, Array.from(document.querySelectorAll('.after-slider')))

        slide.style.opacity = '1'
    
        setEvent()
        updateSlider()
    }
}

//CONSTANTES

const NAME = 'slider', slide = document.querySelector('.carousel-inner'), carouselItems = Array.from(slide.querySelectorAll('.carousel-item')),
      nav = document.querySelector('.carousel-indicators'), prev = slide.querySelector('.carousel-control-prev'), next = slide.querySelector('.carousel-control-next')

//FUNCTIONS

function setEvent() { windowEvent.add(updateSlider) }

function updateSlider()
{
    const img = carouselItems.find(i => i.classList.contains('active')).firstElementChild, height = img.naturalHeight, width = img.naturalWidth

    resize(width)
    transformY(height)
    map.write(NAME, height)
}

function resize(width)
{
    carouselItems.forEach(i =>
    {
        const img = i.firstElementChild

        img.style.width = width + 'px'
        img.style.transform = `translateX(${(slide.offsetWidth - width)/2}px)`
    })
}

function transformY(height)
{
    const reduce = -slide.offsetHeight + height, full = `translateY(${reduce}px)`, demi = `translateY(${reduce/2}px)`

    nav.style.transform = full
    prev.style.transform = demi
    next.style.transform = demi
}