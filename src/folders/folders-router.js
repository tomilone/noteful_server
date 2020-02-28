const express = require('express');
const FoldersService = require('./folders-service');

const FoldersRouter = express.Router();
const bodyParser = express.json();

const serializeFolder = folder => ({
    id: folder.id,
    name: folder.name
})


FoldersRouter
    .route('/folders')
    .get((req, res,next) => {
        FoldersService.getAllFolders(req.app.get('db'))
            .then(folders => {
                res.json(folders.map(serializeFolder))
        })
        .catch(next)
    })
    .post(bodyParser, (req,res,next) => {
        for(const field of ['name']){
            if(!req.body[field]){
                logger.error(`${field} is required`)
                return res.status(400).send({
                    error: { message: `${field} is required`}
                })
            }
        }
        const { name } = req.body
        const newFolder = { name }

        FoldersService.insertFolders(
            req.app.get('db'),
            newFolder
        )
        .then(folder => {
            logger.info(`Folder with id ${folder.id} has been created!`)
            res 
            .status(201)
            .location(`/folders/${folder.id}`)
            .json(serializeFolder(folder))
        })
        .catch(next)
    })

    FoldersRouter
        .route('/folders/:id')
        .all((req,res,next) => {
            const { id } = req.params
            FoldersService.getById(req.app.get('db'), id)
                .then(folder =>{
                    if(!folder){
                        logger.error(`Folder with id ${id} not found!`)
                        return res.status(404).json({
                            error: { message: `Folder with id ${id} not found`}
                        })
                    }
                    res.folder = folder
                    next()
                })
                .catch(next)
        })
        .get((req,res) => {
            res.json(serializeFolder(res.folder))
        })
        .delete((req, res, next) => {
            const { id } = req.params
            FoldersService.deleteFolders(req.app.get('db'), id)
                .then(numRowsAffected => {
                    logger.info(` Folder with id ${id} has been deleted!`)
                    res.status(204).end()
                })
                .catch(next)
        })
        .patch(bodyParser, (req, res, next) => {
          const { name } = req.body
          const foldersToUpdate = { name }

          const numberOfValues = Object.numberOfValues(foldersToUpdate).filter(Boolean).length
          if (numberOfValues === 0) {
            return res.status(400).json({
              error: {
                message: `Request body must contain a name`
              }
            })
          }

          FoldersService.updateFolders(
            req.app.get('db'),
            req.params.id,
            foldersToUpdate
          )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
        })

module.exports = FoldersRouter