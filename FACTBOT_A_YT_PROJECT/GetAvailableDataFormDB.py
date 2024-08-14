import requests
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId

DBurl = "mongodb+srv://factboyuniverse:<pass>@factsdatabasecluster.ej0bjql.mongodb.net/"


def main():
   print("\t\t Fetching Facts From DB... \t\t")
   client = MongoClient(DBurl)
   db = client['FactsDB']
   collection = db['factsCollection']
   collection.find()
   data_count = collection.count_documents({})
   print("AVAILABLE DATA IN DB:", data_count)
   client.close()
   

main()
