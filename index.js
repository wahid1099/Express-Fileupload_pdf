const express = require("express");

const path = require("path");
const app = express();
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const fileUpload = require("express-fileupload");

//middlewares
app.use(cors());
app.use(express.json());
app.use(fileUpload());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.byzxg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
//connecting database
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  console.log("data received");
  const pdfCollection = client.db("Pdfs").collection("ExpressPDfs");
  app.post("/pdfUpload", async (req, res) => {
    console.log(req.body);
    try {
      if (!req.files) {
        res.send({
          status: false,
          message: "No file uploaded",
        });
      } else {
        //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
        let pdf = req.files.pdf;

        //Use the mv() method to place the file in upload directory (i.e. "uploads")
        pdf.mv("./uploads/" + pdf.name);
        const PdfUploadpath = "/uploads/" + pdf.name;
        const result = await pdfCollection.insertOne({
          PdfUploadpath: PdfUploadpath,
        });

        //send response
        res.send({
          status: true,
          message: "File is uploaded",
          data: {
            name: pdf.name,
            mimetype: pdf.mimetype,
            size: pdf.size,
            path: PdfUploadpath,
          },
        });
      }
    } catch (err) {
      res.status(500).send(err);
    }
  });
});

app.get("/pdfupload", (req, res) => {
  console.log("hi");
});

app.listen(8000, () => {
  console.log("app listening at port 8000 for express file upload");
});
