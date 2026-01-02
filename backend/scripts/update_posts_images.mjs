import mongoose from 'mongoose';
import Post from '../src/models/Post.js';

// Node 18+ has global fetch
async function fetchImageBuffer(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function main(){
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1/my-app';
  await mongoose.connect(uri);
  console.log('Connected to', uri);

  const posts = await Post.find({ isValidated: true }).limit(15);
  console.log('Found', posts.length, 'validated posts');

  let idx = 0;
  for(const post of posts){
    idx++;
    try{
      const seed = post._id.toString();
      const url = `https://picsum.photos/seed/${seed}/800/500`;
      console.log(`${idx}/${posts.length} Fetching ${url} for post ${post._id}`);
      const buf = await fetchImageBuffer(url);

      post.picture = buf;
      post.pictureContentType = 'image/jpeg';
      post.pictureSize = buf.length;

      await post.save();
      console.log(`Updated post ${post._id} — image ${buf.length} bytes`);
    } catch(err){
      console.error('Error updating post', post._id, err.message);
    }
  }

  await mongoose.disconnect();
  console.log('Done');
}

main().catch(e=>{console.error(e); process.exit(1)});
