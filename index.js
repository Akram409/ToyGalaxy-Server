const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6nxonq0.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const database = client.db("toyGalaxy");
    const allToysCollection = database.collection("AllToys");
    const galleryCollection = database.collection("gallery");
    const categoryCollection = database.collection("ShopByCategory");

    // Searching Indexing
    const indexKeys = { name: 1, seller: 1 };
    const indexOptions = { name: "toySeller" };
    const result = await allToysCollection.createIndex(indexKeys, indexOptions);
    console.log(result);

    // AllToy Collection
    app.get("/allToys", async (req, res) => {
      const page = parseInt(req.query.page || 0);
      const limit = parseInt(req.query.limit || 20);
      const skip = page * limit;
      const result = await allToysCollection
        .find()
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    app.get("/totalToys", async (req, res) => {
      const result = await allToysCollection.estimatedDocumentCount();
      res.send({ totalToys: result });
    });

    app.get("/allToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await allToysCollection.findOne(query);
      res.send(result);
    });

    app.get("/searchToyByToySeller/:text", async (req, res) => {
      const text = req.params.text;
      const query = {
        $or: [
          { name: { $regex: text, $options: "i" } },
          { seller: { $regex: text, $options: "i" } },
        ],
      };
      const result = await allToysCollection.find(query).toArray();
      res.send(result);
    });

    // Gallery Collection
    app.get("/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });

    // ShopByCategory Collection
    app.get("/shopByCategory/:name", async (req, res) => {
      const name = req.params.name;
      const query = { category_name: name };
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, (req, res) => {
  console.log(`Server is running at port: ${port}`);
});
