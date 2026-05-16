import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/context/AuthContext";
import logoImage from "@/assets/poker_logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login: logIn, refetch } = useAuthContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await logIn(email, password);
      console.log("This is the response from login:", response);

      if (response.loginBonus?.wasAwarded) {
        localStorage.setItem("loginBonus", JSON.stringify(response.loginBonus));
      }

      navigate("/dashboard");
    } catch (err) {
      if (typeof err === "string") {
        setError(err);
      } else {
        setError("An error occurred during login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8 sm:py-0">
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <img
            src={logoImage}
            alt="PokerGame Logo"
            className="w-14 h-14 mb-2"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-amber-500">
            PokerGame
          </h1>
        </div>

        {/* Login Card */}
        <Card className="bg-gray-800/80 border-gray-700/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center space-y-1 sm:space-y-2 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-white">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-400">
              Sign in to continue your poker journey
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <div className="p-2.5 sm:p-3 rounded-md bg-red-500/10 border border-red-500/50 text-red-400 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-1.5 sm:space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs sm:text-sm font-medium text-gray-300"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label
                  htmlFor="password"
                  className="text-xs sm:text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-600 hover:bg-amber-500 text-white shadow-lg py-4 sm:py-5 text-sm sm:text-base font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-gray-400 text-xs sm:text-sm">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
