import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Mail,
  User,
  Share2,
  Link as LinkIcon,
  Puzzle,
  Briefcase,
  GraduationCap,
  Send,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProfileSection() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-teal-600 text-white">DN</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">David Nintang</h1>
          <p className="text-gray-500">Eng.Tech. & CS Major | Grambling 28'</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <div className="space-y-4">
            <Button variant="ghost" className="w-full justify-start">
              <Mail className="mr-2 h-4 w-4" />
              Email Addresses
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-4 w-4" />
              Personal
            </Button>
            {/* Add other buttons */}
          </div>
        </TabsContent>
        
        <TabsContent value="referrals">
          <div className="text-center py-8">
            <Send className="h-12 w-12 mx-auto mb-4 text-teal-500" />
            <p className="text-gray-600 mb-4">
              You can refer your friends to join ColorStack! When they apply using your referral, 
              they'll have a better chance of getting accepted. You'll also earn points for each 
              successful referral!
            </p>
            <Button className="bg-teal-500 hover:bg-teal-600">
              Refer a Friend
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 