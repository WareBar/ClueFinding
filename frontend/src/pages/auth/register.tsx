import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { GoogleLogin } from "@react-oauth/google";

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSigningUp, setIsSigningUp] = useState(false)
  const {register, loginWithGoogle} = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSigningUp(true);

    if (!email || !password || !confirmPassword){
      toast.error("Please fill in all required fields")
      setIsSigningUp(false)
      return;
    }

    else if (password != confirmPassword){
      toast.error("Password doesnt match")
      setIsSigningUp(false)
      return;
    }

    else if(password.length < 8){
      toast.error("This password is too short, It must contain at least 8 characters")
      setIsSigningUp(false);
      return
    }



    try{
      const result = await register({email, password});
      if (result.success) {
        toast.success("Registration successful! Redirecting to home...");
        navigate("/login");
      } else {
        if (result.error && result.error.detail) {
          toast.error(result.error.detail);
        } else if (result.error && result.error.non_field_errors) {
          toast.error(result.error.non_field_errors[0]);
        } else if (result.error && result.error.email){
          toast.error(result.error.email[0])
        }
        else {
          toast.error("Registration failed. Please try again.");
        }
      }
    } catch(error){
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred during registration.");
    }
    finally{
      setIsSigningUp(false)
    }
  }

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
                      <h1 className="text-2xl font-bold">Create your account</h1>
                      <p className="text-muted-foreground text-sm text-balance">
                        Enter your email below to create your account
                      </p>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="email">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        onChange={(e)=>setEmail(e.target.value)}
                      />
                      <FieldDescription>
                        We&apos;ll use this to contact you. We will not share your
                        email with anyone else.
                      </FieldDescription>
                    </Field>
                    <Field>
                      <Field className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <Input
                          id="password" 
                          type="password" 
                          required
                          onChange={(e)=>setPassword(e.target.value)}
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="confirm-password">
                            Confirm Password
                          </FieldLabel>
                          <Input 
                          id="confirm-password" 
                          type="password" required 
                          onChange={(e)=>setConfirmPassword(e.target.value)}
                          />
                        </Field>
                      </Field>
                      <FieldDescription>
                        Must be at least 8 characters long.
                      </FieldDescription>
                    </Field>
                    <Field>
                      {
                        isSigningUp?
                        <Button
                        disabled
                        >
                        <Loader2Icon className="animate-spin w-5 h-5" />
                        <span>Signing up..</span>
                        </Button>
                        :
                        <Button type="submit">Create Account</Button>
                      }
                    </Field>
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
                      text="signup_with"
                    />
                  </Field>
                    <FieldDescription className="text-center">
                      Already have an account? <a href="#" onClick={()=>navigate("/login")}>Sign in</a>
                    </FieldDescription>
                  </FieldGroup>
                </form>
                <div className="bg-muted relative hidden md:block">
                  <img
                    src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3pxZWZ3N3Rodm1kamltNDNpMW51a21qaWtxcHpzcHB6ZGViNHZjaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1yld7nW3oQ2IyRubUm/giphy.gif"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                  />
                </div>
              </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
              By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
              and <a href="#">Privacy Policy</a>.
            </FieldDescription>
          </div>
      </div>
    </div>
  )
}


