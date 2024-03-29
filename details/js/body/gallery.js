//IMPORTS

import { windowEvent } from '../land/window.js'
import { map } from '../land/map.js'

//CLASSES & EXPORTS

export class Gallery extends HTMLElement
{
    static NAME = 'gallery'
    static CONTAINER = document.querySelector('#gallery .gallery')
    static AFTER = Array.from(document.querySelectorAll('.after-gallery'))
    static TAGS = ['Tous']
    static IMAGES = Gallery.CONTAINER.querySelectorAll('img')
    static COLUMNS = 3
    static LIGHTBOX = true
    static LIGHTBOXID = null
    static LOADEDIMG = true
    static SHOWTAGS = true
    static TAGSPOSITION = 'bottom'
    static NAVIGATION = true
    static GALLERIES = []
    static RULETAGS = () => {}

    constructor(options)
    {
        super()
    
        this.tag = options.tag
        this.images = options.images
        this.active = options.active

        this.createRowWrapper()
        this.wrapItemInColumn()
    }

    static set(options)
    {
        customElements.define('gallery-area', Gallery)

        map.add(Gallery.NAME, Gallery.AFTER)
        setStaticFields(options)
        clearGallery()
        appendGalleries()
        createLightBox()
        showItemTags()
        setEvents()
        hideOrShow()
    }

    createRowWrapper() { this.className = 'gallery-items-row row position-absolute start-0 w-100' }

    wrapItemInColumn()
    {
        const columns = Gallery.COLUMNS

        if (columns instanceof Number) this.wrap(`col-${Math.ceil(12 / columns)}`)
        else if (columns instanceof Object)
        {
            let columnClasses = ""

            for (const column in columns) columnClasses += getColumnClass(column, columns[column])
            
            this.wrap(columnClasses)
        }
        else { console.error(`Columns should be defined as numbers or objects. ${typeof columns} is not supported.`) }
    }

    wrap(columnClasses)
    {
        this.images.forEach(img =>
        {
            const div = document.createElement('div')
            img = img.cloneNode()

            div.className = `item-column mb-4${columnClasses}`
            div.appendChild(img)
            this.appendChild(div)
        })
    }

    hide()
    {
        this.style.display = 'none'
        this.active = false
    }

    show()
    {
        this.style.display = 'flex'
        this.active = true

        const height = this.offsetHeight + Gallery.CONTAINER.offsetHeight

        map.write(Gallery.NAME, height)
        map.reader() //attention reader doit etre appelé au chargement de la page ce qui est fait ici
        fadeIn(this, 300)
    }
}

//FUNCTIONS

function getOptions() //retourne les options pour le constructor de la Gallery => tag + images + active
{
    const options = [{ tag: 'Tous', images: [], active: true }]

    Gallery.IMAGES.forEach(img =>
    {
        const tag = img.getAttribute('data-gallery-tag'), theTagExists = testOpt(options, tag, img)

        if (!theTagExists) newOpt(options, tag, img)

        options[0].images.push(img)
    })

    return options
}

function testOpt(options, tag, img)
{
    let theTagExists = false

    for (const opt of options)
    {
        if (opt.tag === tag)
        {
            theTagExists = true
            opt.images.push(img)

            break
        }
    }

    return theTagExists
}

function newOpt(options, tag, img)
{
    Gallery.TAGS.push(tag)
    options.push({ tag: tag, images: [img], active: false })
}

function setStaticFields(options)
{
    for (const opt in options)
    {
        switch (opt)
        {
            case 'columns': Gallery.COLUMNS = options[opt]; break
            case 'lightbox': Gallery.LIGHTBOX = options[opt]; break
            case 'lightboxId': Gallery.LIGHTBOXID = options[opt]; break
            case 'showTags': Gallery.SHOWTAGS = options[opt]; break
            case 'tagsPosition': Gallery.TAGSPOSITION = options[opt]; break
            case 'navigation': Gallery.NAVIGATION = options[opt]; break
            default: break
        }
    }

    Gallery.GALLERIES = getAllGallery()
}

function getAllGallery()
{
    const options = getOptions(), galleries = []

    options.forEach(opt => galleries.push(new Gallery(opt)))

    return galleries
}

function getColumnClass(column, value)
{
    value = Math.ceil(12 / value)

    switch (column)
    {
        case 'xs': return ' col-' + value
        case 'sm': return ' col-sm-' + value
        case 'md': return ' col-md-' + value
        case 'lg': return ' col-lg-' + value
        case 'xl': return ' col-xl-' + value
        default: return 'error-column-parameter'
    }
}

function clearGallery() { Gallery.CONTAINER.innerHTML = '' }

