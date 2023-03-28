//EXPORTS

export const map = {
    add: (name, elements) =>
    {
        const allElements = STACK.map(s => s.element), pusher = { name: name, add: 0 }

        elements.forEach(e => allElements.includes(e) ? STACK.find(s => s.element === e).pushers.push(pusher) : STACK.push({ element: e, pushers: [pusher] }))
    }
,
    write: (name, add) =>
    {
        for (const s of STACK)
        {
            for (const pusher of s.pushers) if (pusher.name === name) pusher.add = add ?? pusher.add
        }
    }
,
    reader: () =>
    {
        const body = document.querySelector('body')

        STACK.forEach(s =>
        {
            const height = s.pushers.reduce((accumulator, pusher) => accumulator + pusher.add, 0)

            s.element.style.transform = `translateY(${height}px)`
        })

        body.style.height = 'auto', body.style.height = body.scrollHeight + 'px'
    }
}

//CONSTANTES

const STACK = []