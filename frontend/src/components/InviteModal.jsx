import { useState, useEffect } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./ui/select";

export default function InviteModal({ chartId, isOpen, onClose, token }) {
  const [invitedEmail, setInvitedEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [invites, setInvites] = useState([]);

  // Fetch existing invites
  useEffect(() => {
    if (!chartId || !token || !isOpen) return;

    axios
      .get(`http://localhost:5000/api/invite/chart/${chartId}/invites`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
      .then((res) => setInvites(res.data.invites || []))
      .catch((err) => {
        console.error("Error fetching invites", err);
        if (err.response?.status === 403) {
          alert("Access denied. Please check your permissions.");
        }
      });
  }, [chartId, isOpen, token]);

  const handleSendInvite = async () => {
    // Debug: Check all required fields
    console.log('Debug values:', {
      invitedEmail: invitedEmail || 'EMPTY',
      chartId: chartId || 'EMPTY',
      token: token ? 'Present' : 'MISSING',
      role: role || 'EMPTY'
    });

    if (!invitedEmail) {
      alert("Please enter an email address");
      return;
    }
    if (!chartId) {
      alert("Chart ID is missing");
      return;
    }
    if (!token) {
      alert("Authentication token is missing");
      return;
    }

    try {
      console.log('Sending invite with:', { invitedEmail, chartId, role });
      
      const res = await axios.post(
        `http://localhost:5000/api/invite`, // Use full backend URL
        { invitedEmail, chartId, role },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      setInvites((prev) => [...prev, res.data.invite]);
      setInvitedEmail("");
      setRole("viewer");
      alert("Invite sent successfully!");
    } catch (err) {
      console.error("❌ Failed to send invite", err);
      
      // More detailed error handling
      if (err.response?.status === 403) {
        alert("Access denied. You don't have permission to send invites for this chart.");
      } else if (err.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
      } else {
        alert(err.response?.data?.error || "Error sending invite");
      }
    }
  };

  const handleDeleteInvite = async (inviteId) => {
    try {
      await axios.delete(`http://localhost:5000/api/invite/${inviteId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      setInvites(invites.filter((i) => i._id !== inviteId));
    } catch (err) {
      console.error("❌ Failed to delete invite", err);
      if (err.response?.status === 403) {
        alert("Access denied. You don't have permission to delete this invite.");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>👥 Manage Team Access</DialogTitle>
        </DialogHeader>

        <DialogDescription>
            Enter an email to invite someone to collaborate on this chart.
        </DialogDescription>

        <div className="space-y-3">
          <Input
            placeholder="Teammate email"
            value={invitedEmail}
            onChange={(e) => setInvitedEmail(e.target.value)}
          />
          {/* Alternative: Native select if shadcn Select isn't working */}
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          
          {/* Original Select component - comment out if not working */}
          {/* <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <span>{role === 'editor' ? 'Editor' : 'Viewer'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select> */}
          <Button onClick={handleSendInvite}>Send Invite</Button>

          <div className="pt-4">
            <h4 className="font-medium mb-2">📋 Existing Invites</h4>
            {invites.length === 0 && <p className="text-sm text-muted-foreground">No invites sent yet.</p>}
            <ul className="space-y-2">
              {invites.map((invite) => (
                <li
                  key={invite._id}
                  className="flex justify-between items-center border rounded p-2 bg-muted"
                >
                  <div>
                    <p className="font-medium">{invite.invitedEmail}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {invite.role} | Status: {invite.status}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteInvite(invite._id)}>
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}