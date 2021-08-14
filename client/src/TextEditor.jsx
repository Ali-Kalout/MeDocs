import React, { useCallback, useEffect, useState } from 'react';
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
];

const TextEditor = () => {
    const { id } = useParams();
    const [socket, setSocket] = useState();
    const [quill, setQuill] = useState();

    useEffect(() => {
        if (!socket || !quill) return;
        socket.once('load-document', doc => {
            quill.setContents(doc);
            quill.enable();
        });
        socket.emit('get-document', id);
    }, [socket, quill, id]);

    useEffect(() => {
        if (!socket || !quill) return;
        const interval = setInterval(() => {
            socket.emit('save', quill.getContents());
        }, 2000);
        return () => clearInterval(interval);
    }, [quill, socket]);

    useEffect(() => {
        const s = io("http://localhost:3001");
        setSocket(s);
        return () => s.disconnect();
    }, []);

    useEffect(() => {
        if (!socket || !quill) return;
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit('send-changes', delta);
        };
        quill.on('text-change', handler);
        return () => quill.off('text-change', handler)
    }, [quill, socket]);

    useEffect(() => {
        if (!socket || !quill) return;
        const handler = delta => quill.updateContents(delta);
        socket.on('receive-changes', handler);
        return () => socket.off('receive-changes', handler)
    }, [quill, socket]);

    const wrapperRef = useCallback(wrapper => {
        if (!wrapper) return;
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS }
        });
        q.disable();
        q.setText("Loading...");
        setQuill(q);
    }, []);

    return (
        <div className="container" ref={wrapperRef}></div>
    );
}

export default TextEditor;