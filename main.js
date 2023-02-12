// db ////////////////////////////////////////////////////////////////
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// open db
const db = await open({
    filename: "./db.sqlite",
    driver: sqlite3.Database
})

// functions db
const createTable = async (tableName)=>{
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY, name TEXT)`
    await db.run(sql)
}

const postImage = async (tableName, id, path)=>{
    await createTable (tableName)
    const sql = `INSERT OR REPLACE INTO ${tableName} (id, name) VALUES (?, ?)`
    const params = [id, path]
    await db.run(sql, params)
    return {id, path}
}

const getImages = async (tableName)=>{
    await createTable (tableName)
    const sql = `SELECT * FROM ${tableName}`
    const params = []
    return await db.all(sql, params)
}

const getImage = async (tableName, id)=>{
    await createTable (tableName)
    const sql = `SELECT * FROM ${tableName} WHERE id=?`
    const params = [id]
    return await db.get(sql, params)
    
}

const deleteImage = async (tableName, id)=>{
    await createTable (tableName)
    const sql = `DELETE FROM ${tableName} WHERE id=?`
    const params = [id]
    await db.get(sql, params)
    return {id}
}


// express //////////////////////////////////////////////////
import express from "express"
const PORT = 3000 | process.PORT
const app = express()

import multer from "multer";
import moment from "moment";
import path from "node:path";
const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, "./public/uploads")
    },
    filename: (req, file, cb)=>{
        const ext = path.extname(file.originalname)
        moment.locale('pt-br')
        cb(null, `${moment().format("YYYY-MM-DD_HHmmss")}${ext}`)
    }
})
const upload = multer({storage: storage})

// middlewares
app.use(express.static("./public"))
app.use(express.json())
app.set("json spaces", 2)

// routes
app.get("/api/status", (req, res)=> res.json({msg: "API is running"}))
app.get("/api/images", async (req, res)=> res.json(await getImages("images")))
app.get("/api/images/:id", async (req, res)=> res.json(await getImage("images", req.params.id)))
app.post("/api/images", async (req, res)=> res.json(await postImage("images", req.body.id, req.body.path)))
app.delete("/api/images/:id", async (req, res)=> res.json(await deleteImage("images", req.params.id)))
app.post("/api/upload", upload.single("image"), async (req, res)=>{
    const id_img = await req.body.id
    const path_img = req.file.path.substring(7)
    await postImage("images", id_img, path_img)
    res.json({id: id_img, path: path_img})
})

// server listening
app.listen(PORT, ()=>console.log(`Server Listening on PORT ${PORT}`))

