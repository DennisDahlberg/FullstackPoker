import { useRef, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import Cropper from "react-easy-crop";
import { getCroppedImage } from "@/lib/getCroppedImage";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  User,
  Mail,
  Shield,
  Lock,
  Save,
  Camera,
  Trophy,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";

export default function Profile() {
  const { data } = useAuthContext();
  const user = data?.user;

  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImageSrc(reader.result as string),
      );
      reader.readAsDataURL(e.target.files[0]);
    }
    // reset to allow selecting same file again if aborted
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropComplete = async () => {
    try {
      setIsUploadingImage(true);
      const croppedBlob = await getCroppedImage(imageSrc!, croppedAreaPixels);
      const file = new File([croppedBlob], "profile.jpg", {
        type: "image/jpeg",
      });

      await api.auth.updateProfileImage(file);
      toast.success("Profile image updated successfully!");
      setImageSrc(null);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to crop or upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

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

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingUsername(true);
    
    try {
      await api.auth.updateUsername(profileData.username);
      toast.success("Username updated successfully");
    } catch (err: any) {
      console.log(err);
      toast.error(err[0]?.description || "Failed to update username");
    } finally {
      setIsLoadingUsername(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    
    try {
      await api.auth.updateEmail(profileData.email);
      toast.success("Email updated successfully");
    } catch (err: any) {
      console.log(err);
      toast.error(err[0]?.description || "Failed to update email");
    } finally {
      setIsLoadingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    try {
      setIsLoadingPassword(true);
      await api.auth.updatePassword(
        passwords.currentPassword,
        passwords.newPassword,
        passwords.confirmPassword,
      );
      toast.success("Password updated successfully");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.log(err);
      toast.error(err.message || "Failed to update password");
    } finally {
      setIsLoadingPassword(false);
    }
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
            <div className="relative group cursor-pointer shrink-0" onClick={handleImageClick}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
              />
              <Avatar className="h-28 w-28 border-4 border-gray-900 bg-gray-800 shadow-xl">
                <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
                <AvatarFallback className="text-3xl text-gray-400 font-bold">
                  {profileData.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingImage ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {profileData.username}
                </h3>
                <p className="text-gray-400 mt-1">{profileData.email}</p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 border-amber-500/20 text-amber-400 font-medium px-3 py-1 gap-1.5 text-sm"
                >
                  <Trophy className="w-4 h-4" />
                  {profileData.rank}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* General Info Form */}
          <Card className="bg-gray-900/40 border-gray-800 flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-white text-xl">
                General Information
              </CardTitle>
              <CardDescription className="text-gray-400">
                Update your basic profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Username Update */}
              <form onSubmit={handleUsernameUpdate} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Username
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value,
                        })
                      }
                      placeholder="Enter your username"
                      className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500 w-full"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isLoadingUsername}
                      className="bg-amber-600 hover:bg-amber-700 text-white sm:w-26"
                    >
                      {isLoadingUsername ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      <span>{isLoadingUsername ? "Saving..." : "Update"}</span>
                    </Button>
                  </div>
                </div>
              </form>

              <div className="border-t border-gray-800/60" />

              {/* Email Update */}
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2 text-left">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      placeholder="Enter your email address"
                      className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500 w-full"
                      required
                    />
                    <Button
                      type="submit"
                      disabled={isLoadingEmail}
                      className="bg-amber-600 hover:bg-amber-700 text-white sm:w-26"
                    >
                      {isLoadingEmail ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-1" />
                      )}
                      <span>{isLoadingEmail ? "Saving..." : "Update"}</span>
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Form */}
          <Card className="bg-gray-900/40 border-gray-800 flex flex-col">
            <form
              onSubmit={handlePasswordUpdate}
              className="flex flex-col h-full"
            >
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Security Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your password to keep your account secure.
                </CardDescription>
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
                    onChange={(e) =>
                      setPasswords({
                        ...passwords,
                        currentPassword: e.target.value,
                      })
                    }
                    placeholder="••••••••"
                    className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-gray-300">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={passwords.newPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="••••••••"
                      className="bg-gray-950 border-gray-700 text-white focus-visible:ring-amber-500"
                      required
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <label className="text-sm font-medium text-gray-300">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwords.confirmPassword}
                      onChange={(e) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: e.target.value,
                        })
                      }
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
                  disabled={
                    isLoadingPassword ||
                    !passwords.currentPassword ||
                    !passwords.newPassword
                  }
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 hover:border-gray-600 min-w-44"
                >
                  {isLoadingPassword ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                      Updating...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Update Password</span> 
                    </div>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      {/* Cropper Modal */}
      <Dialog open={!!imageSrc} onOpenChange={() => setImageSrc(null)}>
        <DialogContent className="max-w-2xl h-[500px] bg-gray-950 text-white border-gray-800">
          <div className="relative w-full h-80 mt-4">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels as any)}
              />
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => setImageSrc(null)}
              variant="ghost"
              disabled={isUploadingImage}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCropComplete}
              disabled={isUploadingImage}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isUploadingImage ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {isUploadingImage ? "Saving..." : "Save Profile Image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
