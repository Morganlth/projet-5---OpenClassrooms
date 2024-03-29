//IMPORTS

import { slider } from './body/slider.js'
import { Gallery } from './body/gallery.js'

//CONSTANTES

set()

function set()
{
    slider.set()

    Gallery.set(
        {
            columns: {
                xs: 1,
                sm: 2,
                md: 3,
                lg: 3,
                xl: 3
            },
            lightBox: true,
            lightboxId: 'myAwesomeLightbox',
            showTags: true,
            tagsPosition: 'top'
        }
    )
}