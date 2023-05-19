const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())

// ToyGalaxy
// TdvaTcXd3wtY3VjX

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://ToyGalaxy:TdvaTcXd3wtY3VjX@cluster0.6nxonq0.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db("toyGalaxy");
    const galleryCollection = database.collection("gallery");

    // Gallery Collection 
    app.get('/gallery', async(req,res) =>{
        const result = await galleryCollection.find().toArray()
        res.send(result)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req,res) =>{
    res.send("Server is running")
})

app.listen(port , (req,res) =>{
    console.log(`Server is running at port: ${port}`)
})
