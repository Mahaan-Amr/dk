import { connect } from '@/lib/database';
import getBlogPostModel from '@/models/BlogPost';

/**
 * This script is designed to be run as a scheduled task (e.g., via cron)
 * It will publish any posts that have a scheduledPublishDate that has passed
 */
async function publishScheduledPosts() {
  console.log('Starting scheduled post publisher...');

  try {
    // Connect to the database
    await connect();
    console.log('Database connection established');

    // Get the BlogPost model
    const BlogPost = getBlogPostModel();

    // Use the static method defined in the model
    const result = await BlogPost.publishScheduledPosts();

    console.log(`Published scheduled posts. Updated ${result.modifiedCount} posts.`);
    return { success: true, modifiedCount: result.modifiedCount };
  } catch (error) {
    console.error('Error publishing scheduled posts:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// If this script is run directly (not imported)
if (require.main === module) {
  publishScheduledPosts()
    .then(result => {
      console.log('Finished with result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      process.exit(1);
    });
}

export default publishScheduledPosts; 