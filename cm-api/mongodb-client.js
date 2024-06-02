import { MongoClient } from "mongodb";

class MongoDBClient {
  constructor() {
    const config = {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    }

    this.client = new MongoClient(process.env.MONGODB_URI, config);
    this.collectionName = process.env.MONGODB_DB || 'scalable-shop'
    this.dbName = process.env.MONGODB_COLLECTION || 'purchases'
  }

  async find(query) {
    try {
      // Query for a movie that has the title 'Back to the Future'
      await this.client.connect()
      const db = this.client.db(this.dbName);     
      const collection = db.collection(this.collectionName);
      console.log(query)
      const result = await collection.find(query).toArray()
      return result
    } finally {
      // Ensures that the client will close when you finish/error
      await this.client.close();
    }
  }

  async insert(document) {
    try {
      await this.client.connect()
      const db = this.client.db(this.dbName);     
      const collection = db.collection(this.collectionName);

      // Insert the defined document into the collection
      const result = await collection.insertOne(document);
      // Print the ID of the inserted document
      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
      // Close the MongoDB client connection
      await this.client.close();
    }
  }
}

export default MongoDBClient;
