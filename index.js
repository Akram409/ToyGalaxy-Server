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
    // await client.connect();

    const database = client.db("toyGalaxy");
    const allToysCollection = database.collection("AllToys");

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

   app.get("/shopByCategory/:name", async (req, res) => {
      const name = req.params.name;
      const limit = parseInt(req.query.limit || 4);
      const query = { category_name: name };
      const result = await allToysCollection.find(query).limit(limit).toArray();
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
      const limit = parseInt(req.query.limit || 4);
      const result = await allToysCollection.find().limit(limit).toArray();
      res.send(result);
    });

    app.post('/addToys',async(req,res) =>{
      const item = req.body
      const result = await allToysCollection.insertOne(item)
      res.send(result)
    })

    app.get("/myToys/:text", async(req, res) => {
      const text = req.params.text;
      const query = { seller_email: text };
      const page = parseInt(req.query.page || 0);
      const limit = parseInt(req.query.limit || 10);
      const skip = page * limit;
      const sortField = req.query.sortField || "price";
      const sortOrder = req.query.sortOrder || "asc";
      const sortOptions = {};
      sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;

      const totalCount = await allToysCollection.countDocuments(query);
      const result = await allToysCollection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .toArray();
        result.forEach((item) => {
          const price = item.price.replace("$", "");
          item.price = parseFloat(price);
        });
        res.send({ totalToys: totalCount, toys: result });
    });

    app.put('/updateToys/:id' , async(req,res) =>{
      const id = req.params.id
      const user = req.body

      const filter = {_id : new ObjectId(id)}
      const options = { upsert: true };
      const updateToy ={
        $set : {
          img: user.img,
          name : user.name,
          price: user.price,
          rating: user.rating,
          seller: user.seller,
          seller_email: user.seller_email,
          description: user.description,
          quantity: user.quantity
        }
      }
      const result = await allToysCollection.updateOne(filter,updateToy,options)
      res.send(result)
    })

    app.delete('/deleteToy/:id' , async(req,res) =>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await allToysCollection.deleteOne(query)
      res.send(result)
    })

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
