const videoIntelligence = require('@google-cloud/video-intelligence');
const { serviceAccountClient } = require('./youtube');

let videoIntelligenceClient = null;

// Initialize Video Intelligence client
if (serviceAccountClient) {
  videoIntelligenceClient = new videoIntelligence.VideoIntelligenceServiceClient({
    authClient: serviceAccountClient
  });
}

// Analyze video content for labels, objects, and text
const analyzeVideo = async (videoUri, features = ['LABEL_DETECTION', 'OBJECT_TRACKING', 'TEXT_DETECTION']) => {
  if (!videoIntelligenceClient) {
    throw new Error('Video Intelligence client not initialized. Check Google Cloud credentials.');
  }

  try {
    const request = {
      inputUri: videoUri,
      features: features,
      locationId: 'us-east1' // or your preferred region
    };

    const [operation] = await videoIntelligenceClient.annotateVideo(request);
    
    // Wait for operation to complete
    const [result] = await operation.promise();

    const analysis = {
      labels: [],
      objects: [],
      text: [],
      shots: []
    };

    // Process label annotations
    if (result.annotationResults[0].shotLabelAnnotations) {
      analysis.labels = result.annotationResults[0].shotLabelAnnotations.map(annotation => ({
        description: annotation.entity.description,
        confidence: annotation.segments[0].confidence,
        startTime: annotation.segments[0].segment.startTimeOffset.seconds,
        endTime: annotation.segments[0].segment.endTimeOffset.seconds
      }));
    }

    // Process object tracking
    if (result.annotationResults[0].objectAnnotations) {
      analysis.objects = result.annotationResults[0].objectAnnotations.map(annotation => ({
        description: annotation.entity.description,
        confidence: annotation.confidence,
        frames: annotation.frames.map(frame => ({
          timestamp: frame.timeOffset.seconds,
          confidence: frame.confidence,
          boundingBox: frame.normalizedBoundingBox
        }))
      }));
    }

    // Process text detection
    if (result.annotationResults[0].textAnnotations) {
      analysis.text = result.annotationResults[0].textAnnotations.map(annotation => ({
        text: annotation.text,
        confidence: annotation.segments[0].confidence,
        startTime: annotation.segments[0].segment.startTimeOffset.seconds,
        endTime: annotation.segments[0].segment.endTimeOffset.seconds
      }));
    }

    // Process shot changes
    if (result.annotationResults[0].shotAnnotations) {
      analysis.shots = result.annotationResults[0].shotAnnotations.map(shot => ({
        startTime: shot.startTimeOffset.seconds,
        endTime: shot.endTimeOffset.seconds
      }));
    }

    return analysis;
  } catch (error) {
    console.error('Video Intelligence analysis error:', error);
    throw new Error(`Failed to analyze video: ${error.message}`);
  }
};

// Generate searchable tags from video analysis
const generateSearchTags = (analysis) => {
  const tags = new Set();

  // Add labels
  analysis.labels.forEach(label => {
    if (label.confidence > 0.7) {
      tags.add(label.description.toLowerCase());
    }
  });

  // Add objects
  analysis.objects.forEach(obj => {
    if (obj.confidence > 0.7) {
      tags.add(obj.description.toLowerCase());
    }
  });

  // Add text (first few words)
  analysis.text.slice(0, 5).forEach(textItem => {
    if (textItem.confidence > 0.7) {
      const words = textItem.text.toLowerCase().split(/\s+/).slice(0, 3);
      words.forEach(word => {
        if (word.length > 2) {
          tags.add(word);
        }
      });
    }
  });

  return Array.from(tags);
};

// Analyze video and return structured data
const analyzeVideoContent = async (videoUri) => {
  try {
    const analysis = await analyzeVideo(videoUri);
    const searchTags = generateSearchTags(analysis);
    
    return {
      analysis,
      searchTags,
      summary: {
        labelCount: analysis.labels.length,
        objectCount: analysis.objects.length,
        textCount: analysis.text.length,
        shotCount: analysis.shots.length,
        dominantLabels: analysis.labels
          .filter(label => label.confidence > 0.8)
          .slice(0, 5)
          .map(label => label.description)
      }
    };
  } catch (error) {
    console.error('Video content analysis error:', error);
    throw error;
  }
};

module.exports = {
  videoIntelligenceClient,
  analyzeVideo,
  generateSearchTags,
  analyzeVideoContent
};
