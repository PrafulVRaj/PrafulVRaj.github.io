const VIDEO_LIBRARY = [

  // ── Add your videos below ──────────────────────────────

  // { title: "My Video",  file: "my-video.mp4",   thumbnail: "videos/thumbs/my-video.jpg",  duration: "3:45" },
  // { title: "Demo Reel", file: "demo-reel.webm",  duration: "2:10" },

  // ── Example entries (remove when you add your own) ─────
  { title: "World Cup 2011",  file: "c11.mp4",  duration: "8:27" },
  { title: "Sample Clip 2",  file: "sample2.mp4",  duration: "2:15" },
  { title: "Sample Clip 3",  file: "sample3.webm", duration: "0:48" },

].map((v, i) => ({
  ...v,
  id: i,
  src: `videos/${v.file}`,
  thumbnail: v.thumbnail || null,
}));