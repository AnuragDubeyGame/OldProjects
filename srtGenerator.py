import subprocess
import assemblyai as aai
import os

aai.settings.api_key = "291a8c32eb0c4807ad04a757d09425a6"

transcriber = aai.Transcriber()
transcript = transcriber.transcribe("fact.mp3")
srt_content = transcript.export_subtitles_srt()

# Save SRT content to a file
srt_file_path = "subtitlesText.srt"
with open(srt_file_path, "w") as f:
    f.write(srt_content)

print(f"SRT subtitles saved to {srt_file_path}")


def overlay_subtitles(input_video_path, output_video_path, subtitles_file_path):
    # FFMPEG command to overlay subtitles on the video
    ffmpeg_cmd = [
        "ffmpeg",
        "-i", input_video_path,
        "-vf", f"subtitles=subtitlesText.srt:force_style='Alignment=10,FontName=Arial,Bold=1'",  # Overlay subtitles with custom font and bold text
        "-c:a", "copy",  # Copy audio stream
        output_video_path
    ]
    
    # Run the FFMPEG command
    subprocess.run(ffmpeg_cmd, shell=True)

if __name__ == "__main__":
    input_video_path = "cropped_output_video.mp4"
    output_video_path = "RandomFacts_YTShort.mp4"
    subtitles_file_path = "subtitlesText.srt"
    
    overlay_subtitles(input_video_path, output_video_path, subtitles_file_path)

    # Remove the temporary subtitle file on Windows
    os.remove(subtitles_file_path)
