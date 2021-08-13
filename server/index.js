// git rm --cached submodule-name
import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/MeDocs", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});