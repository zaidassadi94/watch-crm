
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface SignupFormProps {
  onSuccess: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Create the user with metadata
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Sign up successful",
        description: "Please check your email to verify your account",
      });
      
      // Switch to login tab
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            placeholder="John"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupEmail">Email</Label>
        <Input
          id="signupEmail"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="signupPassword">Password</Label>
        <Input
          id="signupPassword"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
      </Button>
    </form>
  );
}
