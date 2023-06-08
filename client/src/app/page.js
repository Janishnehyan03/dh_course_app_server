import YoutubePlayer from "./components/YoutubePlayer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <YoutubePlayer />
    </main>
  );
}
