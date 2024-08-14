import subprocess
import os

def delete_output_video(filename):
    try:
        os.remove(filename)
        print(f"Deleted {filename}")
    except OSError as e:
        print("Error:", e)

def run_script(script_name):
    try:
        subprocess.run(["python", script_name], check=True)
    except subprocess.CalledProcessError:
        print(f"Error running {script_name}")

# Run scripts sequentially
run_script("VideoGenerator.py")
run_script("srtGenerator.py")
run_script("ytUploader.py")
delete_output_video("cropped_output_video.mp4")
delete_output_video("fact.mp3")
delete_output_video("TitleArg.txt")
# delete_output_video("RandomFacts_YTShort.mp4")
