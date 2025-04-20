import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <form
      action={async () => {
        "use server"
        await signIn("google")
      }}
    >
      <Button variant="sidebar" size="lg" className="cursor-pointer">
        Sign In
      </Button>
    </form>
  )
}
