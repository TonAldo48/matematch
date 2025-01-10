export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome to MateMatch</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Active Listings</h2>
          <p className="mt-2 text-gray-600">View and manage your housing listings</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Matches</h2>
          <p className="mt-2 text-gray-600">See who's interested in sharing housing</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="mt-2 text-gray-600">Chat with potential roommates</p>
        </div>
      </div>
    </div>
  );
}
