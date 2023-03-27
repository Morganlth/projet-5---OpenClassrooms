//IMPORTS

import { map } from './map.js'

//EXPORTS

export const windowEvent = { add: callBack => STACK.push(callBack) }

//CONSTANTES

const STACK = []

//FUNCTIONS

function debounce()
{
    let timer

    return () =>
    {
        clearTimeout(timer)
        timer = setTimeout(() =>
        {
            STACK.forEach(s => s())

            map.reader()
        }, 150)
    }
}

//CODE

window.addEventListener('resize', debounce())