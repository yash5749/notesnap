import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../auth/useAuthActions";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    if (!email || !password) return;

    mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate("/home");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending ? "Logging in..." : "Login"}
          </Button>

          {isError && (
            <p className="text-sm text-red-600">
              {(error as Error).message || "Login failed"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
