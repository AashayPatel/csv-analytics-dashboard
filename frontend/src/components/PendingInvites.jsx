import { useEffect, useState } from "react";
import axios from "axios";

const PendingInvites = ({ onInviteAccepted }) => {
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/invite/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("🎯 Pending invites:", res.data);
        setInvites(res.data.invites || []);
      } catch (err) {
        console.error("❌ Error fetching pending invites:", err);
        setInvites([]); // fallback to empty array
      }
    };
    fetchInvites();
  }, []);

  const handleAccept = async (inviteId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`http://localhost:5000/api/invite/${inviteId}/accept`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log("✅ Invite accepted:", response.data);
      
      // Remove the accepted invite from the pending list
      setInvites(prev => prev.filter(inv => inv._id !== inviteId));
      
      // Notify parent component to refresh the chart list
      if (onInviteAccepted) {
        onInviteAccepted();
      }
      
    } catch (err) {
      console.error("❌ Error accepting invite:", err);
      alert("Failed to accept invite. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!invites || invites.length === 0) return null;

  return (
    <div className="bg-yellow-100 p-4 rounded mt-4">
      <h3 className="font-semibold">Pending Invitations</h3>
      <ul className="mt-2 space-y-2">
        {invites.map(inv => (
          <li key={inv._id} className="flex justify-between items-center">
            <span>{inv.chartId?.fileName || "Unnamed Chart"} — {inv.role}</span>
            <button
              onClick={() => handleAccept(inv._id)}
              disabled={isLoading}
              className={`px-2 py-1 rounded text-white ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isLoading ? 'Accepting...' : 'Accept'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PendingInvites;