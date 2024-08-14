import os
import json
import time
import random
import datetime
import requests
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
from io import BytesIO
from PIL import Image
import tweepy as tp

load_dotenv()
EmailAdd = os.environ.get("Email")
PassWord = os.environ.get("Pass")
DBurl = "mongodb+srv://factboyuniverse:<pass>@factsdatabasecluster.ej0bjql.mongodb.net/"


def PostTweet():
    dataToPost = RetrieveDataFromDB()
    PostActualTweetOnTwitter(dataToPost["Facts"], dataToPost["ImageURL"])

def PostActualTweetOnTwitter(facts, imgurl):
    download_image(imgurl, r"C:\Users\Saurabh\OneDrive\Documents\GitHub\YT_SHORTS_CREATOR-main\YT_SHORTS_CREATOR-main\FACTBOT_TWITTER_PROJECT\Img")
    client = tp.Client(
        consumer_key=os.environ.get("APIKEY"),
        consumer_secret=os.environ.get("APISECRET"),
        access_token=os.environ.get("ACCESSTOKEN"),
        access_token_secret=os.environ.get("ACCESSSECRET")
        )
    auth = tp.OAuthHandler(os.environ.get("APIKEY"), os.environ.get("APISECRET"))
    auth.set_access_token(os.environ.get("ACCESSTOKEN"), os.environ.get("ACCESSSECRET"))

    api = tp.API(auth)
    m = api.media_upload(r'C:\Users\Saurabh\OneDrive\Documents\GitHub\YT_SHORTS_CREATOR-main\YT_SHORTS_CREATOR-main\FACTBOT_TWITTER_PROJECT\Img.png')
    response = client.create_tweet(text=facts, media_ids=[m.media_id])
    print("RESPONSE : ",response)

def RetrieveDataFromDB():
   print("\t\t Fetching Facts From DB... \t\t")
   client = MongoClient(DBurl)
   db = client['FactsDB']
   collection = db['factsCollection']
   cursor = collection.find()
   first_document = cursor.next()

   document_id = ObjectId(first_document["_id"])
   result = collection.delete_one({'_id': document_id})
   if result.deleted_count == 1:
       print("Document deleted successfully : ",document_id)
   else:
       print("Document not found.")
   client.close()
   return first_document
    

def download_image(url, file_path, file_format='PNG'):
    response = requests.get(url)
    response.raise_for_status()  # Check for any errors

    # Open the image using PIL
    image = Image.open(BytesIO(response.content))

    # Save the image in the desired format
    file_extension = file_format.lower()
    if file_extension == 'jpg' or file_extension == 'jpeg':
        file_path += '.jpg'  # Append the file extension if not provided
        image.save(file_path, 'JPEG')
    elif file_extension == 'png':
        file_path += '.png'  # Append the file extension if not provided
        image.save(file_path, 'PNG')
    else:
        raise ValueError("Unsupported file format. Please specify 'PNG' or 'JPG'.")

def main():
    # Set the start and end time for posting
    start_time = datetime.time(8, 0, 0)  # 8:00 AM
    end_time = datetime.time(23, 59, 0)  # 11:00 PM

    # Set the minimum and maximum duration between each post
    min_duration = 1 * 60 # Minimum duration in mins
    max_duration = 2 * 60 # Maximum duration in mins

    # Set the number of times to post in a day
    min_posts = 10  # Minimum number of posts
    max_posts = 15  # Maximum number of posts

    # Get the current time
    current_time = datetime.datetime.now().time()

    # Check if the current time is within the posting time range
    while start_time <= current_time <= end_time:
        # Generate a random number of posts for the day
        num_posts = random.randint(min_posts, max_posts)
        print("\t\t WE WILL BE TWEETING ",num_posts," TWEETS TODAY!")

        # Generate random post times within the posting time range
        for _ in range(num_posts):
            PostTweet()
            duration = random.randint(min_duration, max_duration)
            print("\t\t WE WILL WAIT FOR ",duration / 60," MINUTES BEFORE NEXT TWEET!")
            time.sleep(duration)


        current_time = datetime.datetime.now().time()

        print("\t\t TIME OVER! WE WILL START TOMORROW AGAIN!")
        sleep_time = datetime.datetime.combine(datetime.date.today() + datetime.timedelta(days=1), start_time) - datetime.datetime.now()
        time.sleep(sleep_time.total_seconds())

main()
