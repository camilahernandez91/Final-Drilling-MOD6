import {
    createFile,
    deleteFile,
    updateFile,
    readFile,
    fileExists,
    listAll,
} from "../lib/data.js"

export class AnimesModel {
    static folder = '.data/'
    static fileName = 'animes.json'
    static async getAll() {
        let animes = await readFile(AnimesModel.folder, AnimesModel.fileName)
        return animes
    }
    static async getById(id) {
        let animes = await AnimesModel.getAll()
        return animes[id]
    }
    static async createAndUpdateAnime(animes) {
        try {
            await updateFile(AnimesModel.folder, AnimesModel.fileName, animes)
            return true
        } catch (error) {
            console.error(error)
            return false
        }
    }
}