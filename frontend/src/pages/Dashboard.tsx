import { Button } from "@/components/ui/button";
import { useFriendsHub } from "@/context/FriendsHubContext";
import { useAuthContext } from "@/context/AuthContext";

export default function Dashboard() {
  const connection = useFriendsHub();
  const { data } = useAuthContext();

  const handleInvite = () => {
    if (!connection || !data?.user) return;
    connection.invoke(
      "SendFriendInviteAsync",
      "91eed276-bdb2-4ac5-9087-4b4cdcca0fce", 
      'DentaStix'
    );
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">Dashboard</h1>
      <p>Welcome to your dashboard! Here you can manage your account and view your activity.</p>
      <Button variant="outline" className="mt-4 " onClick={handleInvite}>Invite</Button>
    </div>
  );
}