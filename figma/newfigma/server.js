const express = require('express')
const cors = require('cors')

const app = express()
const port = 3001




const watches = [
    {
        id: 1,
        name: "Movado",
        brand: "Men",
        price: 30000,
        image: "https://i.imgur.com/1.png"
    },
    {
        id: 2,
        name: "Balmain",
        brand: "Men",
        price: 49995,
        image: "https://i.imgur.com/2.png"
    },
    {
        id: 3,
        name: "Guess",
        brand: "Men",
        price: 9995,
        image: "https://i.imgur.com/3.png"
    }
];

app.get("/watches", (req, res) => {
    res.json(watches);
});




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://mongoUser:mK00aROxtEzpylXF@cluster.8dqhaox.mongodb.net/?appName=Cluster";

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
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




// middleware
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})