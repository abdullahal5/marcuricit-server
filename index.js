const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(
  cors({
    origin: ["http://localhost:5173", "https://marcuricit.vercel.app"],
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running");
});

const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.zelnjpd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    console.log("Connected to MongoDB!");

    const employeesCollection = client.db("marcuricit").collection("employees");

    app.post("/employees", async (req, res) => {
      const employee = req.body;
      const result = await employeesCollection.insertOne(employee);
      res.send(result);
    });

    app.get("/employees", async (req, res) => {
      const itemPerPage = parseInt(req.query.item);
      const page = parseInt(req.query.page);
      const skip = (page - 1) * itemPerPage;

      const totalItems = await employeesCollection.countDocuments();
      const totalPages = Math.ceil(totalItems / itemPerPage);

      const employees = await employeesCollection
        .find()
        .skip(skip)
        .limit(itemPerPage)
        .toArray();

      const startIndex = (page - 1) * itemPerPage + 1;

      const indexedEmployees = employees.map((employee, index) => ({
        ...employee,
        id: startIndex + index,
      }));

      res.json({
        currentPage: page,
        totalPages: totalPages,
        data: indexedEmployees,
      });
    });

    app.get("/employees/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await employeesCollection.findOne(query);
      res.send(result);
    });

    app.patch("/employees/:id", async (req, res) => {
      const body = req.body;
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateInfo = {
        $set: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          age: body.age,
          salary: body.salary,
          city: body.city,
          position: body.position,
          company: body.company,
          number: body.number,
        },
      };
      const result = await employeesCollection.updateOne(
        query,
        updateInfo,
        options
      );
      res.send(result);
    });

    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await employeesCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } finally {
  }
}
run().catch(console.dir);