function showItemTags()
{
    if (!Gallery.SHOWTAGS) return

    const bottomPosition = Gallery.TAGSPOSITION === 'bottom'
    let tagItems = ''

    Gallery.TAGS.forEach(tag => tagItems += `<li class="nav-item"><span class="nav-link ${tag === 'Tous' ? 'active-tag' : ''}"  data-images-toggle="${tag}">${tag}</span></li>`) //suppression de 'active' class
  
    Gallery.CONTAINER.insertAdjacentHTML(bottomPosition ? 'beforeend' : 'afterbegin', `<ul class="my-4 tags-bar nav nav-pills ${bottomPosition ? 'after-gallery' : ''}">${tagItems}</ul>`)

    if (bottomPosition) appendRules()
}

function appendRules()
{
    document.querySelector('#gallery>.container').style.marginBottom = '80px'
    Gallery.CONTAINER.style.height = 0
    Gallery.RULETAGS = (top) => { window.scrollTo({ top: top, left: 0, behavior: 'smooth' })}

    Gallery.AFTER.push(Gallery.CONTAINER.querySelector('.tags-bar'))
}

function appendGalleries() { Gallery.GALLERIES.forEach(glr => Gallery.CONTAINER.appendChild(glr)) }

function createLightBox()
{
    document.querySelector('body').insertAdjacentHTML('beforeend', // Ajout sur le body plutot que dans la gallery pour eviter problemes avec transform avec class "after-slider"
    `
    <div class="modal fade" id="${Gallery.LIGHTBOXID ? Gallery.LIGHTBOXID : "galleryLightbox"}" tabindex="-1" role="dialog" aria-hidden="true">
        <div>
            <div class="modal-dialog" role="document">
                ${
                    Gallery.NAVIGATION
                    ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                    : '<span style="display:none;" />'
                }
                <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique" width="498" height="498"/>
                ${
                    Gallery.NAVIGATION
                    ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                    : '<span style="display:none;" />'
                }
            </div>
        </div>
    </div>
    `)
}

function setEvents()
{
    const container = Gallery.CONTAINER

    windowEvent.add(() => map.write(Gallery.NAME, getActiveGallery().offsetHeight + Gallery.CONTAINER.offsetHeight))

    container.querySelectorAll('.gallery-item').forEach(item => item.addEventListener('click', openLightBox))

    container.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', filterByTag))

    document.querySelector('.mg-prev').addEventListener('click', () => updateImage(false))
    document.querySelector('.mg-next').addEventListener('click', () => updateImage(true))

    document.querySelector('.lightboxImage').addEventListener('load', () => Gallery.LOADEDIMG = true)
}

function openLightBox()
{
    if (!Gallery.LIGHTBOX || this.tagName !== "IMG") return

    const modal = document.querySelector('#' + Gallery.LIGHTBOXID)
    
    modal.querySelector('.lightboxImage').setAttribute('src', this.getAttribute('src'))

    updateModal.call(modal)
    modal.addEventListener('click', updateModal)
}

function updateModal(e)
{
    const body = document.querySelector('body'), show = this.classList.contains('show')

    if (show) { if (e.target.className.includes('modal')) body.style.overflow = 'auto', body.style.paddingRight = 0, this.style.display = 'none', this.classList.remove('show'), this.removeEventListener('click', updateModal) }
    else { body.style.paddingRight = (window.innerWidth - body.clientWidth) + 'px', body.style.overflow = 'hidden', this.classList.add('show'), this.style.display = 'flex', fadeIn(this, 300) }
}

function filterByTag()
{
    if (this.classList.contains('active-tag')) return

    const tag = this.getAttribute('data-images-toggle'), currentGallery = getActiveGallery(), newGallery = getNewGallery(tag), top = document.getElementById('gallery').offsetTop

    Gallery.CONTAINER.querySelector('.active-tag').classList.remove('active-tag')
    this.classList.add('active-tag')

    Gallery.RULETAGS(top)
    currentGallery.hide()
    newGallery.show()
}

function getActiveGallery() { for (const glr of Gallery.GALLERIES) if (glr.active) return glr }

function getNewGallery(tag) { for (const glr of Gallery.GALLERIES) if (glr.tag === tag) return glr }

function updateImage(next)
{
    if (!Gallery.LOADEDIMG) return

    const images = getActiveGallery().images, currentImage = document.querySelector('.lightboxImage'), currentSrc = currentImage.getAttribute('src')
    let preSrc = null

    for (let i = next ? images.length-1 : 0; next ? i >= 0 : i < images.length; next ? i-- : i++)
    {
        const src = images[i].getAttribute('src')
    
        if (src === currentSrc) break

        preSrc = src
    }

    Gallery.LOADEDIMG = false
    currentImage.setAttribute('src', preSrc ? preSrc : (next ? images[0] : images[images.length-1]).getAttribute('src'))
}

function hideOrShow() { Gallery.GALLERIES.forEach(g => g.active ? g.show() : g.hide()) }

function fadeIn(container, delay)
{
    let scale = 10 / delay, count = 0

    container.style.opacity = 0
    container.style.transform = 'scale(0, 0)'

    const interval = setInterval(() =>
    {
        count += scale
        count = count > 1 ? 1 : count

        container.style.opacity = count
        container.style.transform = `scale(${count + ', ' + count})`

        if (count >= 1) clearInterval(interval)
    }, 10)
}