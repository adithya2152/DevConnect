import useAuthGuard from "../hooks/useAuthGuarf";
export default function Dashboard() {
    useAuthGuard();
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
      {/* Add more dashboard components here */}
    </div>
  );
}