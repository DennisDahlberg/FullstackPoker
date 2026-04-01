import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { User, Mail, Shield, Lock, Save, Camera, Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Profile() {
  const { data } = useAuthContext();
  const user = data?.user;

  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user?.name || "Player123",
    email: user?.email || "player@pokerai.com",
    rank: user?.rank || "Beginner",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingProfile(true);
    setTimeout(() => {
      setIsLoadingProfile(false);
      toast.success("Profile updated successfully");
    }, 1000);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setIsLoadingPassword(true);
    setTimeout(() => {
      setIsLoadingPassword(false);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated successfully");
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <User className="text-amber-500 w-8 h-8" />
            Profile Settings
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your personal information and security
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Profile Overview Banner */}
        <Card className="bg-gray-900/40 border-gray-800">
          <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 text-center sm:text-left">
            <div className="relative group cursor-pointer shrink-0">
              <Avatar className="h-28 w-28 border-4 border-gray-900 bg-gray-800 shadow-xl">
                <AvatarImage src="" alt="User avatar" />
                <AvatarFallback className="text-3xl text-gray-400 font-bold">
                  {profileData.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{profileData.username}</h3>
                <p className="text-gray-400 mt-1">{profileData.email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-medium px-3 py-1 gap-1.5 text-sm">
                  <Trophy className="w-4 h-4" />
                  {profileData.rank}
                </Badge>                
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* General Info Form */}
          <Card className="bg-gray-900/40 border-gray-800">
            <form onSubmit={handleProfileUpdate}>
              <CardHeader>
                <CardTitle className="text-white text-xl">General Information</CardTitle>
                <CardDescription className="text-gray-400">Update your basic profile details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Username
                  </label>
                  <Input 
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    placeholder="Enter your username"
                    className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                    required
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </label>
                  <Input 
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    placeholder="Enter your email address"
                    className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-gray-900 border-t border-gray-800 p-6 rounded-b-xl flex justify-end">
                <Button 
                  type="submit" 
                  disabled={isLoadingProfile} 
                  className="bg-amber-600 hover:bg-amber-700 text-white min-w-36"
                >
                  {isLoadingProfile ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Security Form */}
          <Card className="bg-gray-900/40 border-gray-800 flex flex-col">
            <form onSubmit={handlePasswordUpdate} className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-gray-400">Manage your password to keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gray-500" />
                    Current Password
                  </label>
                  <Input 
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    placeholder="••••••••"
                    className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-gray-300">New Password</label>
                    <Input 
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                      placeholder="••••••••"
                      className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-gray-300">Confirm New Password</label>
                    <Input 
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                      placeholder="••••••••"
                      className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-900 border-t border-gray-800 p-6 rounded-b-xl flex justify-end mt-auto">
                <Button 
                  type="submit" 
                  disabled={isLoadingPassword || !passwords.currentPassword || !passwords.newPassword} 
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 min-w-44"
                >
                  {isLoadingPassword ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    <><Lock className="w-4 h-4 mr-2" /> Update Password</>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

        </div>
      </div>
    </div>
  );
}