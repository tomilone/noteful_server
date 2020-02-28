const express = require('express');
const NotesService = require('./notes-service');

const NotesRouter = express.Router();
const bodyParser = express.json();

const serializeNote = note => ({
    id: note.id,
    name: note.name,
    date_modified: note.date_modified,
    folder_id: note.folder_id,
    content: note.content
})


NotesRouter
    .route('/notes')
    .get((req, res,next) => {
        NotesService.getAllNotes(req.app.get('db'))
            .then(notes => {
                res.json(notes.map(serializeNote))
        })
        .catch(next)
    })
    .post(bodyParser, (req,res,next) => {
        for(const field of ['name', 'content']){
            if(!req.body[field]){
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `${field} is required`}
                })
            }
        }
        const { name, content } = req.body
        const newNote = { name, content }

        NotesService.insertNotes(
            req.app.get('db'),
            newNote
        )
        .then(note => {
            logger.info(`note with id ${note.id} has been created!`)
            res 
            .status(201)
            .location(`/notes/${note.id}`)
            .json(serializeNote(note))
        })
        .catch(next)
    })

    NotesRouter
        .route('/notes/:id')
        .all((req,res,next) => {
            const { id } = req.params
            NotesService.getById(req.app.get('db'), id)
                .then(note =>{
                    if(!note){
                        logger.error(`note with id ${id} not found!`)
                        return res.status(404).json({
                            error: { message: `note with id ${id} not found`}
                        })
                    }
                    res.note = note
                    next()
                })
                .catch(next)
        })
        .get((req,res) => {
            res.json(serializeNote(res.note))
        })
        .delete((req, res, next) => {
            const { id } = req.params
            NotesService.deleteNotes(req.app.get('db'), id)
                .then(numRowsAffected => {
                    logger.info(` note with id ${id} has been deleted!`)
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch(bodyParser, (req, res, next) => {
          const { name } = req.body
          const notesToUpdate = { name }

          const numberOfValues = Object.numberOfValues(notesToUpdate).filter(Boolean).length
          if (numberOfValues === 0) {
            return res.status(400).json({
              error: {
                message: `Request body must contain a name`
              }
            })
          }

          NotesService.updateNotes(
            req.app.get('db'),
            req.params.id,
            notesToUpdate
          )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
        })

module.exports = NotesRouter