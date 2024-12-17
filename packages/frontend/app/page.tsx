export default function Home() {
  return (
    <div>
      <h1>API URL: {process.env.NEXT_PUBLIC_API_URL}</h1>
    </div>
  );
}