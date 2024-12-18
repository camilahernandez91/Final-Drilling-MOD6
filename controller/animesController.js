import { AnimesModel } from '../model/animesModel.js'
import * as url from "node:url"

export const animesController = async (req, res, payloadBruto, urlparts) => {
    const queryParams = url.parse(req.url, true);
    /**
     * LISTAR TODOS LOS ANIMÉS
     * (api/animes)
     */
    if (req.method == 'GET' && !urlparts[2] && !queryParams.search) {
        try {
            let animes = await AnimesModel.getAll()
            res.writeHead(200, 'OK', { "content-type": "application/json" })
            return res.end(JSON.stringify(animes))
        } catch (err) {
            res.writeHead(500, 'Internal Server Error', { "content-type": "application/json" })
            return res.end(JSON.stringify({ message: err.message }))
        }
    }
    /**
     * LISTAR ANIMÉS por queryString
     * (api/animes?nombre=anime)
     */
    else if (req.method == 'GET' && !urlparts[2] && queryParams.search) {
        const { nombre } = queryParams.query;
        const animes = await AnimesModel.getAll()
        let ids = Object.keys(animes)
        for (let id of ids) {
            let anime = animes[id]
            if (!anime.nombre.toLowerCase().includes(nombre.toLocaleLowerCase())) {
                delete animes[id]
            }
        }
        let remainingKeys = Object.keys(animes)
        if (remainingKeys.length == 0) {
            res.writeHead(404, 'Not Found', { "content-type": "application/json" })
            return res.end(JSON.stringify({ message: 'Animé no encontrado' }))
        } else {
            res.writeHead(200, 'OK', { "content-type": "application/json" })
            return res.end(JSON.stringify(animes))
        }
    }
    /**
     * LISTAR ANIMÉS por ID
     * (api/animes/id)
     */
    else if (req.method == 'GET' && urlparts[2] && urlparts.length <= 3) {
        let anime = await AnimesModel.getById(urlparts[2])
        if (anime) {
            res.writeHead(200, 'OK', { "content-type": "application/json" })
            res.end(JSON.stringify(anime))
        } else {
            res.writeHead(404, 'Not Found', { "content-type": "application/json" })
            res.end(JSON.stringify({ message: 'Animé no encontrado' }))
        }
    }
    /**
     * CREAR ANIMÉ
     * (api/animes)
     */
    else if (req.method == 'POST' && !urlparts[2]) {
        try {
            let data = JSON.parse(payloadBruto)
            let animes = await AnimesModel.getAll()
            const ids = Object.keys(animes).map(id => parseInt(id, 10)).filter(Number.isInteger)
            const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 1
            animes[nextId] = data
            let status = await AnimesModel.createAndUpdateAnime(animes)
            if (status) {
                res.writeHead(201, 'Created', { "content-type": "application/json" })
                res.end(JSON.stringify({ message: 'Animé Creado' }))
            } else {
                res.writeHead(500, 'Internal Server Error', { "content-type": "application/json" })
                res.end(JSON.stringify({ message: 'Error interno al crear animé' }))
            }
        } catch (err) {
            res.writeHead(400, 'Bad Request', { "content-type": "application/json" })
            res.end(JSON.stringify({ message: 'Solicitud mal hecha' }))
        }
    }
    /**
     * ACTUALIZAR ANIMÉ
     * (api/animes/id)
     */
    else if (req.method == 'PUT' && urlparts[2]) {
        try {
            let animes = await AnimesModel.getAll()
            let anime = await AnimesModel.getById(urlparts[2])
            if (anime) {
                try {
                    let payload = JSON.parse(payloadBruto)
                    anime = { ...anime, ...payload }
                    animes[urlparts[2]] = anime
                    await AnimesModel.createAndUpdateAnime(animes)
                    res.writeHead(200, 'OK', { "content-type": "application/json" })
                    return res.end(JSON.stringify({ message: 'updated', anime }))
                } catch (err) {
                    res.writeHead(400, 'Bad Request', { "content-type": "application/json" })
                    return res.end(JSON.stringify({ message: 'Payload mal formado' }))
                }
            } else {
                res.writeHead(404, 'Not Found', { "content-type": "application/json" })
                return res.end(JSON.stringify({ message: 'Animé no encontrado' }))
            }
        } catch (err) {
            res.writeHead(500, 'Internal Server Error', { "content-type": "application/json" })
            return res.end(JSON.stringify({ message: 'Error interno de servidor' }))
        }
    }
    /**
     * ELIMINAR ANIMÉ
     * (api/animes/id)
     */
    else if (req.method == 'DELETE' && urlparts[2]) {
        let animes = await AnimesModel.getAll()
        let ids = Object.keys(animes)
        if (ids.includes(urlparts[2])) {
            delete animes[urlparts[2]]
            await AnimesModel.createAndUpdateAnime(animes)
            res.writeHead(200, 'OK', { "content-type": "application/json" })
            return res.end((JSON.stringify({ message: "Animé eliminado con éxito" })))
        } else {
            res.writeHead(404, 'Not Found', { "content-type": "application/json" })
            return res.end(JSON.stringify({ message: "Animé no encontrado" }))
        }
    }
}