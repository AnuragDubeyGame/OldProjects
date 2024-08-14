import os
import google.oauth2.credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

def delete_output_video(filename):
    try:
        os.remove(filename)
        print(f"Deleted {filename}")
    except OSError as e:
        print("Error:", e)

def upload_youtube_short(client_secrets_file, video_file_path, title, description, tags):
    # Define the scopes required for the YouTube Data API
    SCOPES = ['https://www.googleapis.com/auth/youtube.force-ssl']

    # Define the API service name and version
    API_SERVICE_NAME = 'youtube'
    API_VERSION = 'v3'

    # Authenticate and authorize the API using OAuth2 credentials
    flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, SCOPES)
    credentials = flow.run_local_server(port=0)

    youtube = build(API_SERVICE_NAME, API_VERSION, credentials=credentials)

    # Define video metadata
    video_metadata = {
        'snippet': {
            'title': title,
            'description': description,
            'tags': tags,
            'categoryId': '10',  # Category ID for Short Films
        },
        'status': {
            'privacyStatus': 'public',  # Set the privacy status (public, unlisted, private)
        }
    }

    # Upload video
    media = MediaFileUpload(video_file_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(part='snippet,status', body=video_metadata, media_body=media)

    response = None
    while response is None:
        print("Uploading video...")
        status, response = request.next_chunk()
        if status:
            print(f"Uploaded {int(status.progress() * 100)}%")

    print(f"Video upload successful! Video ID: {response['id']}")
    print("Successfully Deleted the Uploaded Video")

client_secrets_file = 'Credentials\client_secret_568046631541-ud9oskv4tv2n3i723ci60dlu5bp21ug2.apps.googleusercontent.com.json'
video_file_path = 'RandomFacts_YTShort.mp4'
description = '#shorts #short #viralshorts '
tags = []
title = "Random Facts, That You will love to Hear!"

# upload_youtube_short(client_secrets_file, video_file_path, title, description, tags)
