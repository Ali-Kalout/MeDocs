// git rm --cached submodule-name
import express from "express";
import mongoose from "mongoose";
import { createServer } from 'http';
import { Server } from 'socket.io';

import Document from "./models/document.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

mongoose.connect("mongodb://localhost:27017/MeDocs", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => httpServer.listen(3001, () => console.log("Server running !")));

io.on('connection', socket => {
    console.log("connected " + socket.id);
    socket.on('get-document', async (id) => {
        const data = await findOrCreateDoc(id);
        socket.join(id);
        socket.emit('load-document', data.data);
        socket.on('send-changes', delta => {
            socket.broadcast.to(id).emit('receive-changes', delta);
        });
        socket.on('save', async (data) => await Document.findByIdAndUpdate(id, { data }));
    });
});

const findOrCreateDoc = async (id) => {
    if (!id) return;
    const doc = await Document.findById(id);
    if (doc) return doc;
    const newDoc = new Document({ _id: id, data: '' });
    await newDoc.save();
    return newDoc;
};