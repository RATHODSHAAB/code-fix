import express from "express";
import cors from "cors";
import rootRouter from "./routes/index";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.json()); // Parses incoming JSON
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies

app.use("/api/v1", rootRouter);

app.listen(3000, () => console.log("Listening on :3000"));