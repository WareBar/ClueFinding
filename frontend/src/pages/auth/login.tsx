import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogging, setIsLogging] = useState(false);
  const { login, loginWithGoogle} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLogging(true);

    const result = await login(email, password);
    if (result.success) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      if (result.error.detail) {
        toast.error(result.error.detail);
      } else if (result.error.non_field_errors) {
        toast.error(result.error.non_field_errors[0]);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
      setIsLogging(false);
    }

    setIsLogging(false);
  };

  //Handle Google OAuth success
  const handleGoogleSuccess = async (credentialResponse) => {
    const token = credentialResponse.credential;
    const result = await loginWithGoogle(token);

    if (result.success) {
      toast.success(`Welcome ${result.user?.username || "back"}!`);
      navigate("/");
    } else {
      toast.error(result.error?.detail || "Google login failed.");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google login was cancelled or failed.");
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-5xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form className="p-6 md:p-8" onSubmit={handleSubmit}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                      Login to your account
                    </p>
                  </div>

                  {/* Email + Password */}
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <a
                        href="#"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>

                  {/* Login button */}
                  <Field>
                    {isLogging ? (
                      <Button disabled>
                        <Loader2Icon className="animate-spin w-5 h-5" />
                        <span>Logging in..</span>
                      </Button>
                    ) : (
                      <Button type="submit">Login</Button>
                    )}
                  </Field>

                  {/* Separator */}
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                  </FieldSeparator>

                  {/* Social buttons */}
                  <Field className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      shape="circle"
                      size="large"
                      text="signin_with"
                    />
                  </Field>

                  <FieldDescription
                    className="text-center"
                    onClick={() => navigate("/signup")}
                  >
                    Don&apos;t have an account?{" "}
                    <a href="#" className="text-primary underline">
                      Sign up
                    </a>
                  </FieldDescription>
                </FieldGroup>
              </form>

              {/* Right-side image */}
              <div className="bg-muted relative hidden md:block">
                <img
                  src="https://i.pinimg.com/originals/b2/2a/a2/b22aa22b2f3f55b6468361158d52e2e7.gif"
                  alt="Image"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
              </div>
            </CardContent>
          </Card>

          <FieldDescription className="px-6 text-center">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </FieldDescription>
        </div>
      </div>
    </div>
  );
}
